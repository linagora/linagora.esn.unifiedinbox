(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

  .constant('INBOX_SHORTCUTS_CATEGORY', {
    id: 'linagora.esn.unifiedinbox',
    name: 'Unified Inbox'
  })

  .constant('INBOX_SHORTCUTS', {
    OPEN_COMPOSER: {
      combo: 'c',
      description: 'Compose new email'
    },
    REPLY_EMAIL: {
      combo: 'r',
      description: 'Reply'
    },
    REPLY_ALL_EMAIL: {
      combo: 'a',
      description: 'Reply all'
    },
    FORWARD_EMAIL: {
      combo: 'f',
      description: 'Forward'
    },
    VIEW_NEXT_EMAIL: {
      combo: 'right',
      description: 'View next email'
    },
    VIEW_PREVIOUS_EMAIL: {
      combo: 'left',
      description: 'View previous email'
    }
  });

})(angular);
