(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .factory('inboxForwardingClient', inboxForwardingClient);

  function inboxForwardingClient(inboxRestangular) {
    return {
      addForwarding: addForwarding,
      list: list,
      removeForwarding: removeForwarding,
      updateForwardingConfigurations: updateForwardingConfigurations
    };

    /**
     * Add new forwarding.
     *
     * @param  {String} forwarding  - Forwarding email address
     * @return {Promise}            - Resolve on success
     */
    function addForwarding(forwarding, userEmail) {
      return inboxRestangular.all('forwardings').customPUT({ forwarding: forwarding, email: userEmail});
    }

    /**
     * List forwardings.
     *
     * @return {Promise}  - Resolve response with list of forwardings
     */
    function list(userEmail) {
      return inboxRestangular.all('forwardings').customGETLIST('', {email: userEmail});
    }

    /**
     * Remove forwarding.
     *
     * @param  {String} forwarding  - Forwarding email address
     * @return {Promise}            - Resolve on success
     */
    function removeForwarding(forwarding, userEmail) {
      return inboxRestangular.all('forwardings').customOperation('remove', '', {}, { 'Content-Type': 'application/json' }, { forwarding: forwarding, email: userEmail});
    }

    /**
     * Update forwarding configurations: forwarding and isLocalCopyEnabled
     *
     * @param {String} domainId        - Domain ID
     * @param {Object} configurations  - Configurations will be updated
     * @return {Promise}               - Resolve on success
     */
    function updateForwardingConfigurations(domainId, configurations) {
      var params = {
        scope: 'domain',
        domain_id: domainId
      };

      return inboxRestangular.all('forwardings').one('configurations').customPUT(configurations, null, params);
    }
  }
})(angular);
