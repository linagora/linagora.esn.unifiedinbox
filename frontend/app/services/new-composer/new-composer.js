(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .service('newComposerService', function($state, inboxJmapHelper, boxOverlayOpener, deviceDetector) {
      var defaultTitle = 'New message';

      return {
        open: open,
        openDraft: openDraft
      };

      /////

      function choseByPlatform(mobile, others) {
        deviceDetector.isMobile() ? mobile() : others();
      }

      function newMobileComposer(email, compositionOptions) {
        $state.go('unifiedinbox.compose', {
          email: email,
          compositionOptions: compositionOptions
        });
      }

      function newBoxedComposerCustomTitle(email, compositionOptions, boxConfig) {
        boxOverlayOpener.open(angular.extend({}, boxConfig, {
          id: email && email.id,
          title: defaultTitle,
          templateUrl: '/unifiedinbox/views/composer/box-compose.html',
          email: email,
          compositionOptions: compositionOptions
        }));
      }

      function newBoxedDraftComposer(email, boxConfig) {
        newBoxedComposerCustomTitle(email, null, boxConfig);
      }

      function open(email, compositionOptions, boxConfig) {
        choseByPlatform(
          newMobileComposer.bind(null, email, compositionOptions),
          newBoxedComposerCustomTitle.bind(null, email, compositionOptions, boxConfig)
        );
      }

      function openDraft(id, boxConfig) {
        inboxJmapHelper.getMessageById(id).then(function(message) {
          choseByPlatform(
            newMobileComposer.bind(this, message),
            newBoxedDraftComposer.bind(this, message, boxConfig)
          );
        });
      }
    });

})();
