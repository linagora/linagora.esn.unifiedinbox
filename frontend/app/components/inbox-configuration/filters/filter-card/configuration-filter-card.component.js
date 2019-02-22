(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxConfigurationFilterCard', {
      templateUrl: '/unifiedinbox/app/components/inbox-configuration/filters/filter-card/configuration-filter-card.html',
      controller: 'inboxConfigurationFilterCardController',
      bindings: {
        filter: '<',
        deleteFilter: '<'
      }
    });

})();
