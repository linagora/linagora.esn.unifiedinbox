(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .service('inboxSharedMailboxesService', function($q, _, inboxConfig, esnUserConfigurationService,
                                                     INBOX_MODULE_NAME, INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY, INBOX_SHAREDMAILBOXES_NAMESPACE_TYPE, INBOX_MAILBOXES_NON_SHAREABLE) {
      var hiddenSharedMaiboxesConfig;

      function isSharedMailbox(mailbox) {
        if (!mailbox || !mailbox.namespace || !mailbox.namespace.type) {
          return false;
        }

        return mailbox.namespace && mailbox.namespace.type &&
          mailbox.namespace.type.toLowerCase() === INBOX_SHAREDMAILBOXES_NAMESPACE_TYPE;
      }

      function getHiddenMaiboxesConfig() {
        if (!hiddenSharedMaiboxesConfig) {
          return inboxConfig(INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY, {})
          .then(function(results) {
            hiddenSharedMaiboxesConfig = results;

            return hiddenSharedMaiboxesConfig;
          });
        }

        return $q.when(hiddenSharedMaiboxesConfig);
      }

      function _storeHiddenSharedMailboxes(mailboxesToHide) {
        hiddenSharedMaiboxesConfig = mailboxesToHide;

        return esnUserConfigurationService.set([{
          name: INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY,
          value: mailboxesToHide
        }], INBOX_MODULE_NAME);
      }

      function _overwriteMailboxesList(__, newList) {
        return _storeHiddenSharedMailboxes(newList);
      }

      function _appendMissingMailboxes(oldList, newList) {
        var cleanOldList = _.zipObject(_.filter(_.pairs(oldList), function(pair) {return !!pair[1];}));

        return _.isEmpty(newList) ? $q.when({}) : _storeHiddenSharedMailboxes(_.assign(cleanOldList, newList));
      }

      function _hideMailboxes(storeHiddenSharedMailboxes, mailboxes) {
        if (!mailboxes) {
          return $q.reject('no mailboxes provided');
        }
        mailboxes = angular.isArray(mailboxes) ? mailboxes : [mailboxes];
        var mailboxesToHide = _.filter(mailboxes, { isDisplayed: false });

        var idsToHide = _.map(_.compact(_.pluck(mailboxesToHide, 'id')), String);
        var rangeOfTrueFor = _.compose(_.partialRight(_.map, _.constant(true)), _.range, _.size);
        var updatesHiddenConfig = _.zipObject(idsToHide, rangeOfTrueFor(idsToHide));

        return getHiddenMaiboxesConfig()
          .then(function(currentConfig) {
            return storeHiddenSharedMailboxes(currentConfig, updatesHiddenConfig);
          });
      }

      function isShareableMailbox(mailbox) {
        var mailboxRole = mailbox.role.value;

        if (mailboxRole !== null) {
          return !_.contains(INBOX_MAILBOXES_NON_SHAREABLE, mailboxRole.toLowerCase());
        }

        return true;
      }

      return {
        isShared: isSharedMailbox,
        getHiddenMaiboxesConfig: getHiddenMaiboxesConfig,
        hideNewMailboxes: _hideMailboxes.bind(null, _appendMissingMailboxes),
        setHiddenMailboxes: _hideMailboxes.bind(null, _overwriteMailboxesList),
        isShareableMailbox: isShareableMailbox
      };
    });

})();
