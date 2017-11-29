(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxFilterInputController', function() {
      var self = this;

      self.clearFilter = clearFilter;

      /////

      function clearFilter($event) {
        $event.preventDefault();
        $event.stopPropagation();
        self.onChange({ $filter: self.filter = '' });
      }
    });

})();
