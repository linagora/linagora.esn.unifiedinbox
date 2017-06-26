'use strict';

/**
 * Core modules requiring an external dependency
 */
angular.module('esn.sidebar', []);
angular.module('esn.iframe-resizer-wrapper', []);
angular.module('esn.summernote-wrapper', []);
angular.module('esn.offline-wrapper', []);
angular.module('esn.autolinker-wrapper', []);
angular.module('linagora.esn.graceperiod', []);
angular.module('esn.waves', []);

/**
 * External dependencies
 */
angular.module('infinite-scroll', []);
angular.module('ngAnimate', []);
angular.module('mgcrea.ngStrap', []);
angular.module('mgcrea.ngStrap.modal', []);
angular.module('mgcrea.ngStrap.alert', []);
angular.module('mgcrea.ngStrap.popover', []);
angular.module('angularFileUpload', []);
angular.module('ngTagsInput', []);
angular.module('ngMessages', []);
angular.module('ngGeolocation', []);
angular.module('matchmedia-ng', []);
angular.module('openpaas-logo', []);
angular.module('esn.datetime', []);
angular.module('esn.i18n', [])
  .factory('esnI18nService', function() {
    return {
      translate: function(input) {
        return {
          text: input,
          toString: function() { return input; }
        };
      },
      isI18nString: function() { return true; }
    };
  })
  .filter('esnI18n', function() {
    return function(input) { return input; };
  });
