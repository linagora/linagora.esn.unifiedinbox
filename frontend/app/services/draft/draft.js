(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .factory('Draft', function($rootScope, $q, _, emailBodyService, asyncJmapAction, inboxJmapHelper,
                               waitUntilMessageIsComplete, inboxConfig, gracePeriodService,
                               INBOX_EVENTS, ATTACHMENTS_ATTRIBUTES) {
      function Draft(original) {
        this.original = original ? angular.copy(original) : {};
      }

      Draft.prototype.needToBeSaved = function(newEmailState) {
        var original = this.original,
            newest = newEmailState || {};

        return $q(function(resolve, reject) {
          if (
            trim(original.subject) !== trim(newest.subject) ||
            haveDifferentBodies(original, newest) ||
            haveDifferentRecipients(original.to, newest.to) ||
            haveDifferentRecipients(original.cc, newest.cc) ||
            haveDifferentRecipients(original.bcc, newest.bcc) ||
            haveDifferentAttachments(original.attachments, newest.attachments)
          ) {
            return resolve();
          }

          reject();
        });
      };

      Draft.prototype.save = function(email, options) {
        var self = this;

        return _areDraftsEnabled()
          .then(self.needToBeSaved.bind(self, email))
          .then(waitUntilMessageIsComplete.bind(null, email))
          .then(self.destroy.bind(self, { silent: true }))
          .then(function() {
            return asyncJmapAction('Saving your email as draft', function(client) {
              return inboxJmapHelper.toOutboundMessage(client, email).then(function(message) {
                return client.saveAsDraft(message).then(function(ack) {
                  self.original = angular.copy(email);
                  self.original.id = ack.id;
                });
              });
            }, options);
          })
          .then(function() {
            $rootScope.$broadcast(INBOX_EVENTS.DRAFT_CREATED, self.original);
          });
      };

      Draft.prototype.destroy = function(options) {
        var self = this;

        return _areDraftsEnabled()
          .then(function() {
            if (!options || !options.silent) {
              return gracePeriodService.askUserForCancel('This draft has been discarded', 'Reopen').promise
                .then(function(result) {
                  if (result.cancelled) {
                    return $q.reject();
                  }
                });
            }
          })
          .then(function() {
            if (self.original.id) {
              return asyncJmapAction('Destroying a draft', function(client) {
                return client.destroyMessage(self.original.id);
              }, { silent: true });
            }
          })
          .then(function() {
            $rootScope.$broadcast(INBOX_EVENTS.DRAFT_DESTROYED, self.original);
          });
      };

      return Draft;

      /////

      function _keepSomeAttributes(array, attibutes) {
        return _.map(array, function(data) {
          return _.pick(data, attibutes);
        });
      }

      function haveDifferentRecipients(left, right) {
        return _.xor(_.map(left, 'email'), _.map(right, 'email')).length > 0;
      }

      function haveDifferentBodies(original, newest) {
        return trim(original[emailBodyService.bodyProperty]) !== trim(newest[emailBodyService.bodyProperty]);
      }

      function haveDifferentAttachments(original, newest) {
        return !_.isEqual(_keepSomeAttributes(original, ATTACHMENTS_ATTRIBUTES), _keepSomeAttributes(newest, ATTACHMENTS_ATTRIBUTES));
      }

      function trim(value) {
        return (value || '').trim();
      }

      function _areDraftsEnabled() {
        return inboxConfig('drafts').then(function(value) {
          return value ? $q.when() : $q.reject();
        });
      }

    });

})();
