(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .factory('inboxForwardingsService', function($q, inboxForwardingClient) {

      return {
        update: update
      };

      function update(updateData) {
        return $q.all(updateData.forwardingsToAdd.map(function(forwarding) {
          return inboxForwardingClient.addForwarding(forwarding);
        }).concat(updateData.forwardingsToRemove.map(function(forwarding) {
          return inboxForwardingClient.removeForwarding(forwarding);
        })));
      }
    });
})(angular);
