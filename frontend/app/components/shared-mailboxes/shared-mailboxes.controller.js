(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxSharedMailboxesController', function(inboxMailboxesService, inboxSharedMailboxesService, _) {
      var self = this;

      self.$onInit = $onInit;
      self.onSave = onSave;

      /////

      function $onInit() {
        inboxMailboxesService.sharedMailboxesList().then(function(mailboxes) {
          self.mailboxes = _.map(mailboxes, function(mailbox) {
            return _.defaults(mailbox, { isSharedAndHidden: false });
          });
        });
      }

      function onSave() {
        inboxSharedMailboxesService.setHiddenMailboxes(self.mailboxes);
      }

    });

})();
