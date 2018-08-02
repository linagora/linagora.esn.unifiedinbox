(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxQuarantineEmailListItem', {
      templateUrl: '/unifiedinbox/app/components/quarantine/list-item/inbox-quarantine-email-list-item.html',
      bindings: {
        email: '<',
        download: '&'
      }
    });
})(angular);
