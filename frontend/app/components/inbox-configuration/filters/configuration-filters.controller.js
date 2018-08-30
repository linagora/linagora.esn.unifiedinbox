(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxConfigurationFiltersController', inboxConfigurationFiltersController);

  function inboxConfigurationFiltersController(inboxMailboxesFilterService) {
    var self = this;

    self.$onInit = $onInit;

    /////

    function $onInit() {
      self.filtersList = [];
      inboxMailboxesFilterService.getFilters().then(function(filters) {
        self.filtersList = filters;
      });
    }
  }
})(angular);
