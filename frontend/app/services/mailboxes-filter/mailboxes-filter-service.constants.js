(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .constant('JMAP_FILTER', {
      CONDITIONS: {
        FROM: {
          JMAP_KEY: 'from',
          HUMAN_REPRESENTATION: 'email is from %s'
        }
      },
      CONDITIONS_MAPPING: {
        from: 'FROM'
      },
      ACTIONS: {
        MOVE_TO: {
          JMAP_KEY: 'appendIn',
          HUMAN_REPRESENTATION: 'move to destination folder %s'
        }
      },
      ACTIONS_MAPPING: {
        appendIn: 'MOVE_TO'
      }
    });
})();
