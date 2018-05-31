(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')

    .controller('inboxComposerBodyEditorHtmlController', function($timeout, $scope, $element, $compile,
                                                                  INBOX_EVENTS, INBOX_SUMMERNOTE_OPTIONS, INBOX_SIGNATURE_SEPARATOR) {
      var self = this,
          summernoteIsReady = false;

      self.$onChanges = $onChanges;
      self.onSummernoteInit = onSummernoteInit;
      self.onSummernoteKeydown = onSummernoteKeydown;
      self.onSummernoteBlur = onSummernoteBlur;
      self.summernoteOptions = INBOX_SUMMERNOTE_OPTIONS;

      /////

      function $onChanges(bindings) {
        if (bindings.identity) {
          updateIdentity(bindings.identity.currentValue, !bindings.identity.previousValue);
        }
      }

      function onSummernoteKeydown(event) {
        if (event.ctrlKey && (event.keyCode === 10 || event.keyCode === 13)) {
          self.send();
        }
      }

      function onSummernoteInit() {
        summernoteIsReady = true;

        updateIdentity(self.identity, true);

        // Hackish way of making tab/shift+tab work between summernote and it's previous field
        // Should be fixed at the summernote level...
        $element
          .find('.note-toolbar a')
          .attr('tabindex', '-1');

        $element
          .find('.note-editable')
          .after($compile('<inbox-composer-attachments message="$ctrl.message" upload="$ctrl.upload({ $attachment: $attachment })" remove-attachment="$ctrl.removeAttachment({ $attachment: $attachment })" />')($scope));
      }

      function onSummernoteBlur() {
        self.onBodyUpdate({ $body: $element.find('.summernote').summernote('code') });
      }

      function updateIdentity(identity, initializing) {
        if (!summernoteIsReady || !identity || !initializing && self.message.isDraft) {
          return;
        }

        var editable = $element.find('.note-editable'),
            signatureElement = editable.find('> pre.openpaas-signature'),
            citeElement = editable.find('> cite');

        if (identity.textSignature) {
          if (!signatureElement.length) {
            signatureElement = angular.element('<pre class="openpaas-signature"></pre>');

            if (citeElement.length) {
              signatureElement.insertBefore(citeElement.get(0));
            } else {
              signatureElement.appendTo(editable);
            }
          }

          signatureElement.text(INBOX_SIGNATURE_SEPARATOR + identity.textSignature);
        } else {
          signatureElement.remove();
        }
      }
    });

})();
