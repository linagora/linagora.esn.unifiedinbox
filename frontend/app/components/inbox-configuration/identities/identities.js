(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxIdentities', {
      templateUrl: '/unifiedinbox/app/components/inbox-configuration/identities/identities.html',
      controller: 'inboxIdentitiesController',
      bindings: {
        user: '<'
      }
    });

})();
