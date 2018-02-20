(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxBodyEditorText', {
      templateUrl: '/unifiedinbox/app/components/body-editor/text/body-editor-text.html',
      controller: 'inboxBodyEditorTextController',
      bindings: {
        message: '<',
        identity: '<',
        isCollapsed: '<',
        onBodyUpdate: '&'
      }
    });

})();
