(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxComposerAttachmentsSelector', {
      templateUrl: '/unifiedinbox/app/components/composer/attachments-selector/composer-attachments-selector.html',
      bindings: {
        attachmentHolder: '='
      }
    });

})();
