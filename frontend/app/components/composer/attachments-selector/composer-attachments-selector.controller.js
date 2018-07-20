(function(angular) {
  'use strict';

  angular
    .module('linagora.esn.unifiedinbox')
    .controller('inboxComposerAttachmentsSelectorController', inboxComposerAttachmentsSelectorController);

  function inboxComposerAttachmentsSelectorController(
    $q,
    $filter,
    _,
    inboxConfig,
    withJmapClient,
    inboxAttachmentProviderRegistry,
    inboxAttachmentAlternativeUploaderModal,
    DEFAULT_MAX_SIZE_UPLOAD,
    INBOX_ATTACHMENT_TYPE_JMAP
  ) {
    var self = this;

    self.attachmentFilter = { isInline: false };
    self.attachmentType = INBOX_ATTACHMENT_TYPE_JMAP;
    self.uploadAttachments = uploadAttachments;
    self.uploadLargeFiles = uploadLargeFiles;

    /////

    function uploadAttachments($files) {
      if (!$files || $files.length === 0) {
        return $q.resolve([]);
      }

      return withJmapClient(function(client) {
        return inboxConfig('maxSizeUpload', DEFAULT_MAX_SIZE_UPLOAD)
          .then(function(maxSizeUpload) {
            var largeFiles = [];
            var uploadedFiles = [];
            var humanReadableMaxSizeUpload = $filter('bytes')(maxSizeUpload);

            $files.forEach(function(file) {
              if (file.size > maxSizeUpload) {
                return largeFiles.push(file);
              }

              // default attachment requires JMAP client instance
              var attachment = inboxAttachmentProviderRegistry.getDefault().fileToAttachment(client, file);

              self.upload({ $attachment: attachment });

              return uploadedFiles.push(attachment);
            });

            var uploadedLargeFiles = largeFiles.length > 0 ?
                self.uploadLargeFiles(largeFiles, humanReadableMaxSizeUpload) :
                $q.when([]);

            return $q.all([
              $q.when(uploadedFiles),
              uploadedLargeFiles
            ]);
          })
          .then(function(promises) {
            return _.union(promises[0], promises[1]);
          });
      });
    }

    function uploadLargeFiles(files, humanReadableMaxSizeUpload) {
      return $q(function(resolve) {
        inboxAttachmentAlternativeUploaderModal.show(
          files,
          humanReadableMaxSizeUpload,
          function(attachmentProvider, selectedFiles) {
            resolve(selectedFiles && selectedFiles.map(function(file) {
              var attachment = attachmentProvider.fileToAttachment(file);

              self.upload({ $attachment: attachment });

              return attachment;
            }));
          },
          function() {
            resolve([]);
          }
        );
      });
    }
  }
})(angular);
