(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .factory('inboxMailboxesFilterService', function() {
      // eslint-disable-next-line no-unused-vars
      var filters = [];

      return {
        getFilters: getFilters,
        setFilters: setFilters,
        addFilter: addFilter
      };

      /////

      function addFilter(filter) { // Dummy code for now; implementation using JMap top come
        filters.push(filter);
      }

      function getFilters() {
      }

      function setFilters() {
      }
    });

})(angular);
