(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxConfigurationFilterDefinition', {
      templateUrl: '/unifiedinbox/app/components/inbox-configuration/filter-definition/configuration-filter-definition.html',
      controller: 'inboxConfigurationFilterDefinitionController',
      bindings: {
        editFilterId: '@'
      }
    });

})(angular);
