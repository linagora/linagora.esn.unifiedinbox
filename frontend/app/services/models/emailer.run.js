(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .run(function(jmap, searchService, esnAvatarUrlService) {
      jmap.EMailer.prototype.resolve = function() {
        var self = this;

        return searchService.searchByEmail(self.email)
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
              url: self.avatarUrl
            };
          });
      };
    });

})();
