(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxRefreshButton', {
      templateUrl: '/unifiedinbox/app/components/list/refresh-button/refresh-button.html',
      bindings: {
        refresh: '&',
        loading: '<'
      }
    });

})(angular);
