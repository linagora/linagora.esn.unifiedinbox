(function() {
'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxFolderSettings', {
      templateUrl: '/unifiedinbox/app/components/sidebar/folder-settings/folder-settings.html',
      bindings: {
        isFolder: '=',
        mailbox: '='
      },
      controllerAs: 'ctrl',
      controller: 'inboxFolderSettingsController'
    });
})();
