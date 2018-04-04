(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxRequestReadReceiptsSubheader', {
      templateUrl: '/unifiedinbox/app/components/read-receipt/request-receipts/subheader/request-receipts-subheader.html',
      bindings: {
         onSave: '&'
      }
    });

})();
