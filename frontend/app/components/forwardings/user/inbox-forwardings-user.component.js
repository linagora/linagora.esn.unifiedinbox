(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxForwardingsUser', {
      templateUrl: '/unifiedinbox/app/components/forwardings/user/inbox-forwardings-user.html',
      controller: 'InboxForwardingsUserController',
      bindings: {
        user: '<'
      }
    });
})(angular);
