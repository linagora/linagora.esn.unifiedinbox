(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .filter('inboxFilterVisibleSharedMailboxes', function(_, inboxSharedMailboxesService) {
      return function(mailboxes) {
        return _.filter(mailboxes, function(mailbox) {
          return inboxSharedMailboxesService.isShared(mailbox) && !(mailbox.isDisplayed === false);
        });
      };
    });

})();
