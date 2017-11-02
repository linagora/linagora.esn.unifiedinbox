(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .service('inboxSharedMailboxesService', function($q, _, inboxConfig, esnUserConfigurationService,
                                                     INBOX_MODULE_NAME, INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY, INBOX_SHAREDMAILBOXES_NAMESPACE_TYPE) {
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
          hiddenSharedMaiboxesConfig = inboxConfig(INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY, {});
        }

        return hiddenSharedMaiboxesConfig;
      }

      function _overwriteMailboxesList(__, newList) {
        return newList;
      }

      function _appendMissingMailboxes(oldList, newList) {
        var cleanOldList = _.zipObject(_.filter(_.pairs(oldList), function(pair) {return !!pair[1];}));

        return _.assign(cleanOldList, newList);
      }

      function _storeHiddenSharedMailboxes(mailboxesToHide) {
        return esnUserConfigurationService.set([{
          name: INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY,
          value: mailboxesToHide
        }], INBOX_MODULE_NAME);
      }

      function _hideMailboxes(computeHiddenMailboxes, mailboxes) {
        if (!mailboxes) {
          return $q.reject('no mailboxes provided');
        }
        mailboxes = angular.isArray(mailboxes) ? mailboxes : [mailboxes];

        var idsToHide = _.map(_.compact(_.pluck(_.filter(mailboxes, { isSharedAndHidden: true }), 'id')), String);
        var rangeOfTrueFor = _.compose(_.partialRight(_.map, _.constant(true)), _.range, _.size);
        var updatesHiddenConfig = _.zipObject(idsToHide, rangeOfTrueFor(idsToHide));

        if (_.isEmpty(updatesHiddenConfig)) {
          return $q.when({});
        }

        return getHiddenMaiboxesConfig()
          .then(function(currentConfig) {
            return _storeHiddenSharedMailboxes(computeHiddenMailboxes(currentConfig, updatesHiddenConfig));
          });
      }

      return {
        isShared: isSharedMailbox,
        getHiddenMaiboxesConfig: getHiddenMaiboxesConfig,
        hideNewMailboxes: _hideMailboxes.bind(null, _appendMissingMailboxes),
        setHiddenMailboxes: _hideMailboxes.bind(null, _overwriteMailboxesList)
      };
    });

})();
