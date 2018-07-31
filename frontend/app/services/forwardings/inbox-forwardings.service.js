(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .factory('inboxForwardingsService', function($q, inboxForwardingClient) {

      return {
        update: update
      };

      function update(updateData, userEmail) {
        return $q.all(updateData.forwardingsToAdd.map(function(forwarding) {
          return inboxForwardingClient.addForwarding(forwarding, userEmail);
        }).concat(updateData.forwardingsToRemove.map(function(forwarding) {
          return inboxForwardingClient.removeForwarding(forwarding, userEmail);
        })));
      }
    });
})(angular);
