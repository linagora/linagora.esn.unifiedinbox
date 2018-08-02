(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxQuarantineEmailListController', inboxQuarantineEmailListController);

  function inboxQuarantineEmailListController(
    infiniteScrollHelper,
    inboxMailRepositoryService,
    session,
    INBOX_MAIL_REPOSITORIES_PATH
  ) {
    var self = this;
    var quarantineRepositoryPath;
    var options = {
      offset: 0,
      limit: 20
    };

    self.$onInit = $onInit;
    self.download = download;

    function $onInit() {
      quarantineRepositoryPath = [INBOX_MAIL_REPOSITORIES_PATH.quarantine, session.domain.name].join('/');

      self.loadMoreElements = infiniteScrollHelper(self, _loadNextItems);
    }

    function download(email) {
      inboxMailRepositoryService.downloadEmlFile(quarantineRepositoryPath, email.name);
    }

    function _loadNextItems() {
      options.offset = self.elements.length;

      return inboxMailRepositoryService.list(quarantineRepositoryPath, options);
    }
  }
})(angular);
