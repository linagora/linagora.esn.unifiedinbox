(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .run(injectUserProfileTabsDirective);

  function injectUserProfileTabsDirective(dynamicDirectiveService) {
    var userIdentities = new dynamicDirectiveService.DynamicDirective(true, 'inbox-identities-tab', {
      attributes: [
        { name: 'ng-if', value: '$ctrl.me' }
      ]
    });

    dynamicDirectiveService.addInjection('profile-tabs', userIdentities);
  }
})(angular);
