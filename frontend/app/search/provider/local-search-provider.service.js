(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox').factory('inboxLocalSearchProvider', inboxLocalSearchProvider);

  function inboxLocalSearchProvider($stateParams, $q, esnSearchQueryService, inboxSearchResultsProvider, toAggregatorSource, PROVIDER_TYPES) {
    return function() {
      var localProvider = Object.create(inboxSearchResultsProvider);

      localProvider.templateUrl = '/unifiedinbox/views/unified-inbox/elements/message.html';
      localProvider.types = [PROVIDER_TYPES.SEARCH];
      localProvider.options.itemMatches = function() { return $q.when(true); };

      localProvider.buildFetchContext({ query: esnSearchQueryService.buildFromState($stateParams) })
          .then(toAggregatorSource.bind(null, localProvider), angular.noop);

      return localProvider;
    };
  }
})(angular);
