(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .factory('InboxMailRepositoryEmail', InboxMailRepositoryEmailFactory);

  function InboxMailRepositoryEmailFactory(_) {
    function InboxMailRepositoryEmail(email) {
      _.assign(this, _.pick(email, ['name', 'sender', 'recipients', 'headers', 'lastUpdated', 'htmlBody', 'textBody']));

      // For reusing inbox component
      this.to = this.recipients.map(function(recipient) {
        return {
          email: recipient,
          name: recipient
        };
      });
      this.date = this.lastUpdated;
      this.from = this.sender;
    }

    return InboxMailRepositoryEmail;
  }
})(angular);
