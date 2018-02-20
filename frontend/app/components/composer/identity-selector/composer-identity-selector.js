(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxComposerIdentitySelector', {
      templateUrl: '/unifiedinbox/app/components/composer/identity-selector/composer-identity-selector.html',
      controller: 'inboxComposerIdentitySelectorController',
      bindings: {
        identity: '<',
        onIdentityUpdate: '&'
      }
    });

})();
