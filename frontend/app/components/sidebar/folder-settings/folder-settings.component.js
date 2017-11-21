(function() {
'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxFolderSettings', {
      templateUrl: '/unifiedinbox/app/components/sidebar/folder-settings/folder-settings.html',
      bindings: {
        mailbox: '=',
        isFolder: '<',
        isShared: '<',
        isSystem: '<'
      },
      controllerAs: 'ctrl',
      controller: 'inboxFolderSettingsController'
    });
})();
