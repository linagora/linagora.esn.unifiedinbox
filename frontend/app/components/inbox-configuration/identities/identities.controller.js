(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxIdentitiesController', function(
      $q,
      $scope,
      inboxIdentitiesService,
      INBOX_IDENTITIES_EVENTS
    ) {
      var self = this;

      self.$onInit = $onInit;

      /////

      function $onInit() {
        $q.all([
          inboxIdentitiesService.canEditIdentities(),
          inboxIdentitiesService.getAllIdentities(self.user._id)
        ])
          .then(function(results) {
            self.canEdit = results[0];
            self.identities = results[1];
          });

        $scope.$on(INBOX_IDENTITIES_EVENTS.UPDATED, onUpdatedIdentitiesEvent);
      }

      function onUpdatedIdentitiesEvent(event, updatedIdentities) {
        self.identities = updatedIdentities;
      }
    });
})();
