(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxLargeAttachmentAlertController', inboxLargeAttachmentAlertController);

  function inboxLargeAttachmentAlertController(
    modalData
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.upload = upload;

    function $onInit() {
      self.attachments = modalData.attachments;
      self.humanReadableMaxSizeUpload = modalData.humanReadableMaxSizeUpload;
      self.externalAttachmentProviders = modalData.externalAttachmentProviders;
    }

    function upload() {
      var externalAttachments = self.attachments.map(function(attachment) {
        return self.selectedProvider.fileToAttachment(attachment.getFile());
      });

      modalData.startUpload(externalAttachments);
    }
  }
})(angular);
