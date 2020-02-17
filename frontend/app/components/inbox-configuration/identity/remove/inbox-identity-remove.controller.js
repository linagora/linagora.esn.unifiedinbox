(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxIdentityRemoveController', inboxIdentityRemoveController);

  function inboxIdentityRemoveController(
    $rootScope,
    asyncAction,
    identity,
    user,
    inboxIdentitiesService,
    INBOX_IDENTITIES_EVENTS
  ) {
    var self = this;

    self.init = init;
    self.onRemoveBtnClick = onRemoveBtnClick;

    function init() {
      self.identity = identity;
    }

    function onRemoveBtnClick() {
      return asyncAction({
        progressing: 'Removing identity...',
        success: 'Identity removed',
        failure: 'Failed to remove identity'
      }, function() {
        return _removeIdentity();
      });
    }

    function _removeIdentity() {
      return inboxIdentitiesService.removeIdentity(self.identity.uuid, user._id)
        .then(updatedIdentities => {
          $rootScope.$broadcast(INBOX_IDENTITIES_EVENTS.UPDATED, updatedIdentities);
        });
    }
  }
})(angular);
