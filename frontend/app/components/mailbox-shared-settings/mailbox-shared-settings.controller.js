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
    userUtils,
    $q
  ) {

    var self = this;

    self.usersShared = [];
    self.users = [];
    self.onUserAdded = onUserAdded;
    self.onUserRemoved = onUserRemoved;
    self.onAddingUser = onAddingUser;
    self.addSharedUsers = addSharedUsers;
    self.isOwner = isOwner;
    self.sessionUser = session.user;
    self.originalMailbox = $scope.mailbox;

    $onInit();

    //////////////////////

    function $onInit() {
      self.mailbox = _.clone(self.originalMailbox);

      getOwner().then(function(owner) {
        owner.displayName = userUtils.displayNameOf(owner);
        self.owner = owner;
        self.usersShared = self.usersShared.concat(self.owner);
      });
      getUserSharedInformation(self.mailbox.sharedWith);
    }

    function getOwner() {
      var owner;

      if (self.mailbox.namespace.owner && self.mailbox.namespace.owner !== self.sessionUser.preferredEmail) {
        owner = getUsersByEmail(self.mailbox.namespace.owner);
      } else {
        owner = self.sessionUser;
      }

      return $q.resolve(owner);
    }

    function getUserSharedInformation(userSharedList) {
      if (!_.isEmpty(userSharedList)) {
        _.forOwn(userSharedList, function(rightList, email) {
          getUsersByEmail(email).then(function(user) {
            if (user) {
              user.displayName = userUtils.displayNameOf(user);
              self.usersShared = self.usersShared.concat(user);
            }
          });
        });
      }
    }

    function getUsersByEmail(email) {
      return userAPI.getUsersByEmail(email).then(function(response) {
        if (response.data && response.data[0]) {
          return response.data[0];
        }
      });
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

    function isOwner() {
      return self.owner === self.sessionUser;
    }
  }
})();
