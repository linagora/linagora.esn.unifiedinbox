(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxConfigurationFiltersController', inboxConfigurationFiltersController);

  function inboxConfigurationFiltersController(inboxMailboxesFilterService) {
    var self = this;

    self.$onInit = $onInit;
    self.filtersList = [];

    /////

    function $onInit() {
      return inboxMailboxesFilterService.getFilters().then(function(filters) {
        self.filtersList = filters;
      });
    }
  }
})(angular);

