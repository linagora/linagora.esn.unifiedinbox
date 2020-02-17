(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxIdentityController', function(
      $modal,
      inboxIdentitiesService,
      asyncAction
    ) {
      var self = this;

      self.$onInit = $onInit;
      self.onEditBtnClick = onEditBtnClick;
      self.removeIdentity = removeIdentity;

      /////

      function $onInit() {}

      function onEditBtnClick() {
        $modal({
          templateUrl: '/unifiedinbox/app/components/inbox-configuration/identity/edit/inbox-identity-edit.html',
          backdrop: 'static',
          placement: 'center',
          controllerAs: '$ctrl',
          controller: 'inboxIdentityEditController',
          locals: {
            identity: self.identity,
            user: {
              _id: self.user._id,
              emails: self.user.emails
            }
          }
        });
      }

      function removeIdentity() {
        return asyncAction({
          progressing: 'Removing identity...',
          success: 'Identity removed',
          failure: 'Could not remove identity'
        }, function() {
          return inboxIdentitiesService.removeIdentity(self.identity);
        });
      }
    });

})();
