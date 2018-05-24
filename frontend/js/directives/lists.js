'use strict';

angular.module('linagora.esn.unifiedinbox')

  .directive('inboxDraggableListItem', function(inboxSelectionService, esnI18nService) {
    return {
      restrict: 'A',
      link: function(scope) {
        scope.getDragData = function() {
          if (inboxSelectionService.isSelecting()) {
            scope.$apply(function() {
              inboxSelectionService.toggleItemSelection(scope.item, true);
            });

            return inboxSelectionService.getSelectedItems();
          }

          return [scope.item];
        };

        scope.getDragMessage = function($dragData) {
          if ($dragData.length > 1) {
            return esnI18nService.translate('%s items', $dragData.length);
          }

          return $dragData[0].subject || esnI18nService.translate('1 item');
        };
      }
    };
  })

  .directive('inboxSwipeableListItem', function(inboxConfig) {
    return {
      restrict: 'A',
      controller: function($scope, $element) {
        $scope.onSwipeLeft = function() {
          var unregisterActionListCloseListener = $scope.$on('action-list.hide', function() {
            $scope.swipeClose();
            unregisterActionListCloseListener();
          });

          $element.controller('actionList').open();
        };
      },
      link: function(scope) {
        inboxConfig('swipeRightAction', 'markAsRead').then(function(action) {
          scope.leftTemplate = '/unifiedinbox/views/partials/swipe/left-template-' + action + '.html';
        });
      }
    };
  })

  .directive('inboxMessageListItem', function($state, $stateParams, newComposerService, _, inboxJmapItemService, inboxSwipeHelper,
                                              infiniteListService, inboxMailboxesService, inboxSelectionService, inboxPlugins) {
    return {
      restrict: 'E',
      controller: function($scope) {
        var self = this,
          account = $stateParams.account,
          context = $stateParams.context,
          plugin = inboxPlugins.get($stateParams.type);

        if (plugin) {
          plugin.resolveContextRole(account, context).then(function(role) {
            $scope.mailboxRole = role;
          });
        }

        if ($scope.item && $scope.item.to && $scope.item.cc && $scope.item.bcc) {
          $scope.emailRecipients = _.assign($scope.item.to, $scope.item.cc, $scope.item.bcc);
          $scope.emailFirstRecipient = _.first($scope.emailRecipients);
        }

        // need this scope value for action list
        $scope.email = $scope.item;

        self.select = function(item, $event) {
          $event.stopPropagation();
          $event.preventDefault();

          inboxSelectionService.toggleItemSelection(item);
        };

        self.openEmail = function(email) {
          if (email.isDraft) {
            newComposerService.openDraft(email.id);
          } else {
            // Used to fallback to the absolute state name if the transition to a relative state does not work
            // This allows us to plug '.message' states where we want and guarantee the email can still be opened
            // when coming from a state that does not get a .message child state (like search for instance)
            var unregisterStateNotFoundListener = $scope.$on('$stateNotFound', function(event, redirect) {
              redirect.to = 'unifiedinbox.inbox.message';
            });

            $state.go('.message', {
              mailbox: $stateParams.mailbox || ($scope.mailbox && $scope.mailbox.id) || _.first(email.mailboxIds),
              emailId: email.id,
              item: email
            }).finally(unregisterStateNotFoundListener);
          }
        };

        ['reply', 'replyAll', 'forward', 'markAsUnread', 'markAsRead', 'markAsFlagged', 
          'unmarkAsFlagged', 'moveToTrash', 'moveToSpam', 'unSpam'].forEach(function(action) {
          self[action] = function() {
            inboxJmapItemService[action]($scope.item);
          };
        });

        self.move = function() {
          $state.go('.move', { item: $scope.item });
        };

        $scope.onSwipeRight = inboxSwipeHelper.createSwipeRightHandler($scope, {
          markAsRead: self.markAsRead,
          moveToTrash: self.moveToTrash
        });

        function _canActionBeDone(checkFunction) {
          var message = $scope.email;

          if (context) {
            return checkFunction(context);
          }

          // unified inbox does not have any context. In that case, we get mailbox from the selected email.
          return !message || message.mailboxIds.every(function(mailboxId) {
            return checkFunction(mailboxId);
          });
        }

        self.canTrashMessages = function() {
          return _canActionBeDone(inboxMailboxesService.canTrashMessages);
        };

        self.canMoveMessagesOutOfMailbox = function() {
          return _canActionBeDone(inboxMailboxesService.canMoveMessagesOutOfMailbox);
        };

        self.canMoveMessageToSpam = function() {
          return _canActionBeDone(inboxMailboxesService.canMoveMessagesOutOfMailbox);
        };

        self.canUnSpamMessages = function() {
          return _canActionBeDone(inboxMailboxesService.canUnSpamMessages);
        };
      },
      controllerAs: 'ctrl',
      templateUrl: '/unifiedinbox/views/email/list/list-item.html'
    };
  })

  .directive('inboxSearchMessageListItem', function($q, $state, $stateParams, newComposerService, _, inboxJmapItemService, inboxMailboxesService, inboxPlugins) {
    return {
      restrict: 'E',
      controller: function($scope) {
        var self = this,
          account = $stateParams.account,
          context = $stateParams.context,
          plugin = inboxPlugins.get($stateParams.type);

        if (plugin) {
          plugin.resolveContextRole(account, context).then(function(role) {
            $scope.mailboxRole = role;
          });
        }

        if ($scope.item && $scope.item.to && $scope.item.cc && $scope.item.bcc) {
          $scope.emailRecipients = _.assign($scope.item.to, $scope.item.cc, $scope.item.bcc);
          $scope.emailFirstRecipient = _.first($scope.emailRecipients);
        }

        $scope.email = $scope.item;

        $q.all(_.map($scope.item.mailboxIds, function(mailboxId) {
          return inboxMailboxesService.assignMailbox(mailboxId, $scope, true);
        })).then(function(mailboxes) {
          $scope.item.mailboxes = mailboxes;
        });

        self.openEmail = function(email) {
          if (email.isDraft) {
            newComposerService.openDraft(email.id);
          } else {
            // Used to fallback to the absolute state name if the transition to a relative state does not work
            // This allows us to plug '.message' states where we want and guarantee the email can still be opened
            // when coming from a state that does not get a .message child state (like search for instance)
            var unregisterStateNotFoundListener = $scope.$on('$stateNotFound', function(event, redirect) {
              redirect.to = 'unifiedinbox.inbox.message';
            });

            $state.go('.message', {
              mailbox: $stateParams.mailbox || ($scope.mailbox && $scope.mailbox.id) || _.first(email.mailboxIds),
              emailId: email.id,
              item: email
            }).finally(unregisterStateNotFoundListener);
          }
        };
      },
      controllerAs: 'ctrl',
      templateUrl: '/unifiedinbox/views/email/list/search-list-item.html'
    };
  })

  .directive('inboxThreadListItem', function($state, $stateParams, newComposerService, _, inboxJmapItemService,
                                             inboxSwipeHelper, infiniteListService, inboxSelectionService, inboxPlugins) {
    return {
      restrict: 'E',
      controller: function($scope) {
        var self = this,
          account = $stateParams.account,
          context = $stateParams.context,
          plugin = inboxPlugins.get($stateParams.type);

        if (plugin) {
          plugin.resolveContextRole(account, context).then(function(role) {
            $scope.mailboxRole = role;
          });
        }

        if ($scope.item && $scope.item.lastEmail && $scope.item.lastEmail.to && $scope.item.lastEmail.cc && $scope.item.lastEmail.bcc) {
          $scope.emailRecipients = _.assign($scope.item.lastEmail.to, $scope.item.lastEmail.cc, $scope.item.lastEmail.bcc);
          $scope.emailFirstRecipient = _.first($scope.emailRecipients);
        }

        // need this scope value for action list
        $scope.thread = $scope.item;

        self.select = function(item, $event) {
          $event.stopPropagation();
          $event.preventDefault();

          inboxSelectionService.toggleItemSelection(item);
        };

        self.openThread = function(thread) {
          if (thread.lastEmail.isDraft) {
            newComposerService.openDraft(thread.lastEmail.id);
          } else {
            $state.go('.thread', {
              mailbox: $stateParams.mailbox || ($scope.mailbox && $scope.mailbox.id) || _.first(thread.lastEmail.mailboxIds),
              threadId: thread.id,
              item: thread
            });
          }
        };

        ['markAsUnread', 'markAsRead', 'markAsFlagged', 'unmarkAsFlagged', 'moveToTrash'].forEach(function(action) {
          self[action] = function() {
            inboxJmapItemService[action]($scope.item);
          };
        });

        self.move = function() {
          $state.go('.move', { item: $scope.item });
        };

        $scope.onSwipeRight = inboxSwipeHelper.createSwipeRightHandler($scope, {
          markAsRead: self.markAsRead,
          moveToTrash: self.moveToTrash
        });
      },
      controllerAs: 'ctrl',
      templateUrl: '/unifiedinbox/views/thread/list/list-item.html'
    };
  });
