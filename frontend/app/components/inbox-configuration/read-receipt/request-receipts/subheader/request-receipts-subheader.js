(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxRequestReadReceiptsSubheader', {
      templateUrl: '/unifiedinbox/app/components/inbox-configuration/read-receipt/request-receipts/subheader/request-receipts-subheader.html',
      bindings: {
         onSave: '&'
      }
    });

})();
