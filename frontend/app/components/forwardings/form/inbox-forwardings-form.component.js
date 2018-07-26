(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxForwardingsForm', {
      templateUrl: '/unifiedinbox/app/components/forwardings/form/inbox-forwardings-form.html',
      controller: 'InboxForwardingsFormController',
      bindings: {
        forwardings: '=',
        user: '<'
      }
    });
})(angular);
