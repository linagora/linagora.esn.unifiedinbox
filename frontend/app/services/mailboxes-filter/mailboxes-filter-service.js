(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .factory('inboxMailboxesFilterService', function(
      $q,
      $sanitize,
      _,
      esnI18nService,
      inboxMailboxesService,
      JMAP_FILTER,
      uuid4,
      jmap,
      asyncJmapAction,
      withJmapClient
    ) {
      var self = this;

      self.filters = [];
      self.filtersIds = {};

      inboxMailboxesService.assignMailboxesList(self);
      getFilters();

      return {
        getFilters: getFilters,
        setFilters: setFilters,
        addFilter: addFilter,
        editFilter: editFilter,
        getFilterSummary: getFilterSummary,
        filters: self.filters,
        filtersIds: self.filtersIds
      };

      /////

      /**
       * Add a new filter to the filters list.
       * @param type One of JMAP_FILTER.CONDITIONS.<condition>.JMAP_KEY
       *             (See frontend/app/services/mailboxes-filter/mailboxes-filter-service.constants.js)
       * @param name Name of filter
       * @param conditionValue Value to match condition.
       * @param actionDefinition Object defining action to take.
       *                For JMAP_FILTER.ACTIONS.MOVE_TO.JMAP_KEY:
       *                ```
       *                {
       *                  action: JMAP_FILTER.ACTIONS.MOVE_TO.JMAP_KEY,
       *                  mailboxId: <mailbox_id>
       *                }
       *                ```
       */
      function addFilter(type, name, conditionValue, actionDefinition) {
        var filter = _filterOf(type, name, conditionValue, actionDefinition);

        self.filters.push(filter);
        self.filtersIds[filter.id] = filter;
      }

      function editFilter(id, type, name, conditionValue, actionDefinition) {
        var idx = _.findIndex(self.filters, {id: id});

        if (idx < 0) {
          return false;
        }

        var filter = _filterOf(type, name, conditionValue, actionDefinition);

        self.filters[idx] = filter;
        self.filtersIds[filter.id] = filter;

        return true;
      }

      function getFilters() {
        return withJmapClient(function(client) {
          return client.getFilter().then(function(result) {
            self.filters.length = 0;
            _.forEach(result, function(item) {
              self.filters.push(item);
              self.filtersIds[item.id] = item;
            });

            return self.filters;
          });
        });
      }

      function setFilters() {
        return asyncJmapAction({success: 'Filters set', failure: 'Error setting filters'}, function(client) {
          return client.setFilter(self.filters);
        });
      }

      function getFilterSummary(id) {
        var filter = self.filtersIds[id];

        return esnI18nService.translate('When %s then %s',
          _getJMapConditionText(filter),
          _getJMapActionText(filter)).toString();
      }

      function _getJMapConditionText(filter) {
        var message = JMAP_FILTER.CONDITIONS[
          JMAP_FILTER.CONDITIONS_MAPPING[filter.condition.field]]
          .HUMAN_REPRESENTATION;

        switch (filter.condition.field) {
          case JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY:
            var text = '<b>' + $sanitize(filter.condition.value) + '</b>';

            message = esnI18nService.translate(message, text).toString();
            break;
        }

        return message;
      }

      function _getJMapActionText(filter) {
        var message = JMAP_FILTER.ACTIONS[
          JMAP_FILTER.ACTIONS_MAPPING[Object.keys(filter.action)[0]]].HUMAN_REPRESENTATION;

        switch (Object.keys(filter.action)[0]) {
          case JMAP_FILTER.ACTIONS.MOVE_TO.JMAP_KEY:
            var text = '';

            var mailbox = _.find(self.mailboxes, {id: filter.action.appendIn.mailboxIds[0]});

            if (mailbox) {
              text = '<b>' + $sanitize(mailbox.name) + '</b>';
            }
            message = esnI18nService.translate(message, text).toString();
            break;
        }

        return message;
      }

      function _filterOf(type, name, conditionValue, actionDefinition) {
        var filter;

        switch (type) {
          case JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY:
            filter = new jmap.FilterRule(null, name).when.from
              .value(conditionValue).comparator(jmap.FilterRule.Comparator.EXACTLY_EQUALS);
            break;
        }

        switch (actionDefinition.action) {
          case JMAP_FILTER.ACTIONS.MOVE_TO.JMAP_KEY:
            filter.then.moveTo.mailboxId(String(actionDefinition.mailboxId));
            break;
        }

        return filter.toJSONObject();
      }
    });

})(angular);
