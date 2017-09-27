(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .service('inboxJmapItemService', function($q, $rootScope, session, newComposerService, emailSendingService, backgroundAction,
                                              withJmapClient,
                                              jmap, inboxMailboxesService, infiniteListService, inboxSelectionService, asyncJmapAction, _, esnI18nService,
                                              INBOX_EVENTS, INBOX_DISPLAY_NAME_SIZE) {

      return {
        reply: reply,
        replyAll: replyAll,
        forward: forward,
        markAsUnread: markAsUnread,
        markAsRead: markAsRead,
        markAsFlagged: markAsFlagged,
        unmarkAsFlagged: unmarkAsFlagged,
        moveToTrash: moveToTrash,
        moveToMailbox: moveToMailbox,
        moveMultipleItems: moveMultipleItems,
        downloadEML: downloadEML,
        setFlag: setFlag
      };

      /////

      function _rejectIfNotFullyUpdated(response) {
        if (!_.isEmpty(response.notUpdated)) {
          return $q.reject(response);
        }
      }

      function moveToTrash(itemOrItems) {
        return inboxMailboxesService.getMailboxWithRole(jmap.MailboxRole.TRASH).then(function(mailbox) {
          return moveMultipleItems(itemOrItems, mailbox);
        });
      }

      function _updateItemMailboxIds(item, newMailboxIds) {
        item.oldMailboxIds = item.mailboxIds;
        item.mailboxIds = newMailboxIds;
      }

      function moveToMailbox(itemOrItems, mailbox) {
        var toMailboxIds = [mailbox.id],
          items = angular.isArray(itemOrItems) ? itemOrItems : [itemOrItems],
          itemsById = _.indexBy(items, function(item) {
            if (item.isUnread) {
              inboxMailboxesService.moveUnreadMessages(item.mailboxIds, toMailboxIds, 1);
            }

            _updateItemMailboxIds(item, toMailboxIds);

            return item.id;
          });

        $rootScope.$broadcast(INBOX_EVENTS.ITEM_MAILBOX_IDS_CHANGED, items);

        return asyncJmapAction({
          failure: items.length > 1 ?
            esnI18nService.translate('Some items could not be moved to "%s"', mailbox.displayName) :
            esnI18nService.translate('Cannot move "%s" to "%s"', items[0].subject, mailbox.displayName)
        }, function(client) {
          return client.setMessages({
            update: _.mapValues(itemsById, _.constant({ mailboxIds: toMailboxIds }))
          })
            .then(_rejectIfNotFullyUpdated)
            .catch(function(response) {
              var failedItems = _.map(response.notUpdated, function(error, id) {
                var item = itemsById[id];

                _updateItemMailboxIds(item, item.oldMailboxIds);

                if (item.isUnread) {
                  inboxMailboxesService.moveUnreadMessages(toMailboxIds, item.mailboxIds, 1);
                }

                return item;
              });

              $rootScope.$broadcast(INBOX_EVENTS.ITEM_MAILBOX_IDS_CHANGED, failedItems);

              return $q.reject(response);
            });
        }, { silent: true });
      }

      function moveMultipleItems(itemOrItems, mailbox) {
        var items = angular.isArray(itemOrItems) ? itemOrItems : [itemOrItems];

        inboxSelectionService.unselectAllItems();

        return infiniteListService.actionRemovingElements(function() {
          return moveToMailbox(items, mailbox);
        }, items, function(response) {
          return items.filter(function(item) {
            return response.notUpdated ? response.notUpdated[item.id] : item;
          });
        });
      }

      function reply(message) {
        emailSendingService.createReplyEmailObject(message.id, session.user).then(function(replyMessage) {
          newComposerService.open(replyMessage);
        });
      }

      function replyAll(message) {
        emailSendingService.createReplyAllEmailObject(message.id, session.user).then(function(replyMessage) {
          newComposerService.open(replyMessage);
        });
      }

      function forward(message) {
        emailSendingService.createForwardEmailObject(message.id, session.user).then(function(forwardMessage) {
          newComposerService.open(forwardMessage);
        });
      }

      function markAsUnread(itemOrItems) {
        return this.setFlag(itemOrItems, 'isUnread', true);
      }

      function markAsRead(itemOrItems) {
        return this.setFlag(itemOrItems, 'isUnread', false);
      }

      function markAsFlagged(itemOrItems) {
        return this.setFlag(itemOrItems, 'isFlagged', true);
      }

      function unmarkAsFlagged(itemOrItems) {
        return this.setFlag(itemOrItems, 'isFlagged', false);
      }

      function setFlag(itemOrItems, flag, state) {
        var items = _.isArray(itemOrItems) ? itemOrItems : [itemOrItems],
          itemsById = _.indexBy(items, function(item) {
            item[flag] = state;

            return item.id;
          });

        $rootScope.$broadcast(INBOX_EVENTS.ITEM_FLAG_CHANGED, items, flag, state);

        return asyncJmapAction({
          failure: items.length > 1 ?
            'Some items could not be updated' :
            esnI18nService.translate('Could not update "%s"', items[0].subject)
        }, function(client) {
          return client.setMessages({
            update: _.mapValues(itemsById, _.constant(_.zipObject([flag], [state])))
          })
            .then(_rejectIfNotFullyUpdated)
            .catch(function(response) {
              var failedItems = _.map(response.notUpdated, function(error, id) {
                itemsById[id][flag] = !state;

                return itemsById[id];
              });

              $rootScope.$broadcast(INBOX_EVENTS.ITEM_FLAG_CHANGED, failedItems, flag, !state);

              return $q.reject(response);
            });
        }, { silent: true });
      }

      function _truncateWithEllipsis(text, max) {return text.substr(0, max - 1) + (text.length > max ? '…' : ''); }

      function downloadEML(itemOrItems) {
        var item = _.isArray(itemOrItems) ? itemOrItems[0] : itemOrItems;
        var messageSubject = _truncateWithEllipsis(item.subject, INBOX_DISPLAY_NAME_SIZE);

        return asyncJmapAction({
          progressing: esnI18nService.translate('Downloading message "%s"...', messageSubject),
          success: esnI18nService.translate('Message "%s" successfully downloaded', messageSubject),
          failure: esnI18nService.translate('Could not download message "%s"', messageSubject)
        }, function(client) {
          var encodedSubject = encodeURIComponent((messageSubject || 'message') + '.eml');

          return new jmap.Attachment(client, item.blobId, { name: encodedSubject }).getSignedDownloadUrl();
        });
      }
    });

})();
