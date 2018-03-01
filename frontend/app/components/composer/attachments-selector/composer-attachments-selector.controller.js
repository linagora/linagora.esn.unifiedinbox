(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxComposerAttachmentsSelectorController', function($q, $filter, esnI18nService, notificationFactory, _,
                                                                       jmap, inboxConfig, withJmapClient, inboxAttachmentProviderRegistry,
                                                                       inboxAttachmentAlternativeUploaderModal,
                                                                       DEFAULT_FILE_TYPE, DEFAULT_MAX_SIZE_UPLOAD, INBOX_ATTACHMENT_TYPE_JMAP) {
      var self = this;

      self.onAttachmentsSelect = onAttachmentsSelect;
      self.getAttachmentsStatus = getAttachmentsStatus;

      /////

      function getAttachmentsStatus() {
        return {
          number: _.filter(self.attachments, { isInline: false, attachmentType: INBOX_ATTACHMENT_TYPE_JMAP}).length,
          uploading: _.some(self.attachments, { status: 'uploading', attachmentType: INBOX_ATTACHMENT_TYPE_JMAP }),
          error: _.some(self.attachments, { status: 'error', attachmentType: INBOX_ATTACHMENT_TYPE_JMAP })
        };
      }

      function onAttachmentsSelect($files) {
        if (!$files || $files.length === 0) {
          return;
        }

        self.attachments = self.attachments || [];

        return withJmapClient(function(client) {
          return inboxConfig('maxSizeUpload', DEFAULT_MAX_SIZE_UPLOAD).then(function(maxSizeUpload) {
            var humanReadableMaxSizeUpload = $filter('bytes')(maxSizeUpload);
            var largeFiles = [];

            $files.forEach(function(file) {
              if (file.size > maxSizeUpload) {
                return largeFiles.push(file);
              }

              // default attachment requires JMAP client instance
              var attachment = inboxAttachmentProviderRegistry.getDefault().fileToAttachment(client, file);

              self.attachments.push(attachment);
              self.upload({ $attachment: attachment });
            });

            if (largeFiles.length > 0) {
              inboxAttachmentAlternativeUploaderModal.show(largeFiles, humanReadableMaxSizeUpload, function(attachmentProvider, selectedFiles) {
                selectedFiles.forEach(function(file) {
                  var attachment = attachmentProvider.fileToAttachment(file);

                  self.attachments.push(attachment);
                  self.upload({ $attachment: attachment });
                });
              });
            }
          });
        })
          .then(function() {
            self.onAttachmentsUpdate({ $attachments: self.attachments });
          });
      }

    });

})();
