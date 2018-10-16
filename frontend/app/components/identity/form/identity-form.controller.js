(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxIdentityFormController', function(
      _,
      $state,
      $scope,
      inboxIdentitiesService,
      asyncAction,
      INBOX_SUMMERNOTE_OPTIONS
    ) {
      var self = this;

      self.$onInit = $onInit;
      self.onFocus = onFocus;
      self.onBlur = onBlur;
      self.saveIdentity = saveIdentity;
      self.summernoteOptions = INBOX_SUMMERNOTE_OPTIONS;

      /////

      function $onInit() {
        if (self.identityId) {
          inboxIdentitiesService.getIdentity(self.identityId).then(function(identity) {
            self.identity = _.clone(identity);
          });
        } else {
          self.identity = {};
        }
      }

      function onBlur() {
        self.isSummernoteFocused = false;
        $scope.$apply();
      }

      function onFocus() {
        self.isSummernoteFocused = true;
        $scope.$apply();
      }

      function saveIdentity() {
        $state.go('unifiedinbox.configuration.identities');

        return asyncAction({
          progressing: 'Saving identity...',
          success: 'Identity saved',
          failure: 'Could not save identity'
        }, function() {
          return inboxIdentitiesService.storeIdentity(self.identity);
        });
      }
    });

})();
