(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxBodyEditorHtml', {
      templateUrl: '/unifiedinbox/app/components/body-editor/html/body-editor-html.html',
      controller: 'inboxBodyEditorHtmlController',
      bindings: {
        message: '<',
        identity: '<',
        isCollapsed: '<',
        send: '&',
        upload: '&',
        removeAttachment: '&',
        onBodyUpdate: '&'
      }
    });

})();
