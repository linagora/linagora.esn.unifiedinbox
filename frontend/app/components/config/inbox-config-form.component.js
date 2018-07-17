(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxConfigForm', {
      templateUrl: '/unifiedinbox/app/components/config/inbox-config-form.html',
      controller: 'InboxConfigFormController',
      bindings: {
        configurations: '<'
      },
      require: {
        adminModulesDisplayerController: '^adminModulesDisplayer'
      }
    });
})(angular);
