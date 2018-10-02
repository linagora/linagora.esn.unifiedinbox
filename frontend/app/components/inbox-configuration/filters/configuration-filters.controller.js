(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxConfigurationFiltersController', inboxConfigurationFiltersController);

  function inboxConfigurationFiltersController(
    $scope,
    inboxMailboxesFilterService,
    dragulaService
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.refreshFilters = refreshFilters;
    self.filtersList = [];

    /////

    function $onInit() {
      self.refreshFilters();
      $scope.$on('filters-list-changed', self.refreshFilters);
      $scope.$on('filter-bag.drop-model', function() {
        inboxMailboxesFilterService.filters = self.filtersList;
      });

      dragulaService.options($scope, 'filter-bag', {
        moves: function(el, container, handle) {
          return handle.className.match(/.*dragger.*/) || handle.parentElement.className.match(/.*dragger.*/);
        }
      });
    }

    function refreshFilters() {
      return inboxMailboxesFilterService.getFilters().then(function(filters) {
        self.filtersList = filters;
      });
    }
  }
})(angular);

