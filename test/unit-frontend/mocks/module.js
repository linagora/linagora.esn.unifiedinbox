'use strict';

/**
 * Core modules requiring an external dependency
 */
angular.module('esn.sidebar', []);
angular.module('hl.sticky', []);
angular.module('esn.shortcuts', [])
  .factory('esnShortcuts', function() {
    return {
      register: angular.noop,
      use: angular.noop
    };
  });
angular.module('linagora.esn.james', [])
  .factory('jamesWebadminClient', function() {
    return {
      downloadEmlFileFromMailRepository: angular.noop,
      listMailsInMailRepository: angular.noop,
      getMailInMailRepository: angular.noop
    };
  });
angular.module('ngCookies', []);
angular.module('linagora.esn.unifiedinbox', function($provide) {
  $provide.value('esnConfig', function(key) {
    if (key === 'core.language') {
      return $q.when('en');
    } else if (key === 'core.datetime') {
      return $q.when({timeZone: 'Europe/Berlin'});
    }

    return $q.when();
  });
});
