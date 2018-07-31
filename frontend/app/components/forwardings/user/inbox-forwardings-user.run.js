(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .run(injectUserRedirectionsDirective);

  function injectUserRedirectionsDirective(dynamicDirectiveService) {
    var userRedirection = new dynamicDirectiveService.DynamicDirective(true, 'inbox-forwardings-user', {
      attributes: [
        { name: 'user', value: 'member' }
      ]
    });

    dynamicDirectiveService.addInjection('admin-user-list-menu-items', userRedirection);
  }
})(angular);
