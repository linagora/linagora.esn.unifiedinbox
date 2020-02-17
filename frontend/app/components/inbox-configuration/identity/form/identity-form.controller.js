(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxIdentityFormController', function(
      _,
      $scope,
      inboxUsersIdentitiesClient,
      INBOX_SUMMERNOTE_OPTIONS
    ) {
      var self = this;

      self.$onInit = $onInit;
      self.onFocus = onFocus;
      self.onBlur = onBlur;
      self.summernoteOptions = INBOX_SUMMERNOTE_OPTIONS;

      /////

      function $onInit() {
        self.status = 'loading';
        self.identity = self.identity || {};
        self.initiallyDefaultIdentity = self.identity.default;

        return inboxUsersIdentitiesClient.getValidEmails(self.userId)
          .then(function(validEmails) {
            self.status = 'loaded';
            self.validEmails = validEmails;
            self.identity.email = self.identity.email || validEmails[0];
            self.identity.replyTo = self.identity.replyTo || validEmails[0];
          })
          .catch(function() {
            self.status = 'error';
          });
      }

      function onBlur() {
        self.isSummernoteFocused = false;
        $scope.$apply();
      }

      function onFocus() {
        self.isSummernoteFocused = true;
        $scope.$apply();
      }
    });

})();
