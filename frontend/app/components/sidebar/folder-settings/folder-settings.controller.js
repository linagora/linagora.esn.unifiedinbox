(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxFolderSettingsController', inboxFolderSettingsController);

  function inboxFolderSettingsController(inboxJmapItemService) {
    var self = this;

    self.emptyTrash = emptyTrash;
    self.markAllAsRead = markAllAsRead;

    /////

    function emptyTrash(mailboxId) {
      if (mailboxId) {
        inboxJmapItemService.emptyMailbox(mailboxId);
      }
    }

    function markAllAsRead(mailboxId) {
      inboxJmapItemService.markAllAsRead(mailboxId);
    }
  }
})();
