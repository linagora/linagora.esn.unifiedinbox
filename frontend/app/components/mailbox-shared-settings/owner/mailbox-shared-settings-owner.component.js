(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxMailboxSharedSettingsOwner', {
      bindings: {
        owner: '<'
      },
      controllerAs: 'ctrl',
      templateUrl: '/unifiedinbox/app/components/mailbox-shared-settings/owner/mailbox-shared-settings-owner.html'
    });
})();
