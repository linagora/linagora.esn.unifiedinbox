(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox').factory('inboxEmailerResolver', inboxEmailerResolver);

  function inboxEmailerResolver(inboxCacheService, esnAvatarUrlService, INBOX_AVATAR_SIZE) {
    return function() {
      var self = this;

      return inboxCacheService.resolveEmail(self.email)
        .catch(angular.noop)
        .then(function(person) {
          self.objectType = person && person.objectType ? person.objectType : 'email';
          self.id = person && person.id;
          self.name = person && person.names && person.names[0] && person.names[0].displayName || self.name;
          self.avatarUrl = person && person.photos && person.photos[0] && person.photos[0].url || esnAvatarUrlService.generateUrl(self.email, self.name);
        })
        .then(function() {
          return {
            id: self.objectType === 'user' && self.id,
            email: self.email,
            url: addSize(self.avatarUrl, INBOX_AVATAR_SIZE)
          };
        });
    };

    function addSize(avatarUrl, size) {
      return avatarUrl.split('?').length > 1 ? avatarUrl + '&size=' + size : avatarUrl + '?size=' + size;
    }
  }
})(angular);
