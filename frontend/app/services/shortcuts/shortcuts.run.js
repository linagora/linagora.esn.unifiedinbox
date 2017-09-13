(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .run(runBlock);

  function runBlock(
    esnShortcuts,
    newComposerService,
    INBOX_SHORTCUTS_CATEGORY,
    INBOX_SHORTCUTS
  ) {
    esnShortcuts.register(INBOX_SHORTCUTS_CATEGORY, INBOX_SHORTCUTS);

    esnShortcuts.use(INBOX_SHORTCUTS.OPEN_COMPOSER, function() {
      newComposerService.open({});
    });
  }
})(angular);
