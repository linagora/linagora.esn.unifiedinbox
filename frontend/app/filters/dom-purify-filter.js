(function(angular) {
  'use strict';

  /* global DOMPurify: false */
  angular.module('linagora.esn.unifiedinbox').filter('domPurify', function($sce) {
    return function(dirty) {
      return $sce.trustAsHtml(DOMPurify.sanitize(dirty));
    };
  });

})(angular);

