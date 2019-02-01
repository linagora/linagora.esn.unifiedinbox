(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox').factory('inboxEmailerResolver', inboxEmailerResolver);

  function inboxEmailerResolver(inboxSearchCacheService, esnAvatarUrlService, INBOX_AVATAR_SIZE) {
    return function() {
      var self = this;

      return inboxSearchCacheService.searchByEmail(self.email)
        .catch(angular.noop)
        .then(function(result) {
          self.objectType = result && result.objectType;
          self.id = result && result.id;
          self.name = result && result.displayName || self.name;
          self.avatarUrl = result && result.avatarUrl || esnAvatarUrlService.generateUrl(self.email, self.name);
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
