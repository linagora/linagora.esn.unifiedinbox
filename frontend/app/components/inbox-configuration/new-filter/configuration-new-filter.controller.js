(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxConfigurationNewFilterController', inboxConfigurationNewFilterController);

  function inboxConfigurationNewFilterController(_, inboxMailboxesService) {
    var self = this;

    self.newFilter = {};

    self.saveFilter = saveFilter;
    self.$onInit = $onInit;
    self.hideMoreResults = hideMoreResults;

    /////

    function $onInit() {
      inboxMailboxesService.assignMailboxesList(self);
    }

    function saveFilter() {
    }

    function hideMoreResults() {
      return self.newFilter.from && self.newFilter.from.length && self.newFilter.from.length > 0;
    }
  }
})(angular);
