'use strict';

angular.module('linagora.esn.unifiedinbox')

  .factory('inboxJmapProviderContextBuilder', function(_, $q, inboxMailboxesService, inboxJmapProviderFilterBuilder, jmap, PROVIDER_TYPES) {

    function quickFilterQueryBuilder(opt) {
      return inboxMailboxesService.getMessageListFilter(opt.context).then(function(mailboxFilter) {
        return angular.extend(mailboxFilter, opt.filterByType[PROVIDER_TYPES.JMAP], { text: opt.quickFilter });
      });
    }

    function buildAddressesFilterConditions(query) {
      var filter = {},
        hasEmail = function(obj) { return _.isString(obj.email); }

      if (_.isArray(query.to)) {
        filter.to = query.to
          .filter(hasEmail)
          .map(function(recipient) { return recipient.email.trim(); });
      }
      if (_.isArray(query.from)) {
        filter.from = query.from
          .filter(hasEmail)
          .map(function(sender) { return sender.email.trim(); });
      }

      return filter;
    }

    function buildKeywordsFilterConditions(query) {
      var filterPropsAsArray = ['subject', 'contains', 'excluded', 'body']
        .filter(function(criterion) {
          return query[criterion] && _.isString(query[criterion]);
        })
        .map(function(criterion) {
          return {
            propName: criterion,
            keywords: _.compact(query[criterion].split(' ').map(function(keyword) { return keyword.trim(); }))
          };
        });

      return _.zipObject(
        _.map(filterPropsAsArray, 'propName'),
        _.map(filterPropsAsArray, 'keywords')
      );
    }

    function mapToAdvancedFilter(query) {
      var filter = {
        hasAttachment: query.hasAttachment && [true]
      };

      filter = _.assign(filter, buildAddressesFilterConditions(query));
      filter = _.assign(filter, buildKeywordsFilterConditions(query));

      return filter;
    }

    function handleAdvancedFilters(query) {
      return $q.when(inboxJmapProviderFilterBuilder(mapToAdvancedFilter(query)));
    }

    return function(options) {
      if (_.isString(options.query)) {
        // "simple" queries
        return $q.when({text: options.query});
      }
      if (_.isObject(options.query)) {
        // advanced search queries
        return handleAdvancedFilters(options.query);
      }
      return quickFilterQueryBuilder(options);
    };
  })

  .factory('inboxJmapProviderFilterBuilder', function(_) {
    return function(emailSearchOptions) {
      function pairFrom(criterion, value) { return _.zipObject([criterion], [value]); }

      function buildDefaultCriterionFilter(criterion) {
        if (_.size(emailSearchOptions[criterion]) > 1) {
          return {
            operator: 'AND',
            conditions: emailSearchOptions[criterion].map(_.partial(pairFrom, criterion))
          };
        }
        return pairFrom(criterion, _.head(emailSearchOptions[criterion]));
      }

      function buildKeywordsFilter(criterion) {
        return {
          operator: criterion === 'excluded' ? 'NOT' : 'AND',
          conditions: emailSearchOptions[criterion].map(_.partial(pairFrom, 'text'))
        };
      }

      function buildCriterionFilter(criterion) {
        if (_.contains(['excluded', 'contains'], criterion)) {
          return buildKeywordsFilter(criterion);
        }

        return buildDefaultCriterionFilter(criterion);
      }

      function hasFoundCriteriaInQuery(criterion) {
        return _.has(emailSearchOptions, criterion) &&
          _.isArray(emailSearchOptions[criterion]) &&
          !_.isEmpty(emailSearchOptions[criterion]);
      }
      var criterionFiltersCombiner = function(acc, c) { return [].concat(acc, [c]); };

      var criteriaFilters = ['to', 'from', 'subject', 'cc', 'bcc', 'body', 'hasAttachment', 'contains', 'excluded']
        .filter(hasFoundCriteriaInQuery)
        .map(buildCriterionFilter)
        .reduce(criterionFiltersCombiner, []);

      return _.size(criteriaFilters) > 1 ? { operator: 'AND', conditions: criteriaFilters} : _.head(criteriaFilters) || {};
    };
  })

  .factory('inboxProviders', function(Providers) {
    return new Providers();
  })

  .factory('inboxNewMessageProvider', function($q, withJmapClient, pagedJmapRequest, inboxJmapProviderContextBuilder,
                                               esnSearchProvider, sortByDateInDescendingOrder, inboxMailboxesService, _,
                                               JMAP_GET_MESSAGES_LIST, ELEMENTS_PER_REQUEST, PROVIDER_TYPES) {
    return function(templateUrl, emailTransform) {
      return new esnSearchProvider({
        type: PROVIDER_TYPES.JMAP,
        activeOn: ['unifiedinbox'],
        name: 'Emails',
        fetch: function(context) {
          function getMessages(position, dateOfMostRecentItem) {
            return withJmapClient(function(client) {
              return client.getMessageList({
                filter: dateOfMostRecentItem ? angular.extend({}, context, { after: dateOfMostRecentItem }) : context,
                sort: ['date desc'],
                collapseThreads: false,
                fetchMessages: false,
                position: position,
                limit: ELEMENTS_PER_REQUEST
              })
                .then(function(messageList) {
                  if (messageList.messageIds.length === 0) {
                    return [];
                  }

                  return messageList.getMessages({ properties: JMAP_GET_MESSAGES_LIST });
                })
                .then(function(messages) {
                  return messages.sort(sortByDateInDescendingOrder); // We need to sort here because the backend might return shuffled messages
                })
                .then(function(messages) {
                  return emailTransform ? messages.map(emailTransform) : messages;
                });
            });
          }

          var fetcher = pagedJmapRequest(getMessages);

          function rejectItemById(item) {
            return function(items) {
               return item ? _.reject(items, { id: item.id }) : items;
            };
          }

          fetcher.loadRecentItems = function(mostRecentItem) {
            return getMessages(0, mostRecentItem.date)
              .then(rejectItemById(mostRecentItem))
              .then(function(messages) {
                messages.forEach(function(message) {
                  if (message.isUnread) {
                    inboxMailboxesService.flagIsUnreadChanged(message, true);
                  }
                });

              return messages;
            });
          };

          return fetcher;
        },
        buildFetchContext: inboxJmapProviderContextBuilder,
        itemMatches: function(item, filters) {
          return $q(function(resolve, reject) {
            var context = filters.context,
                mailboxIds = item.mailboxIds,
                filter = filters.filterByType[PROVIDER_TYPES.JMAP];

            inboxMailboxesService.getMessageListFilter(context).then(function(mailboxFilter) {
              if ((_.isEmpty(mailboxFilter.notInMailboxes) || _.intersection(mailboxIds, mailboxFilter.notInMailboxes).length === 0) &&
                  (_.isEmpty(mailboxFilter.inMailboxes) || _.intersection(mailboxIds, mailboxFilter.inMailboxes).length > 0) &&
                  (!mailboxFilter.header || item.headers[mailboxFilter.header]) &&
                  (_.isEmpty(filter) || _.find([item], filter))) {
                return resolve();
              }

              reject();
            });
          });
        },
        templateUrl: templateUrl,
        searchTemplateUrl: '/unifiedinbox/app/components/search/search-form-template.html'
      });
    };
  })

  .factory('inboxHostedMailMessagesProvider', function(inboxNewMessageProvider, computeUniqueSetOfRecipients) {
    return inboxNewMessageProvider('/unifiedinbox/views/unified-inbox/elements/message', computeUniqueSetOfRecipients);
  })

  .factory('inboxSearchResultsProvider', function(inboxNewMessageProvider, computeUniqueSetOfRecipients) {
    return inboxNewMessageProvider('/unifiedinbox/views/unified-inbox/elements/search', computeUniqueSetOfRecipients);
  })

  .factory('inboxHostedMailAttachmentProvider', function(withJmapClient, pagedJmapRequest, newProvider, ByDateElementGroupingTool,
                                                         inboxFilteringService, inboxMailboxesService, inboxJmapProviderContextBuilder,
                                                         JMAP_GET_MESSAGES_ATTACHMENTS_LIST, ELEMENTS_PER_REQUEST, PROVIDER_TYPES) {
    return newProvider({
      type: PROVIDER_TYPES.JMAP,
      name: 'Attachments',
      fetch: function(filter) {
        return pagedJmapRequest(function(position) {
          return withJmapClient(function(client) {
            return client.getMessageList({
              filter: angular.extend(filter, { hasAttachment: true}),
              sort: ['date desc'],
              collapseThreads: false,
              fetchMessages: false,
              position: position,
              limit: ELEMENTS_PER_REQUEST
            })
              .then(function(messageList) {
                return messageList.getMessages({ properties: JMAP_GET_MESSAGES_ATTACHMENTS_LIST });
              });
          });
        });
      },
      buildFetchContext: function(options) {
        return (options.id && inboxMailboxesService.getMessageListFilter(options.id)) || inboxJmapProviderContextBuilder(options);
      },
      templateUrl: '/unifiedinbox/views/components/sidebar/attachment/sidebar-attachment-item'
    });
  })

  .factory('inboxHostedMailThreadsProvider', function($q, withJmapClient, pagedJmapRequest, _, inboxJmapProviderContextBuilder,
                                                      newProvider, JMAP_GET_MESSAGES_LIST, ELEMENTS_PER_REQUEST, PROVIDER_TYPES) {
    function _prepareThreads(data) {
      var threads = data[0],
          messages = data[1];

      messages.forEach(function(message) {
        _.find(threads, { id: message.threadId }).emails = [message];
      });

      return threads;
    }

    return newProvider({
      type: PROVIDER_TYPES.JMAP,
      name: 'inboxHostedMailThreadsProvider',
      fetch: function(filter) {
        return pagedJmapRequest(function(position) {
          return withJmapClient(function(client) {
            return client.getMessageList({
              filter: filter,
              sort: ['date desc'],
              collapseThreads: true,
              fetchThreads: false,
              fetchMessages: false,
              position: position,
              limit: ELEMENTS_PER_REQUEST
            })
              .then(function(messageList) {
                return $q.all([
                  messageList.getThreads({ fetchMessages: false }),
                  messageList.getMessages({ properties: JMAP_GET_MESSAGES_LIST })
                ]);
              })
              .then(_prepareThreads);
          });
        });
      },
      buildFetchContext: inboxJmapProviderContextBuilder,
      templateUrl: '/unifiedinbox/views/unified-inbox/elements/thread'
    });
  })

  .factory('pagedJmapRequest', function() {
    return function(loadNextItems) {
      var position = 0;

      return function() {
        return loadNextItems(position)
          .then(function(results) {
            position += results.length;

            return results;
          });
      };
    };
  })

  .factory('computeUniqueSetOfRecipients', function() {
    return function(item) {
      if (item && item.to && item.cc && item.bcc) {
        item.emailRecipients = _.chain(_.union(item.to, item.cc, item.bcc))
          .uniq(false, function(adr) { return adr.email; })
          .value();
        item.emailFirstRecipient = _.first(item.emailRecipients);
      }
      return item;
    };
  });
