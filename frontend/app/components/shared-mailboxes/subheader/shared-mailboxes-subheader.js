(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .component('inboxSharedMailboxesSubheader', {
      templateUrl: '/unifiedinbox/app/components/shared-mailboxes/subheader/shared-mailboxes-subheader.html',
      bindings: {
         onSave: '&'
      }
    });

})();
