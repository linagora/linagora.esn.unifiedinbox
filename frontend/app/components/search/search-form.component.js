(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox').component('inboxSearchForm', {
    templateUrl: '/unifiedinbox/app/components/search/search-form.html',
    controller: 'inboxSearchFormController',
    controllerAs: 'ctrl',
    bindings: {
      query: '='
    }
  });
})(angular);
