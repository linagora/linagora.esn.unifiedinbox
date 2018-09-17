(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .constant('JMAP_FILTER', {
      CONDITIONS: {
        FROM: {
          JMAP_KEY: 'from',
          HUMAN_REPRESENTATION: 'email is from %s'
        },
        TO: {
          JMAP_KEY: 'to',
          HUMAN_REPRESENTATION: 'email is intended for %s'
        },
        CC: {
          JMAP_KEY: 'cc',
          HUMAN_REPRESENTATION: '%s is an hidden recipient of the email'
        },
        RECIPIENT: {
          JMAP_KEY: 'recipient',
          HUMAN_REPRESENTATION: '%s is a recipient or an hidden recipient of the email'
        },
        SUBJECT: {
          JMAP_KEY: 'subject',
          HUMAN_REPRESENTATION: 'email has subject %s'
        }
      },
      CONDITIONS_MAPPING: {
        from: 'FROM',
        to: 'TO',
        cc: 'CC',
        recipient: 'RECIPIENT',
        subject: 'SUBJECT'
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
