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
    }

    function getFilterSummary() {
      return inboxMailboxesFilterService.getFilterSummary(self.filter.id);
    }
  }
})(angular);
