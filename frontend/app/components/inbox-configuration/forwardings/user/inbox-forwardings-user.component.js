(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxForwardingsUser', {
      templateUrl: '/unifiedinbox/app/components/inbox-configuration/forwardings/user/inbox-forwardings-user.html',
      bindings: {
        user: '<'
      }
    });
})(angular);
