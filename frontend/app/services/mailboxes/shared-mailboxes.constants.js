(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .constant('INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY', 'hiddenSharedMailboxes')
    .constant('INBOX_ROLE_NAMESPACE_TYPES', {
      shared: 'delegated',
      owned: 'personal'
    })
    .constant('INBOX_MAILBOXES_NON_SHAREABLE', ['drafts', 'outbox', 'sent', 'trash']);

})();
