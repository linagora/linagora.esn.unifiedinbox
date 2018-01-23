(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .run(run);

  function run(
    inboxAttachmentRegistry,
    inboxAttachmentJmap
  ) {
    inboxAttachmentRegistry.add(inboxAttachmentJmap);
  }
})(angular);
