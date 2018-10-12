(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxComposerController', function($q, notificationFactory, jmap, attachmentUploadService, _, emailSendingService, inboxRequestReceiptsService,
                                                    emailBodyService, Offline, inboxAttachmentUploadService, waitUntilMessageIsComplete,
                                                    backgroundAction, InboxDraft, DRAFT_SAVING_DEBOUNCE_DELAY) {
      var self = this,
          skipAutoSaveOnDestroy = false;

      self.$onInit = $onInit;
      self.tryClose = tryClose;
      self.saveDraft = _.debounce(saveDraft, DRAFT_SAVING_DEBOUNCE_DELAY);
      self.upload = upload;
      self.removeAttachment = removeAttachment;
      self.send = send;
      self.destroyDraft = destroyDraft;
      self.toggleReadReceiptRequest = toggleReadReceiptRequest;
      /////

      function $onInit() {
        self.onTryClose({callback: self.tryClose});
        self.draft = new InboxDraft(self.message);
        self.isCollapsed = !self.message || (_.isEmpty(self.message.cc) && _.isEmpty(self.message.bcc));

        self.onTitleUpdate({ $title: self.message && self.message.subject });
        inboxRequestReceiptsService.getDefaultReceipts().then(function(sendingReceiptsConfig) {
          self.hasRequestedReadReceipt = sendingReceiptsConfig.isRequestingReadReceiptsByDefault;
        });
      }

      function tryClose() {
        if (!skipAutoSaveOnDestroy) {
          return saveDraft();
        }

        return $q.when();
      }

      function saveDraft() {
        var options = {
          persist: true,
          silent: true,
          onFailure: {
            linkText: 'Reopen the composer',
            action: self.onShow
          },
          onClose: self.forceClose
        };

        return self.draft.save(self.message, options).then(self.onSave);
      }

      function upload(attachment) {
        return inboxAttachmentUploadService.upload(attachment).then(self.saveDraft);
      }

      function removeAttachment(attachment) {
        _.pull(self.message.attachments, attachment);
        _cancelAttachment(attachment);

        self.saveDraft();
      }

      function toggleReadReceiptRequest() {
        self.hasRequestedReadReceipt = !self.hasRequestedReadReceipt;
      }

      function send() {
        self.isSendingMessage = true;

        if (_canBeSentOrNotify()) {
          _closeComposer();

          emailSendingService.removeDuplicateRecipients(self.message);
          if (self.hasRequestedReadReceipt) {
            emailSendingService.addReadReceiptRequest(self.message);
          }

          return backgroundAction({
            progressing: 'Your message is being sent...',
            success: 'Message sent',
            failure: function() {
              if (!Offline.state || Offline.state === 'down') {
                return 'You have been disconnected. Please check if the message was sent before retrying';
              }

              return 'Your message cannot be sent';
            }
          }, function() {
            return waitUntilMessageIsComplete(self.message)
              .then(_quoteOriginalEmailIfNeeded)
              .then(emailSendingService.sendEmail.bind(emailSendingService, self.message));
          }, {
            persist: true,
            onFailure: {
              linkText: 'Reopen the composer',
              action: self.onShow
            }
          })
            .then(destroyDraft.bind(self, { silent: true }))
            .then(self.onSend);
        }

        self.isSendingMessage = false;
      }

      function destroyDraft(options) {
        _closeComposer();

        // This will put all uploading attachments in a 'canceled' state, so that if the user reopens the composer he can retry
        _.forEach(self.message.attachments, _cancelAttachment);

        self.draft.destroy(options).then(self.onDiscard, self.onShow);
      }

      function _cancelAttachment(attachment) {
        attachment.upload && attachment.upload.cancel();
      }

      function _closeComposer() {
        skipAutoSaveOnDestroy = true;
        self.onHide();
      }

      function _canBeSentOrNotify() {
        if (emailSendingService.noRecipient(self.message)) {
          notificationFactory.weakError('Note', 'Your email should have at least one recipient');
        } else if (!Offline.state || Offline.state === 'down') {
          notificationFactory.weakError('Note', 'Your device has lost Internet connection. Try later!');
        } else {
          return true;
        }
      }

      function _quoteOriginalEmailIfNeeded() {
        // This will only be true if we're on a mobile device and the user did not press "Edit quoted self.message".
        // We need to quote the original self.message in this case, and set the quote as the HTML body so that
        // the sent self.message contains the original self.message, quoted as-is
        if (!self.message.isQuoting && self.message.quoted) {
          return emailBodyService.quoteOriginalEmail(self.message).then(function(body) {
            self.message.textBody = '';
            self.message.htmlBody = body;

            return self.message;
          });
        }
      }
    });

})();
