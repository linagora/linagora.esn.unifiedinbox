(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .factory('inboxIdentitiesService', function(
      _,
      $q,
      session,
      esnConfig,
      inboxUsersIdentitiesClient
    ) {

      return {
        canEditIdentities: canEditIdentities,
        getAllIdentities: getAllIdentities,
        getDefaultIdentity: getDefaultIdentity,
        storeIdentity: storeIdentity,
        removeIdentity: removeIdentity
      };

      /////

      function canEditIdentities() {
        return session.userIsDomainAdministrator() ?
          $q.when(true) :
          esnConfig('linagora.esn.unifiedinbox.features.allowMembersToManageIdentities', false);
      }

      function getAllIdentities(userId) {
        userId = userId || session.user._id;

        return inboxUsersIdentitiesClient.getIdentities(userId);
      }

      function getDefaultIdentity(userId) {
        userId = userId || session.user._id;

        return getAllIdentities(userId).then(function(identities) {
          return _.find(identities, { default: true });
        });
      }

      function storeIdentity(identity, userId) {
        userId = userId || session.user._id;

        return getAllIdentities(userId).then(function(identities) {
          var targetIdentity = _.find(identities, { uuid: identity.uuid });

          if (!targetIdentity) {
            identities.push(identity);
          } else {
            _.merge(targetIdentity, identity);
          }

          return inboxUsersIdentitiesClient.updateIdentities(userId, identities);
        });
      }

      function removeIdentity(identityId, userId) {
        userId = userId || session.user._id;

        return getAllIdentities(userId).then(function(identities) {
          var targetIdentity = _.find(identities, { uuid: identityId });

          if (!targetIdentity) {
            return $q.reject(new Error('Identity not found'));
          }

          if (targetIdentity.default) {
            return $q.reject(new Error('Could not remove the default identity'));
          }

          _.remove(identities, targetIdentity);

          return inboxUsersIdentitiesClient.updateIdentities(userId, identities);
        });
      }
    });
})();
