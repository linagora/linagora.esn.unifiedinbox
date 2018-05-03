(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('InboxForwardingsController', InboxForwardingsController);

  function InboxForwardingsController(
    $q,
    _,
    session,
    asyncAction,
    inboxConfig,
    inboxForwardingClient,
    inboxForwardingsService
  ) {
    var self = this;
    var userEmail = session.user.preferredEmail;
    var originalKeepLocalCopy;
    var forwardingsToAdd = [];
    var forwardingsToRemove = [];

    self.$onInit = $onInit;
    self.onSave = onSave;
    self.onAddForwarding = onAddForwarding;
    self.onRemoveForwarding = onRemoveForwarding;

    function $onInit() {
      self.status = 'loading';

      $q.all([
        inboxConfig('forwarding', false),
        inboxConfig('isLocalCopyEnabled', false),
        inboxForwardingClient.list()
      ]).then(function(result) {
        self.status = 'loaded';
        self.isForwardingEnabled = result[0];
        self.isLocalCopyEnabled = result[1];
        _showForwardings(result[2].data);
      }).catch(function() {
        self.status = 'error';
      });
    }

    function _showForwardings(forwardings) {
      var index = forwardings.indexOf(userEmail);

      // not show user email in forwardings list but turn on Keep Local Copy
      if (index > -1) {
        self.keepLocalCopy = true;
        forwardings.splice(index, 1);
      } else {
        self.keepLocalCopy = false;
      }
      originalKeepLocalCopy = self.keepLocalCopy;

      self.forwardings = forwardings;
      _setExcludedEmails(self.forwardings);
    }

    function _setExcludedEmails(currentForwardings) {
      self.excludedEmails = [userEmail].concat(currentForwardings);
    }

    function onSave() {
      var updateData = {};

      updateData.forwardingsToAdd = _.difference(forwardingsToAdd, forwardingsToRemove);
      updateData.forwardingsToRemove = _.difference(forwardingsToRemove, forwardingsToAdd);

      if (originalKeepLocalCopy !== self.keepLocalCopy) {
        self.keepLocalCopy ? updateData.forwardingsToAdd.push(userEmail) : updateData.forwardingsToRemove.push(userEmail);
      }

      if (!updateData.forwardingsToAdd.length && !updateData.forwardingsToRemove.length) {
        return;
      }

      var notificationMessages = {
        progressing: 'Updating forwardings...',
        success: 'Forwardings updated',
        failure: 'Failed to update forwardings'
      };

      return asyncAction(notificationMessages, function() {
        return inboxForwardingsService.update(updateData);
      }).then(function() {
        forwardingsToAdd = [];
        forwardingsToRemove = [];
        originalKeepLocalCopy = self.keepLocalCopy;
      });
    }

    function onAddForwarding() {
      var newForwardingEmails = self.newForwardings.map(function(newForwarding) {
        return newForwarding.email;
      });

      forwardingsToAdd = forwardingsToAdd.concat(newForwardingEmails);
      self.forwardings = self.forwardings.concat(newForwardingEmails);
      _setExcludedEmails(self.forwardings);
      _resetForwardingForm();
    }

    function onRemoveForwarding(selectedForwarding) {
      self.forwardings = self.forwardings.filter(function(forwarding) {
        return forwarding !== selectedForwarding;
      });
      _setExcludedEmails(self.forwardings);

      forwardingsToRemove.push(selectedForwarding);
    }

    function _resetForwardingForm() {
      self.newForwardings = [];
    }
  }
})(angular);
