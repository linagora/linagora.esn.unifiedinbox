(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxFilterDefinitionSubheader', {
      templateUrl: '/unifiedinbox/app/components/inbox-configuration/filter-definition/subheader/filter-definition-subheader.html',
      bindings: {
        onSave: '&'
      }
    });

})();
