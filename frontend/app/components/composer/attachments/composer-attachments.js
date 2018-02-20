(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxComposerAttachments', {
      templateUrl: '/unifiedinbox/app/components/composer/attachments/composer-attachments.html',
      controller: 'inboxComposerAttachmentsController',
      bindings: {
        message: '<',
        upload: '&',
        removeAttachment: '&'
      }
    });

})();
