(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .factory('inboxOpenEmailMessageService', function($state, $stateParams, _) {
      return {
        getEmailState: getEmailState
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

})();
