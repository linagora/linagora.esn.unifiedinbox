(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .factory('inboxForwardingClient', inboxForwardingClient);

  function inboxForwardingClient(inboxRestangular) {
    return {
      addForwarding: addForwarding,
      list: list,
      removeForwarding: removeForwarding
    };

    /**
     * Add new forwarding.
     *
     * @param  {String} forwarding  - Forwarding email address
     * @return {Promise}            - Resolve on success
     */
    function addForwarding(forwarding) {
      return inboxRestangular.all('forwardings').customPUT({ forwarding: forwarding });
    }

    /**
     * List forwardings.
     *
     * @return {Promise}  - Resolve response with list of forwardings
     */
    function list() {
      return inboxRestangular.all('forwardings').getList();
    }

    /**
     * Remove forwarding.
     *
     * @param  {String} forwarding  - Forwarding email address
     * @return {Promise}            - Resolve on success
     */
    function removeForwarding(forwarding) {
      return inboxRestangular.all('forwardings').customOperation('remove', '', {}, { 'Content-Type': 'application/json' }, { forwarding: forwarding });
    }
  }
})(angular);
