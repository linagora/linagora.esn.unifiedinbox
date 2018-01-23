(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .factory('inboxAttachmentUploadService', inboxAttachmentUploadService);

  function inboxAttachmentUploadService(
    $q,
    inboxAttachmentRegistry
  ) {

    return {
      upload: upload
    };

    function upload(attachment) {
      attachment.status = 'uploading';
      attachment.upload = {
        progress: 0
      };

      var uploader = _getUploader(attachment);

      if (uploader) {
        var uploadTask = uploader.upload(attachment);

        attachment.upload.cancel = uploadTask.cancel;
        attachment.upload.promise = uploadTask.promise.then(function() {
          attachment.status = 'uploaded';
        }, function() {
          attachment.status = 'error';
        }, function(progress) {
          attachment.upload.progress = progress;
        });
      } else {
        attachment.status = 'error';
        attachment.upload.cancel = angular.noop;
        attachment.upload.promise = $q.reject(new Error('No uploader for this attachment type: ' + attachment.attachmentType));
      }

      return attachment.upload.promise;
    }

    function _getUploader(attachment) {
      return inboxAttachmentRegistry.get(attachment.attachmentType);
    }
  }

})(angular);
