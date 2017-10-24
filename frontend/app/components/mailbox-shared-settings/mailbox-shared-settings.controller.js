(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('InboxMailboxSharedSettingsController', InboxMailboxSharedSettingsController);

  function InboxMailboxSharedSettingsController(
    $scope,
    _,
    session,
    inboxMailboxesService,
    userAPI,
    userUtils
  ) {

    var self = this;

    self.usersShared = [];
    self.users = [];
    self.onUserAdded = onUserAdded;
    self.onUserRemoved = onUserRemoved;
    self.onAddingUser = onAddingUser;
    self.addSharedUsers = addSharedUsers;
    self.sessionUser = session.user;
    self.originalMailbox = $scope.mailbox;

    $onInit();

    //////////////////////

    function $onInit() {
      self.mailbox = _.clone(self.originalMailbox);
      self.sessionUser.displayName = userUtils.displayNameOf(self.sessionUser);
      self.usersShared = self.usersShared.concat(self.sessionUser);

      getUserSharedInformation(self.mailbox.sharedWith);
    }

    function getUserSharedInformation(userSharedList) {
      if (!_.isEmpty(userSharedList)) {
        _.forOwn(userSharedList, function(rightList, email) {
          userAPI.getUsersByEmail(email).then(function(response) {
            if (response.data && response.data[0]) {
              response.data[0].displayName = userUtils.displayNameOf(response.data[0]);
              self.usersShared = self.usersShared.concat(response.data[0]);
            }
          });
        });
      }
    }

    function onUserAdded(user) {
      if (!user) {
        return;
      }

      self.usersShared = self.usersShared.concat(user);
      self.users = [];
    }

    function onUserRemoved(user) {
      if (!user) {
        return;
      }

      _.remove(self.usersShared, { _id: user._id });
    }

    function onAddingUser($tags) {
      var canBeAdded = !!$tags._id && !self.usersShared.some(function(shared) {
        return $tags._id === shared._id;
      });

      return canBeAdded;
    }

    function addSharedUsers() {
      self.mailbox.sharedWith = {};
      self.usersShared.splice(0, 1);
      self.usersShared.forEach(function(element) {
        self.mailbox.sharedWith[element.preferredEmail] = ['l', 'r'];
      });

      return inboxMailboxesService.updateMailbox(self.originalMailbox, self.mailbox);
    }
  }
})();
