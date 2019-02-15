(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .factory('inboxOpenEmailMessageService', function($state, $stateParams, _) {
      return {
        getEmailState: getEmailState,
        getThreadState: getThreadState
      };

      /////

      function getEmailState(href, email, mailbox) {
        if (!email) {
          return;
        }

        return $state.href(href, {
          mailbox: $stateParams.mailbox || (mailbox && mailbox.id) || _.first(email.mailboxIds),
          emailId: email.id,
          item: email
        });
      }

      function getThreadState(href, thread, mailbox) {
        if (!thread) {
          return;
        }

        return $state.href(href, {
          mailbox: $stateParams.mailbox || (mailbox && mailbox.id) || _.first(thread.lastEmail.mailboxIds),
          threadId: thread.id,
          item: thread
        });
      }
    });

})();
