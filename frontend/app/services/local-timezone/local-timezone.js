(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .factory('localTimezone', function() {
      // Explicit '' here to tell angular to use the browser timezone for
      // Date formatting in the 'date' filter. This factory is here to be mocked in unit tests
      // so that the formatting is consistent accross various development machines.
      //
      // See: https://docs.angularjs.org/api/ng/filter/date
      return '';
    });

})();
