(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .constant('INBOX_MAIL_REPOSITORIES_PATH', {
      quarantine: 'var/mail/dlp/quarantine'
    })
    .constant('INBOX_QUARANTINE_EMAIL_FIELDS', ['headers', 'textBody', 'htmlBody']);
})(angular);
