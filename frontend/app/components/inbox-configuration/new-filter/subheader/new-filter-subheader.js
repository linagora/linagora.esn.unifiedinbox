(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxNewFilterSubheader', {
      templateUrl: '/unifiedinbox/app/components/inbox-configuration/new-filter/subheader/new-filter-subheader.html',
      bindings: {
        onSave: '&'
      }
    });

})();
