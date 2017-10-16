(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxMailboxSharedSettingsUser', {
      bindings: {
        user: '<',
        owner: '<',
        onUserRemoved: '='
      },
      controllerAs: 'ctrl',
      templateUrl: '/unifiedinbox/app/components/mailbox-shared-settings/user/mailbox-shared-settings-user.html'
    });
})();
