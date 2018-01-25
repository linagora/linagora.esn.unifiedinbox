(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .factory('inboxEmailSendingHookService', inboxEmailSendingHookService);

  function inboxEmailSendingHookService($q) {
    var preSendingHooks = [];
    var postSendingHooks = [];

    return {
      registerPreSendingHook: registerPreSendingHook,
      registerPostSendingHook: registerPostSendingHook,
      preSending: preSending,
      postSending: postSending
    };

    function registerPreSendingHook(hook) {
      if (typeof hook !== 'function') {
        throw new TypeError('Hook must be a function');
      }
      preSendingHooks.push(hook);
    }

    function registerPostSendingHook(hook) {
      if (typeof hook !== 'function') {
        throw new TypeError('Hook must be a function');
      }
      postSendingHooks.push(hook);
    }

    function preSending(email) {
      return $q.all(preSendingHooks.map(function(hook) {
        return hook(email);
      })).then(function() {
        return email;
      });
    }

    function postSending(data) {
      return $q.all(postSendingHooks.map(function(hook) {
        return hook(data);
      }));
    }
  }
})();
