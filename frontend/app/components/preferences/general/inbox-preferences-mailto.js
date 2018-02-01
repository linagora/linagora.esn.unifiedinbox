(function() {
  'use strict';

  angular
    .module('linagora.esn.unifiedinbox')
    .component('inboxPreferencesMailto', {
      templateUrl: '/unifiedinbox/app/components/preferences/general/inbox-preferences-mailto.html',
      controller: 'inboxPreferencesMailtoController',
      require: {
        parent: '^controlcenterGeneral'
      }
    });

})();
