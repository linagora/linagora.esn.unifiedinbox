(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxIdentitiesController', function(
      $q,
      $modal,
      $scope,
      inboxIdentitiesService,
      INBOX_IDENTITIES_EVENTS
    ) {
      var self = this;

      self.$onInit = $onInit;
      self.openCreateForm = openCreateForm;

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

      function openCreateForm() {
        $modal({
          templateUrl: '/unifiedinbox/app/components/inbox-configuration/identity/create/inbox-identity-create.html',
          backdrop: 'static',
          placement: 'center',
          controllerAs: '$ctrl',
          controller: 'inboxIdentityCreateController',
          locals: {
            userId: self.user._id
          }
        });
      }
    });
})();
