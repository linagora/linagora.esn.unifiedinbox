(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox').component('inboxSearchForm', {
    templateUrl: '/unifiedinbox/app/search/form/search-form.html',
    controller: 'inboxSearchFormController',
    controllerAs: 'ctrl',
    bindings: {
      query: '='
    }
  });
})(angular);
