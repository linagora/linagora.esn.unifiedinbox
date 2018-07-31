(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('InboxForwardingsUserController', InboxForwardingsUserController);

  function InboxForwardingsUserController(
    _,
    userUtils,
    asyncAction,
    inboxForwardingsService,
    inboxForwardingClient
  ) {
    var self = this;
    var originForwardings;

    self.init = init;
    self.updateUserEmail = updateUserEmail;

    function init() {
      self.userDisplayName = userUtils.displayNameOf(self.user);
      self.status = 'loading';

      inboxForwardingClient.list(self.user.preferredEmail).then(function(result) {
        self.status = 'loaded';
        self.forwardings = result.data;
        originForwardings = angular.copy(self.forwardings);
      }).catch(function() {
        self.status = 'error';
      });
    }

    function updateUserEmail() {
      var updateData = {};

      updateData.forwardingsToAdd = _.difference(self.forwardings, originForwardings);
      updateData.forwardingsToRemove = _.difference(originForwardings, self.forwardings);

      if (!updateData.forwardingsToAdd.length && !updateData.forwardingsToRemove.length) {
        return;
      }

      var notificationMessages = {
        progressing: 'Updating forwardings...',
        success: 'Forwardings updated',
        failure: 'Failed to update forwardings'
      };

      return asyncAction(notificationMessages, function() {
        return inboxForwardingsService.update(updateData, self.user.preferredEmail);
      });
    }
  }
})(angular);
