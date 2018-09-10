(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxConfigurationFiltersController', inboxConfigurationFiltersController);

  function inboxConfigurationFiltersController($scope, inboxMailboxesFilterService) {
    var self = this;

    self.$onInit = $onInit;
    self.refreshFilters = refreshFilters;
    self.filtersList = [];

    /////

    function $onInit() {
      self.refreshFilters();
      $scope.$on('filters-list-changed', self.refreshFilters);
    }

    function refreshFilters() {
      return inboxMailboxesFilterService.getFilters().then(function(filters) {
        self.filtersList = filters;
      });
    }
  }
})(angular);

