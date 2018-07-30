(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxQuarantineEmailList', {
      templateUrl: '/unifiedinbox/app/components/quarantine/list/inbox-quarantine-email-list.html',
      controller: 'inboxQuarantineEmailListController'
    });
})(angular);
