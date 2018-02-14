(function(angular) {
  'use strict';

  angular
    .module('linagora.esn.unifiedinbox.mailto')
    .run(function($location, $window, $timeout, sessionFactory, newComposerService, StateManager, inboxMailtoParser, INBOX_MAILTO_AUTOCLOSE_DELAY) {
      sessionFactory.fetchUser(function() {
        newComposerService.open(inboxMailtoParser($location.search().uri), {
          postSendCallback: function() {
            $timeout($window.close.bind($window), INBOX_MAILTO_AUTOCLOSE_DELAY);
          }
        }, {
          closeable: false,
          allowedStates: [],
          initialState: StateManager.STATES.FULL_SCREEN
        });
      });
    });

})(angular);
