(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxComposerBodyEditorText', {
      templateUrl: '/unifiedinbox/app/components/composer/body-editor/text/composer-body-editor-text.html',
      controller: 'inboxComposerBodyEditorTextController',
      bindings: {
        message: '<',
        identity: '<',
        isCollapsed: '<',
        onBodyUpdate: '&'
      }
    });

})();
