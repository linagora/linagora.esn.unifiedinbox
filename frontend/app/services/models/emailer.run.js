(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox').run(function(jmap, inboxEmailerResolver) {
    jmap.EMailer.prototype.resolve = inboxEmailerResolver;
  });
})(angular);
