(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxConfigurationFilterCardController', inboxConfigurationFilterCardController);

  function inboxConfigurationFilterCardController(inboxMailboxesFilterService) {
    var self = this;

    self.deleteFilter = deleteFilter;
    self.getFilterSummary = getFilterSummary;

    /////

    function deleteFilter() {
      inboxMailboxesFilterService.deleteFilter(self.filter.id);
    }

    function getFilterSummary() {
      return inboxMailboxesFilterService.getFilterSummary(self.filter);
    }
  }
})(angular);
