(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxIdentitiesController', function($q, inboxIdentitiesService) {
      var self = this;

      self.$onInit = $onInit;

      /////

      function $onInit() {
        $q.all([
          inboxIdentitiesService.canEditIdentities(),
          inboxIdentitiesService.getAllIdentities()
        ])
          .then(function(results) {
            self.canEdit = results[0];
            self.identities = results[1];
          });
      }
    });

})();
