(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .component('inboxMessageBodyHtml', {
      templateUrl: '/unifiedinbox/app/components/message-body/html/message-body-html.html',
      controller: 'inboxMessageBodyHtmlController',
      bindings: {
        message: '<'
      }
    });

})();
