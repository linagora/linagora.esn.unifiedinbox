'use strict';

angular.module('linagora.esn.unifiedinbox')

  .controller('unifiedInboxController', function($timeout, $interval, $scope, $stateParams, infiniteScrollHelperBuilder, inboxProviders, inboxSelectionService, infiniteListService,
                                                 PageAggregatorService, _, sortByDateInDescendingOrder, inboxFilteringService, inboxAsyncHostedMailControllerHelper,
                                                 inboxFilteredList, ELEMENTS_PER_PAGE, INFINITE_LIST_EVENTS, INBOX_EVENTS, INFINITE_LIST_POLLING_INTERVAL) {
    setupPolling();

    inboxSelectionService.unselectAllItems();

    inboxFilteringService.setProviderFilters({
      types: $stateParams.type ? [$stateParams.type] : null,
      accounts: $stateParams.account ? [$stateParams.account] : null,
      context: $stateParams.context
    });

    $scope.filters = inboxFilteringService.getAvailableFilters();
    $scope.loadMoreElements = infiniteScrollHelperBuilder($scope, function() { return $scope.loadNextItems(); }, inboxFilteredList.addAll);
    $scope.inboxList = inboxFilteredList.list();
    $scope.inboxListModel = inboxFilteredList.asMdVirtualRepeatModel($scope.loadMoreElements);

    $scope.$on(INBOX_EVENTS.FILTER_CHANGED, updateFetchersInScope);

    inboxAsyncHostedMailControllerHelper(this, updateFetchersInScope);

    /////

    function setupPolling() {
      if (INFINITE_LIST_POLLING_INTERVAL > 0) {
        var poller = $interval(function() {
          $scope.loadRecentItems().then(inboxFilteredList.addAll);
        }, INFINITE_LIST_POLLING_INTERVAL);

        $scope.$on('$destroy', function() {
          $interval.cancel(poller);
        });
      }
    }

    function updateFetchersInScope() {
      $scope.infiniteScrollDisabled = false;
      $scope.infiniteScrollCompleted = false;

      return buildFetcher().then(function(fetcher) {
        $scope.loadNextItems = fetcher;
        $scope.loadRecentItems = fetcher.loadRecentItems;

        $timeout($scope.loadMoreElements, 0);
      });
    }

    function buildFetcher() {
      return inboxProviders.getAll(inboxFilteringService.getAllProviderFilters()).then(function(providers) {
        return new PageAggregatorService('unifiedInboxControllerAggregator', providers, {
          compare: sortByDateInDescendingOrder,
          results_per_page: ELEMENTS_PER_PAGE
        }).bidirectionalFetcher();
      });
    }
  })

  .controller('composerController', function($scope, $stateParams, notificationFactory,
                                            Composition, jmap, withJmapClient, fileUploadService, $filter,
                                            attachmentUploadService, _, inboxConfig, inboxIdentitiesService, esnI18nService,
                                            DEFAULT_FILE_TYPE, DEFAULT_MAX_SIZE_UPLOAD, INBOX_SUMMERNOTE_OPTIONS, INBOX_SIGNATURE_SEPARATOR) {
    var self = this,
        disableImplicitSavesAsDraft = false,
        composition;

    function _updateAttachmentStatus() {
      $scope.attachmentStatus = {
        number: _.filter($scope.email.attachments, { isInline: false }).length,
        uploading: _.some($scope.email.attachments, { status: 'uploading' }),
        error: _.some($scope.email.attachments, { status: 'error' })
      };
    }

    this.getComposition = function() {
      return composition;
    };

    this.initCtrl = function(email, options) {
      return this.initCtrlWithComposition(new Composition(email, options));
    };

    this.initCtrlWithComposition = function(comp) {
      composition = comp;
      $scope.email = composition.getEmail();

      _updateAttachmentStatus();

      return inboxIdentitiesService.getAllIdentities()
        .then(function(identities) {
          self.identities = identities;

          // This will be improved in the future if we support a "preferred" identity (which might not be the default one)
          // For now we always pre-select the default identity
          $scope.email.identity = _.find(identities, $scope.email.identity ? { id: $scope.email.identity.id } : { isDefault: true });
        })
        .then(function() {
          if ($scope.updateIdentity) {
            $scope.updateIdentity();
          }
        });
    };

    this.getIdentityLabel = function(identity) {
      return identity.name + ' <' + identity.email + '>';
    };

    this.getIdentitySignature = function(identity) {
      return INBOX_SIGNATURE_SEPARATOR + identity.textSignature;
    };

    this.saveDraft = function() {
      disableImplicitSavesAsDraft = true;

      return composition.saveDraft();
    };

    function newAttachment(client, file) {
      var attachment = new jmap.Attachment(client, '', {
        name: file.name,
        size: file.size,
        type: file.type || DEFAULT_FILE_TYPE
      });

      attachment.getFile = function() {
        return file;
      };

      return attachment;
    }

    this.upload = function(attachment) {
      var uploader = fileUploadService.get(attachmentUploadService),
          uploadTask = uploader.addFile(attachment.getFile()); // Do not start the upload immediately

      attachment.status = 'uploading';
      attachment.upload = {
        progress: 0,
        cancel: uploadTask.cancel
      };
      attachment.upload.promise = uploadTask.defer.promise.then(function(task) {
        attachment.status = 'uploaded';
        attachment.blobId = task.response.blobId;
        attachment.url = task.response.url;

        if (!disableImplicitSavesAsDraft) {
          composition.saveDraftSilently();
        }
      }, function() {
        attachment.status = 'error';
      }, function(uploadTask) {
        attachment.upload.progress = uploadTask.progress;
      }).finally(_updateAttachmentStatus);

      _updateAttachmentStatus();
      uploader.start(); // Start transferring data
    };

    this.onAttachmentsSelect = function($files) {
      if (!$files || $files.length === 0) {
        return;
      }

      $scope.email.attachments = $scope.email.attachments || [];

      return withJmapClient(function(client) {
        return inboxConfig('maxSizeUpload', DEFAULT_MAX_SIZE_UPLOAD).then(function(maxSizeUpload) {
          var humanReadableMaxSizeUpload = $filter('bytes')(maxSizeUpload);

          $files.forEach(function(file) {
            if (file.size > maxSizeUpload) {
              return notificationFactory.weakError('',
                esnI18nService.translate('File %s ignored as its size exceeds the %s limit', file.name, humanReadableMaxSizeUpload)
              );
            }

            var attachment = newAttachment(client, file);

            $scope.email.attachments.push(attachment);
            self.upload(attachment);
          });
        });
      });
    };

    function _cancelAttachment(attachment) {
      attachment.upload && attachment.upload.cancel();
      _updateAttachmentStatus();
    }

    this.removeAttachment = function(attachment) {
      _.pull($scope.email.attachments, attachment);
      _cancelAttachment(attachment);

      composition.saveDraftSilently();
    };

    if ($stateParams.composition) {
      this.initCtrlWithComposition($stateParams.composition);
    } else if ($stateParams.email) {
      this.initCtrl($stateParams.email, $stateParams.compositionOptions);
    }

    $scope.isCollapsed = !$scope.email || (_.isEmpty($scope.email.cc) && _.isEmpty($scope.email.bcc));

    INBOX_SUMMERNOTE_OPTIONS.callbacks = {
      onKeydown: function(e) {
        if (e.ctrlKey && (e.keyCode === 10 || e.keyCode === 13)) {
          $scope.send();
        }
      }
    };

    $scope.summernoteOptions = INBOX_SUMMERNOTE_OPTIONS;

    $scope.send = function() {
      $scope.isSendingMessage = true;

      if (composition.canBeSentOrNotify()) {
        disableImplicitSavesAsDraft = true;

        $scope.hide();
        composition.send();
      } else {
        $scope.isSendingMessage = false;
      }
    };

    $scope.destroyDraft = function() {
      $scope.hide();

      // This will put all uploading attachments in a 'canceled' state, so that if the user reopens the composer he can retry
      _.forEach($scope.email.attachments, _cancelAttachment);

      return composition.destroyDraft();
    };
  })

  .controller('viewEmailController', function($scope, $state, $stateParams, esnShortcuts, inboxJmapItemService, inboxMailboxesService, inboxJmapHelper, inboxAsyncHostedMailControllerHelper, INBOX_SHORTCUTS_NAVIGATION_CATEGORY) {
    var context = $stateParams.context;

    $scope.email = $stateParams.item;

    inboxAsyncHostedMailControllerHelper(this, function() {
      return inboxJmapHelper
        .getMessageById($stateParams.emailId)
        .then(function(message) {
          if (!$scope.email) {
            $scope.email = message;
          } else {
            ['isUnread', 'isFlagged', 'attachments', 'textBody', 'htmlBody'].forEach(function(property) {
              $scope.email[property] = message[property];
            });
          }

          inboxJmapItemService.markAsRead($scope.email);
        })
        .finally(function() {
          $scope.email.loaded = true;
        })
        ;
    });

    ['markAsRead', 'markAsFlagged', 'unmarkAsFlagged'].forEach(function(action) {
      this[action] = function() {
        inboxJmapItemService[action]($scope.email);
      };
    }.bind(this));

    ['markAsUnread', 'moveToTrash'].forEach(function(action) {
      this[action] = function() {
        $state.go('^');
        inboxJmapItemService[action]($scope.email);
      };
    }.bind(this));

    this.move = function() {
      $state.go('.move', { item: $scope.email });
    };

    function _canActionBeDone(mailboxId, message, checkFunction) {
      if (mailboxId) {
        return checkFunction(mailboxId);
      }

      // unified inbox does not have any context. In that case, we get mailbox from the selected email.
      return !message || message.mailboxIds.every(function(mailboxId) {
        return checkFunction(mailboxId);
      });
    }

    this.canTrashMessages = function() {
      return _canActionBeDone(context, $scope.email, inboxMailboxesService.canTrashMessages);
    };

    this.canMoveMessagesOutOfMailbox = function() {
      return _canActionBeDone(context, $scope.email, inboxMailboxesService.canMoveMessagesOutOfMailbox);
    };

    function openAdjacentMessage(direction) {
      var getAdjacentMessage = $scope.email[direction];

      if (getAdjacentMessage) {
        var message = getAdjacentMessage();

        return $state.go('.', {
          emailId: message.id,
          item: message
        }, {
          location: 'replace' // So that moving next/previous does not mess with the "Back" button
        });
      }
    }

    this.next = function() {
      return openAdjacentMessage('next');
    };

    this.previous = function() {
      return openAdjacentMessage('previous');
    };

    esnShortcuts.use(INBOX_SHORTCUTS_NAVIGATION_CATEGORY.shortcuts.VIEW_NEXT_EMAIL, this.next, $scope);
    esnShortcuts.use(INBOX_SHORTCUTS_NAVIGATION_CATEGORY.shortcuts.VIEW_PREVIOUS_EMAIL, this.previous, $scope);
  })

  .controller('viewThreadController', function($scope, $stateParams, $state, withJmapClient, inboxJmapItemService, _, JMAP_GET_MESSAGES_VIEW) {
    $scope.thread = $stateParams.item;

    withJmapClient(function(client) {
      client
        .getThreads({ ids: [$stateParams.threadId] })
        .then(_.head)
        .then(function(thread) {
          if (!$scope.thread) {
            $scope.thread = thread;
          }

          return thread.getMessages({ properties: JMAP_GET_MESSAGES_VIEW });
        })
        .then(function(messages) {
          return messages.map(function(message) {
            message.loaded = true;

            return message;
          });
        })
        .then(function(emails) {
          $scope.thread.emails = emails;
        })
        .then(function() {
          $scope.thread.emails.forEach(function(email, index, emails) {
            email.isCollapsed = !(email.isUnread || index === emails.length - 1);
          });
        })
        .then(function() {
          inboxJmapItemService.markAsRead($scope.thread);
        });
    });

    ['markAsRead', 'markAsFlagged', 'unmarkAsFlagged'].forEach(function(action) {
      this[action] = function() {
        inboxJmapItemService[action]($scope.thread);
      };
    }.bind(this));

    ['markAsUnread', 'moveToTrash'].forEach(function(action) {
      this[action] = function() {
        $state.go('^');
        inboxJmapItemService[action]($scope.thread);
      };
    }.bind(this));

    this.move = function() {
      $state.go('.move', { item: $scope.thread });
    };
  })

  .controller('inboxMoveItemController', function($scope, $stateParams, inboxMailboxesService, inboxJmapItemService,
                                                  esnPreviousPage, inboxSelectionService, inboxFilteredList) {
    inboxMailboxesService.assignMailboxesList($scope);

    this.moveTo = function(mailbox) {
      esnPreviousPage.back();

      return inboxJmapItemService.moveMultipleItems(
        $stateParams.selection ? inboxSelectionService.getSelectedItems() : inboxFilteredList.getById($stateParams.item.id), mailbox
      );
    };
  })

  .controller('inboxConfigurationIndexController', function($scope, touchscreenDetectorService) {
    $scope.hasTouchscreen = touchscreenDetectorService.hasTouchscreen();
  })

  .controller('inboxConfigurationFolderController', function($scope, inboxMailboxesService) {
    inboxMailboxesService.assignMailboxesList($scope, inboxMailboxesService.filterSystemMailboxes);
  })

  .controller('addFolderController', function($scope, jmap, inboxMailboxesService, rejectWithErrorNotification, $modal) {
    inboxMailboxesService.assignMailboxesList($scope);

    $scope.mailbox = $scope.mailbox ? $scope.mailbox : {};

    $scope.addFolder = function(hide) {
      if (!$scope.mailbox.name) {
        return rejectWithErrorNotification('Please enter a valid folder name');
      }
      hide();

      return inboxMailboxesService.createMailbox($scope.mailbox, {
        linkText: 'Reopen',
        action: function() {
          $modal({
            templateUrl: '/unifiedinbox/views/folders/add/index.html',
            controller: 'addFolderController',
            controllerAs: 'ctrl',
            backdrop: 'static',
            placement: 'center',
            scope: $scope
          });
        }
      });
    };
  })

  .controller('editFolderController', function($scope, inboxMailboxesService, _, rejectWithErrorNotification) {
    var originalMailbox;

    inboxMailboxesService
      .assignMailboxesList($scope)
      .then(function(mailboxes) {
        originalMailbox = _.find(mailboxes, { id: $scope.mailbox.id });
        $scope.mailbox = _.clone(originalMailbox);
      });

    $scope.editFolder = function(hide) {
      if (!$scope.mailbox.name) {
        return rejectWithErrorNotification('Please enter a valid folder name');
      }
      hide();

      return inboxMailboxesService.updateMailbox(originalMailbox, $scope.mailbox);
    };
  })

  .controller('inboxDeleteFolderController', function(_, $scope, $state, inboxMailboxesService, esnI18nService) {
    var descendants = $scope.mailbox.descendants,
        numberOfDescendants = descendants.length,
        numberOfMailboxesToDisplay = 3,
        more = numberOfDescendants - numberOfMailboxesToDisplay,
        destroyMailboxesIds = [];

    var messageFor1Folder = 'Folder %s and all the messages it contains will be deleted and you won\'t be able to recover them.',
        messageFor2To4Folders = 'Folder %s (including folder %s) and all the messages it contains will be deleted and you won\'t be able to recover them.',
        messageFor5Folders = 'Folder %s (including folders %s and %s) and all the messages it contains will be deleted and you won\'t be able to recover them.',
        messageForMoreFolders = 'Folder %s (including folders %s, %s and some others) and all the messages it contains will be deleted and you won\'t be able to recover them.';

    destroyMailboxesIds.push($scope.mailbox.id);
    destroyMailboxesIds = destroyMailboxesIds.concat(descendants.map(_.property('id')));

    if (numberOfDescendants < 1) {
      $scope.message = esnI18nService.translate(messageFor1Folder, $scope.mailbox.displayName).toString();
    } else {
      var displayingDescendants = descendants.slice(0, numberOfMailboxesToDisplay).map(_.property('displayName')).join(', ');

      if (more <= 0) {
        $scope.message = esnI18nService.translate(messageFor2To4Folders, $scope.mailbox.displayName, displayingDescendants).toString();
      } else if (more === 1) {
        $scope.message = esnI18nService.translate(messageFor5Folders, $scope.mailbox.displayName, displayingDescendants, descendants[numberOfMailboxesToDisplay].displayName).toString();
      } else {
        $scope.message = esnI18nService.translate(messageForMoreFolders, $scope.mailbox.displayName, displayingDescendants, more).toString();
      }
    }

    this.deleteFolder = function() {
      if (_.contains(destroyMailboxesIds, $state.params.context)) {
        $state.go('unifiedinbox.inbox', { type: '', account: '', context: '' }, { location: 'replace' });
      }

      return inboxMailboxesService.destroyMailbox($scope.mailbox);
    };
  })

  .controller('inboxConfigurationVacationController', function($rootScope, $scope, $state, $stateParams, $q,
                                                               moment, jmap, withJmapClient, rejectWithErrorNotification,
                                                               asyncJmapAction, esnPreviousPage, INBOX_EVENTS) {
    var self = this;

    this.momentTimes = {
      fromDate: {
        fixed: false,
        default: {
          hour: 0,
          minute: 0,
          second: 0
        }
      },
      toDate: {
        fixed: false,
        default: {
          hour: 23,
          minute: 59,
          second: 59
        }
      }
    };

    function _init() {
      $scope.vacation = $stateParams.vacation;

      if (!$scope.vacation) {
        $scope.vacation = {};

        withJmapClient(function(client) {
          client.getVacationResponse()
            .then(function(vacation) {
              $scope.vacation = vacation;

              // defaultTextBody is being initialised in vacation/index.jade
              if (!$scope.vacation.isEnabled && !$scope.vacation.textBody) {
                $scope.vacation.textBody = $scope.defaultTextBody;
              }
            })
            .then(function() {
              if (!$scope.vacation.fromDate) {
                $scope.vacation.fromDate = moment();
              } else {
                self.fixTime('fromDate');
              }
              self.updateDateAndTime('fromDate');

              if ($scope.vacation.toDate) {
                $scope.vacation.hasToDate = true;
                self.fixTime('toDate');
                self.updateDateAndTime('toDate');
              }
            })
            .then(function() {
              $scope.vacation.loadedSuccessfully = true;
            });
        });
      }
    }

    _init();

    this.updateDateAndTime = function(date) {
      if ($scope.vacation[date]) {
        $scope.vacation[date] = moment($scope.vacation[date]);

        if (!self.momentTimes[date].fixed) {
          $scope.vacation[date].set(self.momentTimes[date].default);
        }
      }
    };

    this.fixTime = function(date) {
      !self.momentTimes[date].fixed && (self.momentTimes[date].fixed = true);
    };

    this.toDateIsInvalid = function() {
      return $scope.vacation.hasToDate && $scope.vacation.toDate && $scope.vacation.toDate.isBefore($scope.vacation.fromDate);
    };

    this.enableVacation = function(status) {
      $scope.vacation.isEnabled = status;
    };

    this.updateVacation = function() {
      return _validateVacationLogic()
        .then(function() {
          esnPreviousPage.back('unifiedinbox');

          if (!$scope.vacation.hasToDate) {
            $scope.vacation.toDate = null;
          }

          return asyncJmapAction({
            progressing: 'Saving vacation settings...',
            success: 'Vacation settings saved',
            failure: 'Failed to save vacation settings'
          }, function(client) {
            return client.setVacationResponse(new jmap.VacationResponse(client, $scope.vacation));
          }, {
            onFailure: {
              linkText: 'Go Back',
              action: function() {
                $state.go('unifiedinbox.configuration.vacation', { vacation: $scope.vacation });
              }
            }
          });
        })
        .then(function() {
          $rootScope.$broadcast(INBOX_EVENTS.VACATION_STATUS);
        })
        .catch(function(err) {
          $scope.vacation.loadedSuccessfully = false;

          return $q.reject(err);
        });
    };

    $scope.$on(INBOX_EVENTS.VACATION_STATUS, function() {
      withJmapClient(function(client) {
        client.getVacationResponse().then(function(vacation) {
          $scope.vacation.isEnabled = vacation.isEnabled;
        });
      });
    });

    function _validateVacationLogic() {
      if ($scope.vacation.isEnabled) {
        if (!$scope.vacation.fromDate) {
          return rejectWithErrorNotification('Please enter a valid start date');
        }

        if (self.toDateIsInvalid()) {
          return rejectWithErrorNotification('End date must be greater than start date');
        }
      }

      return $q.when();
    }
  })

  .controller('recipientsFullscreenEditFormController', function($scope, $state, $stateParams) {
    if (!$stateParams.recipientsType || !$stateParams.composition || !$stateParams.composition.email) {
      return $state.go('unifiedinbox.compose');
    }

    $scope.recipientsType = $stateParams.recipientsType;
    $scope.recipients = $stateParams.composition.email[$stateParams.recipientsType];

    $scope.backToComposition = function() {
      $state.go('^', { composition: $stateParams.composition }, { location: 'replace' });
    };

    $scope.goToRecipientsType = function(recipientsType) {
      $state.go('.', {
        recipientsType: recipientsType,
        composition: $stateParams.composition
      }, { location: 'replace' });
    };
  })

  .controller('attachmentController', function(navigateTo, asyncAction, esnI18nService) {
    this.download = function(attachment) {
      return asyncAction({
        progressing: 'Please wait while your download is being prepared',
        success: 'Your download has started',
        failure: esnI18nService.translate('Unable to download attachment %s', attachment.name)
      }, function() {
        return attachment.getSignedDownloadUrl().then(navigateTo);
      });
    };
  })

  .controller('inboxSidebarEmailController', function($scope, _, $state, $interval, inboxMailboxesService, inboxSpecialMailboxes, inboxAsyncHostedMailControllerHelper, session, INFINITE_LIST_POLLING_INTERVAL) {
    setupFolderPolling();

    $scope.specialMailboxes = inboxSpecialMailboxes.list();
    $scope.emailAddress = session.user.preferredEmail;

    inboxAsyncHostedMailControllerHelper(this, function() {
      return inboxMailboxesService.assignMailboxesList($scope);
    });

    function setupFolderPolling() {
      if (INFINITE_LIST_POLLING_INTERVAL > 0) {
        var folderPoller = $interval(function() {
          inboxMailboxesService.updateSharedMailboxCache();
        }, INFINITE_LIST_POLLING_INTERVAL);

        $scope.$on('$destroy', function() {
          $interval.cancel(folderPoller);
        });
      }
    }
  })

  .controller('resolveEmailerController', function($scope) {
    $scope.$watch('emailer', function(emailer) {
      if (emailer) {
        emailer.resolve();
      }
    });
  })

  .controller('inboxListSubheaderController', function($state, $stateParams,
                                                       inboxSelectionService, inboxJmapItemService,
                                                       _, inboxMailboxesService, inboxPlugins) {
    var self = this,
        account = $stateParams.account,
        context = $stateParams.context,
        plugin = inboxPlugins.get($stateParams.type);

    if (plugin) {
      plugin.resolveContextName(account, context).then(function(name) {
        self.resolvedContextName = name;
      });
      plugin.contextSupportsAttachments(account, context).then(function(value) {
        self.contextSupportsAttachments = value;
      });
    } else {
      self.contextSupportsAttachments = true;
    }

    self.isSelecting = inboxSelectionService.isSelecting;
    self.getSelectedItems = inboxSelectionService.getSelectedItems;
    self.unselectAllItems = inboxSelectionService.unselectAllItems;

    ['markAsUnread', 'markAsRead', 'unmarkAsFlagged', 'markAsFlagged', 'moveToTrash'].forEach(function(action) {
      self[action] = function() {
        inboxJmapItemService[action](inboxSelectionService.getSelectedItems());
        inboxSelectionService.unselectAllItems();
      };
    });

    self.move = function() {
      $state.go('.move', { selection: true });
    };

    function _canActionBeDone(mailboxId, selectedItems, checkFunction) {
      if (mailboxId) {
        return checkFunction(mailboxId);
      }

      // unified inbox does not have any context. In that case, we get mailbox from the selected email.
      return !selectedItems || selectedItems.every(function(item) {
        return item.mailboxIds.every(function(mailboxId) {
          return checkFunction(mailboxId);
        });
      });
    }

    self.canTrashMessages = function() {
      var selectedItems = inboxSelectionService.getSelectedItems();

      return _canActionBeDone(context, selectedItems, inboxMailboxesService.canTrashMessages);
    };

    self.canMoveMessagesOutOfMailbox = function() {
      var selectedItems = inboxSelectionService.getSelectedItems();

      return _canActionBeDone(context, selectedItems, inboxMailboxesService.canMoveMessagesOutOfMailbox);
    };
  });
