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

  .directive('inboxMessageListItem', function(
    $state,
    $stateParams,
    newComposerService,
    _,
    inboxJmapItemService,
    inboxSwipeHelper,
    inboxMailboxesService,
    inboxSelectionService
  ) {
    return {
      restrict: 'E',
      controller: function($scope) {
        var self = this,
        context = $stateParams.context;

        $scope.mailbox = $stateParams.mailbox || ($scope.mailbox && $scope.mailbox.id) || ($scope.item && _.first($scope.item.mailboxIds));
        // need this scope value for action list
        $scope.email = $scope.item;

        self.select = function(item, $event) {
          $event.stopPropagation();
          $event.preventDefault();

          if ($event.shiftKey) {
            inboxSelectionService.groupSelection(item);
          } else {
            inboxSelectionService.toggleItemSelection(item);
          }
        };

        self.openDraft = function(emailId) {
          newComposerService.openDraft(emailId);
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

  .directive('inboxSearchMessageListItem', function($q, $state, $stateParams, newComposerService, _, inboxJmapItemService,
                                                    inboxMailboxesService, inboxPlugins) {
    return {
      restrict: 'E',
      controller: function($scope) {
        var self = this,
          account = $stateParams.account,
          context = $stateParams.context || ($scope.item && _.first($scope.item.mailboxIds)),
          plugin = inboxPlugins.get('jmap');

        if (plugin) {
          plugin.resolveContextRole(account, context).then(function(role) {
            $scope.mailboxRole = role;
          });
        }

        $scope.mailbox = $stateParams.mailbox || ($scope.mailbox && $scope.mailbox.id) || ($scope.item && _.first($scope.item.mailboxIds));
        $scope.email = $scope.item;

        $q.all(_.map($scope.item.mailboxIds, function(mailboxId) {
          return inboxMailboxesService.assignMailbox(mailboxId, $scope, true);
        })).then(function(mailboxes) {
          $scope.item.mailboxes = mailboxes;
        });

        self.openDraft = function(emailId) {
          newComposerService.openDraft(emailId);
        };
      },
      controllerAs: 'ctrl',
      templateUrl: '/unifiedinbox/views/email/list/search-list-item.html'
    };
  })

  .directive('inboxThreadListItem', function($state, $stateParams, newComposerService, _, inboxJmapItemService,
                                             inboxSwipeHelper, inboxSelectionService) {
    return {
      restrict: 'E',
      controller: function($scope) {
        var self = this;

        $scope.mailbox = $stateParams.mailbox || ($scope.mailbox && $scope.mailbox.id) || ($scope.item && _.first($scope.item.lastEmail.mailboxIds));
        // need this scope value for action list
        $scope.thread = $scope.item;

        self.select = function(item, $event) {
          $event.stopPropagation();
          $event.preventDefault();

          inboxSelectionService.toggleItemSelection(item);
        };

        self.openDraft = function(threadId) {
          newComposerService.openDraft(threadId);
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
