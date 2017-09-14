'use strict';

/**
 * Core modules requiring an external dependency
 */
angular.module('esn.sidebar', []);
angular.module('esn.shortcuts', [])
  .factory('esnShortcuts', function() {
    return {
      register: angular.noop,
      use: angular.noop
    };
  });
