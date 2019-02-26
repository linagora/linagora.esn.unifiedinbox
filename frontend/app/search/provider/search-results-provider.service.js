(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox').factory('inboxSearchResultsProvider', inboxSearchResultsProvider);

  function inboxSearchResultsProvider(inboxNewMessageProvider, computeUniqueSetOfRecipients) {
    return inboxNewMessageProvider('/unifiedinbox/app/search/provider/search-results-provider.html', computeUniqueSetOfRecipients);
  }

})(angular);
