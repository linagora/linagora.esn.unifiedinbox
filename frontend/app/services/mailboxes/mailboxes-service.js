(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .constant('INBOX_RESTRICTED_MAILBOXES', [
      'outbox',
      'drafts'
    ])

    .factory('inboxMailboxesService', function($q, _, withJmapClient, jmap, asyncJmapAction,
                                               inboxSpecialMailboxes, inboxMailboxesCache, inboxConfig, inboxSharedMailboxesService,
                                               esnI18nService, MAILBOX_LEVEL_SEPARATOR, INBOX_RESTRICTED_MAILBOXES) {

      var mailboxesListAlreadyFetched = false;

      return {
        filterSystemMailboxes: filterSystemMailboxes,
        assignMailboxesList: assignMailboxesList,
        assignMailbox: assignMailbox,
        flagIsUnreadChanged: flagIsUnreadChanged,
        moveUnreadMessages: moveUnreadMessages,
        canMoveMessage: canMoveMessage,
        getMessageListFilter: getMessageListFilter,
        createMailbox: createMailbox,
        destroyMailbox: destroyMailbox,
        updateMailbox: updateMailbox,
        isRestrictedMailbox: isRestrictedMailbox,
        getMailboxWithRole: getMailboxWithRole,
        updateTotalMessages: updateTotalMessages,
        emptyMailbox: emptyMailbox,
        markAllAsRead: markAllAsRead,
        sharedMailboxesList: sharedMailboxesList
      };

      /////

      function filterSystemMailboxes(mailboxes) {
        return _.reject(mailboxes, function(mailbox) { return mailbox.role.value; });
      }

      function qualifyMailbox(mailbox) {
        mailbox.level = 1;
        mailbox.qualifiedName = mailbox.name;

        var parent = _findMailboxInCache(mailbox.parentId);

        while (parent) {
          mailbox.qualifiedName = parent.name + MAILBOX_LEVEL_SEPARATOR + mailbox.qualifiedName;
          mailbox.level++;

          parent = _findMailboxInCache(parent.parentId);
        }

        return mailbox;
      }

      function _translateMailboxes(mailboxes) {
        return _.each(mailboxes, _translateMailbox);
      }

      function _translateMailbox(mailbox) {
        if (mailbox && mailbox.role && mailbox.role.value) {
          mailbox.name = esnI18nService.translate(mailbox.name).toString();
        }

        return mailbox;
      }

      function _shouldMailboxBeHidden(hiddenMailboxes, mailbox) {
        return inboxSharedMailboxesService.isShared(mailbox) &&
          _.has(hiddenMailboxes, mailbox.id);
      }

      function _getInvisibleItems() {
        return inboxSharedMailboxesService.getHiddenMaiboxesConfig();
      }

      function _addSharedMailboxVisibility(mailboxes) {
        return _getInvisibleItems()
          .then(function(invisibleItems) {
            return _shouldMailboxBeHidden.bind(null, invisibleItems);
          })
          .then(function(shouldHide) {
            return _.forEach(mailboxes, function(mailbox) {
              if (shouldHide(mailbox)) {
                mailbox.isDisplayed = false;
              }
            });
          });
      }

      function _updateUnreadMessages(mailboxIds, adjust) {
        mailboxIds.forEach(function(id) {
          var mailbox = _findMailboxInCache(id);

          if (mailbox) {
            mailbox.unreadMessages = Math.max(mailbox.unreadMessages + adjust, 0);
          }
        });
      }

      function _updateTotalMessages(mailboxIds, adjust) {
        mailboxIds.forEach(function(id) {
          var mailbox = _findMailboxInCache(id);

          if (mailbox) {
            mailbox.totalMessages = Math.max(mailbox.totalMessages + adjust, 0);
          }
        });
      }

      function _updateMailboxCache(mailboxes) {
        if (!angular.isArray(mailboxes)) {
          mailboxes = [mailboxes];
        }

        mailboxes.forEach(function(mailbox) {
          var targetIndexInCache = _getMailboxIndexInCache(mailbox.id);

          inboxMailboxesCache[targetIndexInCache] = mailbox;
        });

        inboxMailboxesCache.forEach(function(mailbox, index, cache) {
          cache[index] = qualifyMailbox(mailbox);
        });

        return inboxMailboxesCache.sort(_sortBySortOrderAndQualifiedName);
      }

      function _sortBySortOrderAndQualifiedName(a, b) {
        return a.sortOrder - b.sortOrder || (a.qualifiedName < b.qualifiedName ? -1 : 1);
      }

      function _findMailboxInCache(id) {
        return id && _.find(inboxMailboxesCache, { id: id });
      }

      function _removeMailboxesFromCache(ids) {
        if (!angular.isArray(ids)) {
          ids = [ids];
        }

        return _.remove(inboxMailboxesCache, function(mailbox) {
          return _.indexOf(ids, mailbox.id) > -1;
        });
      }

      function _assignToObject(object, attr) {
        return function(value) {
          if (object && !object[attr]) {
            object[attr] = value;
          }

          return value;
        };
      }

      function assignMailbox(id, dst, useCache) {
        var localMailbox = inboxSpecialMailboxes.get(id) || (useCache && _findMailboxInCache(id));

        if (localMailbox) {
          return $q.when(_assignToObject(dst, 'mailbox')(localMailbox));
        }

        return withJmapClient(function(client) {
          return client.getMailboxes({ ids: [id] })
            .then(_.head) // We expect a single mailbox here
            .then(_translateMailbox)
            .then(_updateMailboxCache)
            .then(_findMailboxInCache.bind(null, id))
            .then(_assignToObject(dst, 'mailbox'));
        });
      }

      function assignMailboxesList(dst, filter) {
        return _getAllMailboxes(filter).then(_assignToObject(dst, 'mailboxes'));
      }

      function sharedMailboxesList() {
        return _getAllMailboxes().then(function(mailboxes) {
          return _.filter(mailboxes, inboxSharedMailboxesService.isShared);
        });
      }

      function _getAllMailboxes(filter) {
        if (mailboxesListAlreadyFetched) {
          return $q.when(inboxMailboxesCache).then(filter || _.identity);
        }

        return withJmapClient(function(jmapClient) {
          return jmapClient.getMailboxes()
            .then(function(mailboxes) {
              mailboxesListAlreadyFetched = true;

              return mailboxes;
            })
            .then(_translateMailboxes)
            .then(_addSharedMailboxVisibility)
            .then(_updateMailboxCache)
            .then(filter || _.identity);
        });
      }

      function flagIsUnreadChanged(email, status) {
        if (email && angular.isDefined(status)) {
          _updateUnreadMessages(email.mailboxIds, status ? 1 : -1);
        }
      }

      function moveUnreadMessages(fromMailboxIds, toMailboxIds, numberOfUnreadMessage) {
        _updateUnreadMessages(fromMailboxIds, -numberOfUnreadMessage);
        _updateUnreadMessages(toMailboxIds, numberOfUnreadMessage);
      }

      function updateTotalMessages(fromMailboxIds, toMailboxIds, numberOfUnreadMessage) {
        _updateTotalMessages(fromMailboxIds, -numberOfUnreadMessage);
        _updateTotalMessages(toMailboxIds, numberOfUnreadMessage);
      }

      function isRestrictedMailbox(mailbox) {
        if (mailbox && mailbox.role) {
          return INBOX_RESTRICTED_MAILBOXES.indexOf(mailbox.role.value) > -1;
        }

        return false;
      }

      function canMoveMessage(message, toMailbox) {
        // do not allow moving draft message
        if (message.isDraft) {
          return false;
        }

        // do not allow moving to the same mailbox
        if (message.mailboxIds.indexOf(toMailbox.id) > -1) {
          return false;
        }

        // do not allow moving to special mailbox
        if (_isSpecialMailbox(toMailbox.id)) {
          return false;
        }

        // do not allow moving to restricted mailboxes
        if (isRestrictedMailbox(toMailbox)) {
          return false;
        }

        // do not allow moving out restricted mailboxes
        return message.mailboxIds.every(function(mailboxId) {
          return !isRestrictedMailbox(_.find(inboxMailboxesCache, { id: mailboxId }));
        });

      }

      function getMessageListFilter(mailboxId) {
        if (!mailboxId) {
          return getMailboxWithRole(jmap.MailboxRole.INBOX).then(function(mailbox) {
            return { inMailboxes: [mailbox.id] };
          });
        }

        var filter,
            specialMailbox = inboxSpecialMailboxes.get(mailboxId);

        if (specialMailbox) {
          filter = specialMailbox.filter;

          if (filter && filter.unprocessed) {
            return $q.all([
              rolesToIds(filter.notInMailboxes),
              rolesToIds(filter.inMailboxes)
            ])
              .then(function(results) {
                delete filter.unprocessed;

                filter.notInMailboxes = results[0];
                filter.inMailboxes = results[1];

                return filter;
              });
          }
        } else {
          filter = { inMailboxes: [mailboxId] };
        }

        return $q.when(filter);
      }

      function rolesToIds(roles) {
        if (!roles) {
          return $q.when([]);
        }

        return $q.all(roles.map(jmap.MailboxRole.fromRole).map(getMailboxWithRole))
          .catch(_.constant([]))
          .then(function(mailboxes) {
            return _(mailboxes).filter(Boolean).map('id').value();
          });
      }

      function _isSpecialMailbox(mailboxId) {
        return !!inboxSpecialMailboxes.get(mailboxId);
      }

      function createMailbox(mailbox, onFailure) {
        return asyncJmapAction({
          success: esnI18nService.translate('Created folder %s', mailbox.name),
          progessing: esnI18nService.translate('Folder %s is being created...', mailbox.name),
          failure: esnI18nService.translate('Failed to create folder %s', mailbox.name)
        }, function(client) {
          return client.createMailbox(mailbox.name, mailbox.parentId);
        }, {
          onFailure: onFailure
        })
          .then(_updateMailboxCache);
      }

      function destroyMailbox(mailbox) {
        var ids = _(mailbox.descendants)
          .map(_.property('id'))
          .reverse()
          .push(mailbox.id)
          .value(); // According to JMAP spec, the X should be removed before Y if X is a descendent of Y

        return asyncJmapAction({
          success: esnI18nService.translate('Deleted folder %s', mailbox.displayName),
          progessing: esnI18nService.translate('Folder %s is being deleted...', mailbox.displayName),
          failure: esnI18nService.translate('Failed to delete folder %s', mailbox.displayName)
        }, function(client) {
          return client.setMailboxes({ destroy: ids })
            .then(function(response) {
              _removeMailboxesFromCache(response.destroyed);

              if (response.destroyed.length !== ids.length) {
                return $q.reject('Expected ' + ids.length + ' successfull deletions, but got ' + response.destroyed.length + '.');
              }
            });
        });
      }

      function updateMailbox(oldMailbox, newMailbox) {
        return asyncJmapAction({
          success: esnI18nService.translate('Folder %s is modified', oldMailbox.displayName),
          progressing: esnI18nService.translate('Folder %s is being modified...', oldMailbox.displayName),
          failure: esnI18nService.translate('Failed to modify folder %s', oldMailbox.displayName)
        }, function(client) {
          return client.updateMailbox(oldMailbox.id, {
            name: newMailbox.name,
            parentId: newMailbox.parentId,
            sharedWith: newMailbox.sharedWith
          });
        })
          .then(_.assign.bind(null, oldMailbox, newMailbox))
          .then(_updateMailboxCache);
      }

      function getMailboxWithRole(role) {
        return _getAllMailboxes(function(mailboxes) {
          return _.filter(mailboxes, { role: role });
        }).then(_.head);
      }

      function markAllAsRead(mailboxId) {
        var index = _.findIndex(inboxMailboxesCache, { id: mailboxId }),
            targetIndexInCache = index > -1 ? index : inboxMailboxesCache.length;

        inboxMailboxesCache[targetIndexInCache].unreadMessages = 0;

        return inboxMailboxesCache[targetIndexInCache];
      }

      function emptyMailbox(mailboxId) {
        var targetIndexInCache = _getMailboxIndexInCache(mailboxId);

        inboxMailboxesCache[targetIndexInCache].unreadMessages = 0;
        inboxMailboxesCache[targetIndexInCache].totalMessages = 0;

        return inboxMailboxesCache[targetIndexInCache];
      }

      function _getMailboxIndexInCache(mailboxId) {
        var index = _.findIndex(inboxMailboxesCache, { id: mailboxId });

        return index > -1 ? index : inboxMailboxesCache.length;
      }
    });

})();
