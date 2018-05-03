(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox').component('inboxSearchForm', {
    templateUrl: '/unifiedinbox/app/components/search/search-form.html',
    controllerAs: 'ctrl',
    bindings: {
      query: '='
    }
  });
})(angular);
