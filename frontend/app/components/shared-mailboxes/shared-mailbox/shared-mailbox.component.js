(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxSharedMailbox', {
      templateUrl: '/unifiedinbox/app/components/shared-mailboxes/shared-mailbox/shared-mailbox.html',
       bindings: {
         mailbox: '='
      }
    });

})();
