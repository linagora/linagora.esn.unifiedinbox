(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .factory('inboxAttachmentRegistry', inboxAttachmentRegistry);

  function inboxAttachmentRegistry(
    esnRegistry,
    INBOX_ATTACHMENT_TYPE_JMAP
  ) {
    var registry = new esnRegistry('inboxAttachmentRegistry', {
      primaryKey: 'type'
    });

    registry.getDefault = function() {
      return registry.get(INBOX_ATTACHMENT_TYPE_JMAP);
    };

    return registry;
  }
})(angular);
