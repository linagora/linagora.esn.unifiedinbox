(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxComposerBodyEditorHtml', {
      templateUrl: '/unifiedinbox/app/components/composer/body-editor/html/composer-body-editor-html.html',
      controller: 'inboxComposerBodyEditorHtmlController',
      bindings: {
        message: '<',
        identity: '<',
        isCollapsed: '<',
        send: '&',
        upload: '&',
        removeAttachment: '&',
        onBodyUpdate: '&',
        onAttachmentsUpload: '&'
      }
    });

})();
