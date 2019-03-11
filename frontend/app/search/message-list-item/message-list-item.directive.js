(function(angular) {
  'use strict';

  angular
    .module('linagora.esn.unifiedinbox')
    .directive('inboxSearchMessageListItem', function() {
      return {
        controllerAs: 'ctrl',
        controller: 'inboxSearchMessageListItemController',
        templateUrl: '/unifiedinbox/app/search/message-list-item/message-list-item.html'
      };
    });
})(angular);
