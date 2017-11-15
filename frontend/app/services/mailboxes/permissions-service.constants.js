(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .constant('INBOX_PERSONAL_MAILBOX_NAMESPACE_TYPE', 'personal')

    .constant('INBOX_MAILBOX_SHARING_ROLES', {
      READ_AND_UPDATE: 'READ_AND_UPDATE',
      ORGANIZE: 'ORGANIZE'
    })

    // cf IMAP ACL Extension https://tools.ietf.org/html/rfc4314#section-2.1
    .constant('INBOX_MAILBOX_SHARING_PERMISSIONS', {
      READ_AND_UPDATE: ['l', 'r', 'w'],
      ORGANIZE: ['l', 'r', 'w', 'i', 'e']
    });
})();
