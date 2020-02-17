(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxComposerIdentitySelectorController', function(_, inboxIdentitiesService) {
      var self = this;

      self.$onInit = $onInit;
      self.onIdentityChange = onIdentityChange;
      self.getIdentityLabel = getIdentityLabel;

      /////

      function $onInit() {
        inboxIdentitiesService.getAllIdentities()
          .then(function(identities) {
            self.identities = identities;

            // This will be improved in the future if we support a "preferred" identity (which might not be the default one)
            // For now we always pre-select the default identity
            self.identity = _.find(identities, self.identity ? { uuid: self.identity.uuid } : { default: true });
          })
          .then(onIdentityChange);
      }

      function onIdentityChange() {
        self.onIdentityUpdate({ $identity: self.identity });
      }

      function getIdentityLabel(identity) {
        return identity.name + ' <' + identity.email + '>';
      }

    });

})();
