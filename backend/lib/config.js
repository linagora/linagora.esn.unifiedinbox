module.exports = dependencies => {
  const esnConfig = dependencies('esn-config');
  const CONFIG = {
    rights: {
      admin: 'rw',
      user: 'r'
    },
    configurations: {
      view: {},
      api: {},
      uploadUrl: {},
      downloadUrl: {},
      isJmapSendingEnabled: {},
      isSaveDraftBeforeSendingEnabled: {},
      'composer.attachments': {},
      maxSizeUpload: {},
      numberItemsPerPageOnBulkReadOperations: {},
      numberItemsPerPageOnBulkDeleteOperations: {},
      numberItemsPerPageOnBulkUpdateOperations: {},
      drafts: {},
      swipeRightAction: {},
      'identities.default': {
        rights: {
          admin: 'rw',
          user: 'rw'
        }
      },
      identities: {
        rights: {
          admin: 'rw',
          user: 'rw'
        }
      },
      hiddenSharedMaiboxes: {
        rights: {
          user: 'rw'
        }
      }
    }
  };

  return {
    register
  };

  function register() {
    esnConfig.registry.register('linagora.esn.unifiedinbox', CONFIG);
  }
};
