(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxForwardings', {
      templateUrl: '/unifiedinbox/app/components/inbox-configuration/forwardings/inbox-forwardings.html',
      controller: 'InboxForwardingsController'
    });
})(angular);
