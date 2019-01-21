(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxMessageBodyHtmlController', function(newComposerService) {
      var self = this;
      self.disableAutoScale = disableAutoScale;

      function disableAutoScale() {
        self.autoScaleDisabled = true;
      }

      function openMailtoUrlInComposer(emailAddress) {
        newComposerService.open({
            to: [{
              email: emailAddress,
              name: emailAddress
            }]
          }
        );
      }
    });

})();
