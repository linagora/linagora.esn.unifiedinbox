(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxMessageBodyController', inboxMessageBodyController);

  function inboxMessageBodyController() {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      if (self.message && self.message.htmlBody) {
        var newHtmlBody = angular.element(self.message.htmlBody);

        if (newHtmlBody.length) {
          newHtmlBody.find('a').attr('target', '_blank').attr('rel', 'nofollow noopener');
          self.message.htmlBody = newHtmlBody.html();
        }
      }
    }
  }

})();
