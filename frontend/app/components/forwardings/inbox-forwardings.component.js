(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxForwardings', {
      templateUrl: '/unifiedinbox/app/components/forwardings/inbox-forwardings.html',
      controller: 'InboxForwardingsController'
    });
})(angular);
