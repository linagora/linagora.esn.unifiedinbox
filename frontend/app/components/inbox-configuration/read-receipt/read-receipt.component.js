(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxReadReceipt', {
      templateUrl: '/unifiedinbox/app/components/inbox-configuration/read-receipt/read-receipt.html',
      controller: 'inboxReadReceiptController',
      bindings: {
        message: '<'
      }
    });

})();
