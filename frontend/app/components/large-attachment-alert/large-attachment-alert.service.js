(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .factory('inboxLargeAttachmentAlertService', inboxLargeAttachmentAlertService);

  function inboxLargeAttachmentAlertService(
    $modal,
    inboxAttachmentRegistry,
    INBOX_ATTACHMENT_TYPE_JMAP
  ) {
    return {
      show: show
    };

    function show(files, humanReadableMaxSizeUpload, startUpload) {
      var attachmentProviders = inboxAttachmentRegistry.getAll();
      var externalAttachmentProviders = Object.keys(attachmentProviders)
        .filter(function(type) {
          return type !== INBOX_ATTACHMENT_TYPE_JMAP;
        })
        .map(function(type) {
          return attachmentProviders[type];
        });

      var numberOfExternalProviders = Object.keys(externalAttachmentProviders).length;
      var templateUrl = numberOfExternalProviders > 0 ? '/unifiedinbox/app/components/large-attachment-alert/modal.html' : '/unifiedinbox/app/components/large-attachment-alert/alert.html';

      var modalData = {
        attachments: files.map(function(file) {
          return {
            name: file.name,
            size: file.size,
            getFile: function() { // because binding file object causes TypeError Illegal invocation
              return file;
            }
          };
        }),
        humanReadableMaxSizeUpload: humanReadableMaxSizeUpload,
        externalAttachmentProviders: externalAttachmentProviders,
        startUpload: startUpload
      };

      $modal({
        templateUrl: templateUrl,
        container: 'body',
        backdrop: 'static',
        placement: 'center',
        controller: 'inboxLargeAttachmentAlertController',
        controllerAs: '$ctrl',
        locals: {
          modalData: modalData
        }
      });
    }
  }
})(angular);
