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
    userAPI,
    JMAP_FILTER
  ) {
    var self = this;

    /**
     * Form inputs will be mapped to this model
     * {
     *   name:    name of the filter
     *   when:    one of JMAP_FILTER.CONDITIONS (see unifiedinbox/frontend/app/services/mailboxes-filter/mailboxes-filter-service.constants.js)
     *   from:    email of the receipiant when `when` field is set to JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY
     *              an array of objects of the form
     *                {
     *                  email: email of contact
     *                  name: displayed name of the contact
     *                }
     *   then:    one of JMAP_FILTER.ACTIONS (see unifiedinbox/frontend/app/services/mailboxes-filter/mailboxes-filter-service.constants.js)
     *   moveTo:  mailbox to move the email to when `then` field is JMAP_FILTER.ACTIONS.MOVE_TO.JMAP_KEY
     *              one of `self.mailboxes`. `self.mailboxes` is populated by
     *              `inboxMailboxesService.assignMailboxesList(self)` in`$onInit()`
     * }
     */
    self.newFilter = {};

    self.$onInit = $onInit;
    self.hideMoreResults = hideMoreResults;
    self.saveFilter = saveFilter;

    /////

    function $onInit() {
      self.assignMailboxesListPromise = inboxMailboxesService.assignMailboxesList(self);

      self.conditionsOptions = _getJmapFilterOptions(JMAP_FILTER.CONDITIONS);
      self.actionOptions = _getJmapFilterOptions(JMAP_FILTER.ACTIONS);
      self.newFilter.when = _initConditionOptions();
      self.newFilter.then = _initActionOptions();

      if (self.editFilterId) {
        initEditForm();
      }
    }

    function hideMoreResults() {
      return _.has(self.newFilter, 'from') && !_.isEmpty(self.newFilter.from);
    }

    /**
     * Will init the for when in edit mode
     */
    function initEditForm() {
      inboxMailboxesFilterService.getFilters().then(function() {
        var filter = inboxMailboxesFilterService.filtersIds[self.editFilterId];
        var filterAction = Object.keys(filter.action)[0];

        self.newFilter = {
          name: filter.name,
          when: _.find(self.conditionsOptions, {key: filter.condition.field}),
          then: _.find(self.actionOptions, {key: filterAction})
        };

        switch (filter.condition.field) {
          case JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY:
            _initFromFied(filter);
            break;
        }

        switch (filterAction) {
          case JMAP_FILTER.ACTIONS.MOVE_TO.JMAP_KEY:
            _initMoveToField(filter);
            break;
        }
      });
    }

    function saveFilter() {
      var fn = self.editFilterId ?
        _.partial(inboxMailboxesFilterService.editFilter, self.editFilterId) :
        inboxMailboxesFilterService.addFilter;

      fn(
        self.newFilter.when.key,
        self.newFilter.name,
        self.newFilter.from[0].email,
        {action: self.newFilter.then.key, mailboxId: self.newFilter.moveTo.id}
      );

      return inboxMailboxesFilterService.setFilters().then(function() {
        $state.go('unifiedinbox.configuration.filters');
      });
    }

    /**
     * Inits options available to the user for conditions and actions.
     */
    function _getJmapFilterOptions(jmapFilterSection) {
      function _transformFilterOption(item) {
        return {
          key: jmapFilterSection[item].JMAP_KEY,
          val: esnI18nService.translate(jmapFilterSection[item].HUMAN_REPRESENTATION, '').toString()
        };
      }

      return Object.keys(jmapFilterSection).map(_transformFilterOption);
    }

    function _getOrDefault(object, property, defaultValue) {
      return _.has(object, property) ? object[property] : defaultValue;
    }

    function _initConditionOptions() {
      return _.find(self.conditionsOptions, {key: JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY});
    }

    function _initActionOptions() {
      return _.find(self.actionOptions, {key: JMAP_FILTER.ACTIONS.MOVE_TO.JMAP_KEY});
    }

    function _initFromFied(filter) {
      userAPI.getUsersByEmail(filter.condition.value).then(function(response) {
        if (response.data && response.data[0]) {
          var email = _getOrDefault(response.data[0], 'preferredEmail', filter.condition.value);
          var name = _getOrDefault(response.data[0], 'firstname', filter.condition.value) +
            ' ' + _getOrDefault(response.data[0], 'lastname', '');

          self.newFilter.from = [{
            email: email,
            name: name
          }];
        }
      });
    }

    function _initMoveToField(filter) {
      self.assignMailboxesListPromise.then(function() {
        self.newFilter.moveTo = _.find(self.mailboxes, {id: filter.action.appendIn.mailboxIds[0]});
      });
    }
  }
})(angular);
