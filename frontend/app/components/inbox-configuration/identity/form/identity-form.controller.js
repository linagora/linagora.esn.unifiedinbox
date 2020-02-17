(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxIdentityFormController', function(
      _,
      $scope,
      INBOX_SUMMERNOTE_OPTIONS
    ) {
      var self = this;

      self.$onInit = $onInit;
      self.onFocus = onFocus;
      self.onBlur = onBlur;
      self.summernoteOptions = INBOX_SUMMERNOTE_OPTIONS;

      /////

      function $onInit() {
        self.identity = self.identity || {};
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
