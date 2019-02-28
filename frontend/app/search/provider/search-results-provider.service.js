(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox').factory('inboxSearchResultsProvider', inboxSearchResultsProvider);

  function inboxSearchResultsProvider($state, inboxNewMessageProvider, computeUniqueSetOfRecipients, PROVIDER_TYPES) {
    var provider = inboxNewMessageProvider('/unifiedinbox/app/search/provider/search-results-provider.html', computeUniqueSetOfRecipients);

    provider.onSubmit = function(query, stateParams, context) {
      context = context || {};
      context.reload = false;
      context.location = 'replace';

      // cleanup to avoid getting parent state type and context which are useless here
      stateParams.type = PROVIDER_TYPES.SEARCH;
      stateParams.context = '';
      stateParams.account = '';

      $state.go('unifiedinbox.inbox', stateParams, context);
    };

    return provider;
  }

})(angular);
