(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxForwardingsSubheader', {
      templateUrl: '/unifiedinbox/app/components/inbox-configuration/forwardings/subheader/inbox-forwardings-subheader.html',
      bindings: {
        forwardings: '<',
        onSave: '&'
      }
    });
})(angular);
