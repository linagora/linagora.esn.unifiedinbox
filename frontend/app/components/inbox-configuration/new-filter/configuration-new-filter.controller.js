(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxConfigurationNewFilterController', inboxConfigurationNewFilterController);

  function inboxConfigurationNewFilterController(
    $state,
    _,
    inboxMailboxesService,
    inboxMailboxesFilterService,
    esnI18nService,
    JMAP_FILTER
  ) {
    var self = this;

    self.newFilter = {};

    self.saveFilter = saveFilter;
    self.$onInit = $onInit;
    self.hideMoreResults = hideMoreResults;

    /////

    function $onInit() {
      inboxMailboxesService.assignMailboxesList(self);
      self.conditionsOptions = _getJmapFilterOptions(JMAP_FILTER.CONDITIONS);
      self.actionOptions = _getJmapFilterOptions(JMAP_FILTER.ACTIONS);
      self.newFilter.when = _initConditionOptions();
      self.newFilter.then = _initActionOptions();
    }

    function saveFilter() {
      inboxMailboxesFilterService.addFilter(
        self.newFilter.when.key, self.newFilter.name, self.newFilter.from[0].email, {
          action: self.newFilter.then.key,
          mailboxId: self.newFilter.moveTo.id
        });

      return inboxMailboxesFilterService.setFilters().then(function() {
        $state.go('unifiedinbox.configuration.filters');
      });
    }

    function hideMoreResults() {
      return _.has(self.newFilter, 'from') && !_.isEmpty(self.newFilter.from);
    }

    function _initConditionOptions() {
      return _.first(self.conditionsOptions, function(item) {
        return item.key === JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY;
      })[0];
    }

    function _initActionOptions() {
      return _.first(self.actionOptions, function(item) {
        return item.key === JMAP_FILTER.ACTIONS.MOVE_TO.JMAP_KEY;
      })[0];
    }

    function _getJmapFilterOptions(jmapFilterSection) {
      return Object.keys(jmapFilterSection).map(function(item) {
        return jmapFilterSection[item];
      }).map(_transformFilterOption);
    }

    function _transformFilterOption(item) {
      return {
        key: item.JMAP_KEY,
        val: esnI18nService.translate(item.HUMAN_REPRESENTATION, '').toString()
      };
    }
  }
})(angular);
