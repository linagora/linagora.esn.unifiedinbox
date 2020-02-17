(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxIdentityController', function(
      $modal
    ) {
      var self = this;

      self.onEditBtnClick = onEditBtnClick;
      self.onRemoveBtnClick = onRemoveBtnClick;

      /////

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

      function onRemoveBtnClick() {
        $modal({
          templateUrl: '/unifiedinbox/app/components/inbox-configuration/identity/remove/inbox-identity-remove.html',
          backdrop: 'static',
          placement: 'center',
          controllerAs: '$ctrl',
          controller: 'inboxIdentityRemoveController',
          locals: {
            identity: self.identity,
            user: {
              _id: self.user._id
            }
          }
        });
      }
    });

})();
