(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxIdentity', {
      templateUrl: '/unifiedinbox/app/components/inbox-configuration/identity/identity.html',
      bindings: {
        identityId: '@',
        canEdit: '<'
      },
      controller: 'inboxIdentityController'
    });

})();
