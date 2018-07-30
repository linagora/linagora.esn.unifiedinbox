(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .run(injectQuarantinePage);

  function injectQuarantinePage(dynamicDirectiveService) {
    var directive = new dynamicDirectiveService.DynamicDirective(true, 'inbox-quarantine-email-list');

    dynamicDirectiveService.addInjection('admin-quarantine-content', directive);
  }
})(angular);
