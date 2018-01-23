(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .factory('inboxAttachmentJmap', inboxAttachmentJmap);

  function inboxAttachmentJmap(
    $q,
    jmap,
    fileUploadService,
    attachmentUploadService,
    DEFAULT_FILE_TYPE,
    INBOX_ATTACHMENT_TYPE_JMAP
  ) {
    return {
      type: INBOX_ATTACHMENT_TYPE_JMAP,
      icon: null,
      upload: upload,
      fileToAttachtment: fileToAttachtment
    };

    function upload(attachment) {
      var deferred = $q.defer();
      var uploader = fileUploadService.get(attachmentUploadService);
      var uploadTask = uploader.addFile(attachment.getFile()); // Do not start the upload immediately

      uploadTask.defer.promise.then(function(task) {
        attachment.blobId = task.response.blobId;
        attachment.url = task.response.url;
        deferred.resolve();
      }, deferred.reject, function(uploadTask) {
        deferred.notify(uploadTask.progress);
      });

      uploader.start(); // Start transferring data

      return {
        cancel: uploadTask.cancel,
        promise: deferred.promise
      };
    }

    function fileToAttachtment(client, file) {
      var attachment = new jmap.Attachment(client, '', {
        name: file.name,
        size: file.size,
        type: file.type || DEFAULT_FILE_TYPE
      });

      attachment.attachmentType = INBOX_ATTACHMENT_TYPE_JMAP;

      attachment.getFile = function() {
        return file;
      };

      return attachment;
    }
  }
})(angular);
