(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxIdentityForm', {
      templateUrl: '/unifiedinbox/app/components/inbox-configuration/identity/form/identity-form.html',
      bindings: {
        identityId: '@'
      },
      controller: 'inboxIdentityFormController'
    });

})();
