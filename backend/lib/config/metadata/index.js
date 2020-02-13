module.exports = dependencies => ({
  rights: {
    padmin: 'rw',
    admin: 'rw',
    user: 'r'
  },
  configurations: {
    api: require('./api')(dependencies),
    'composer.attachments': require('./composer-attachments')(dependencies),
    downloadUrl: require('./download-url')(dependencies),
    drafts: require('./drafts')(dependencies),
    forwarding: require('./forwarding')(dependencies),
    hiddenSharedMailboxes: require('./hidden-shared-mailboxes')(dependencies),
    requestReceipts: require('./request-receipts')(dependencies),
    isJmapSendingEnabled: require('./is-jmap-sending-enabled')(dependencies),
    isLocalCopyEnabled: require('./is-local-copy-enabled')(dependencies),
    maxSizeUpload: require('./max-size-upload')(dependencies),
    numberItemsPerPageOnBulkDeleteOperations: require('./number-items-per-page-on-bulk-delete-operations')(dependencies),
    numberItemsPerPageOnBulkReadOperations: require('./number-items-per-page-on-bulk-read-operations')(dependencies),
    numberItemsPerPageOnBulkUpdateOperations: require('./number-items-per-page-on-bulk-update-operations')(dependencies),
    swipeRightAction: require('./swipe-right-action')(dependencies),
    uploadUrl: require('./upload-url')(dependencies),
    view: require('./view')(dependencies),
    useEmailLinks: require('./use-email-links')(dependencies),
    features: require('./features')(dependencies)
  }
});
