'use strict';

angular.module('linagora.esn.unifiedinbox')

  .constant('INBOX_MODULE_NAME', 'linagora.esn.unifiedinbox')
  .constant('MAILBOX_ROLE_ICONS_MAPPING', {
    default: 'mdi mdi-email',
    inbox: 'mdi mdi-inbox-arrow-down',
    archive: 'mdi mdi-archive',
    drafts: 'mdi mdi-file-document',
    outbox: 'mdi mdi-inbox-arrow-up',
    sent: 'mdi mdi-send',
    trash: 'mdi mdi-delete',
    spam: 'mdi mdi-alert-octagon',
    templates: 'mdi mdi-clipboard-text'
  })
  .constant('INBOX_AUTOCOMPLETE_LIMIT', 20)
  .constant('INBOX_AUTOCOMPLETE_OBJECT_TYPES', ['user', 'contact'])
  .constant('INBOX_DISPLAY_NAME_SIZE', 100)
  .constant('MAILBOX_LEVEL_SEPARATOR', ' / ')
  .constant('JMAP_GET_MESSAGES_LIST', ['id', 'blobId', 'threadId', 'headers', 'subject', 'from', 'to', 'cc', 'bcc', 'replyTo', 'preview', 'date', 'isUnread', 'isFlagged', 'isDraft', 'hasAttachment', 'mailboxIds'])
  .constant('JMAP_GET_MESSAGES_VIEW', ['id', 'blobId', 'threadId', 'headers', 'subject', 'from', 'to', 'cc', 'bcc', 'replyTo', 'preview', 'textBody', 'htmlBody', 'date', 'isUnread', 'isFlagged', 'isDraft', 'hasAttachment', 'attachments', 'mailboxIds'])
  .constant('JMAP_GET_MESSAGES_ATTACHMENTS_LIST', ['id', 'blobId', 'threadId', 'subject', 'date', 'hasAttachment', 'attachments', 'mailboxIds'])
  .constant('ATTACHMENTS_ATTRIBUTES', ['blobId', 'isInline', 'name', 'size', 'type'])
  .constant('DEFAULT_MAX_SIZE_UPLOAD', 20971520)
  .constant('DRAFT_SAVING_DEBOUNCE_DELAY', 1000)
  .constant('INBOX_DEFAULT_NUMBER_ITEMS_PER_PAGE_ON_BULK_READ_OPERATIONS', 30)
  .constant('INBOX_DEFAULT_NUMBER_ITEMS_PER_PAGE_ON_BULK_DELETE_OPERATIONS', 30)
  .constant('INBOX_DEFAULT_NUMBER_ITEMS_PER_PAGE_ON_BULK_UPDATE_OPERATIONS', 30)
  .constant('DEFAULT_VIEW', 'messages')
  .constant('IFRAME_MESSAGE_PREFIXES', {
    CHANGE_DOCUMENT: '[linagora.esn.unifiedinbox.changeDocument]',
    MAILTO: '[linagora.esn.unifiedinbox.mailtoClick]',
    INLINE_ATTACHMENT: '[linagora.esn.unifiedinbox.inlineAttachment]',
    CHANGE_CURRENT_LOCATION: '[linagora.esn.unifiedinbox.changeCurrentLocation]'
  })
  .constant('INBOX_SWIPE_DURATION', 500)
  .constant('PROVIDER_TYPES', {
    JMAP: 'jmap',
    SOCIAL: 'social'
  })
  .constant('INBOX_EVENTS', {
    VACATION_STATUS: 'inbox:vacationStatusUpdated',
    FILTER_CHANGED: 'inbox:filterChanged',
    ITEM_SELECTION_CHANGED: 'inbox:itemSelectionChanged',
    ITEM_FLAG_CHANGED: 'inbox:itemFlagChanged',
    ITEM_MAILBOX_IDS_CHANGED: 'inbox:itemMailboxIdsChanged',
    BADGE_LOADING_ACTIVATED: 'inbox:badgeLoadingActivated',
    DRAFT_DESTROYED: 'inbox:draftDestroyed'
  })
  .constant('INBOX_SUMMERNOTE_OPTIONS', {
    focus: false,
    airMode: false,
    disableResizeEditor: true,
    toolbar: [
      ['style', ['style']],
      ['font', ['bold', 'italic', 'underline', 'strikethrough']],
      ['alignment', ['paragraph', 'ul', 'ol']]
    ],
    keyMap: {
      pc: {'CTRL+ENTER': ''},
      mac: {'CMD+ENTER': ''}
    }
  })
  .constant('INBOX_CONTROLLER_LOADING_STATES', {
    LOADING: 'LOADING',
    LOADED: 'LOADED',
    ERROR: 'ERROR'
  })
  .constant('INBOX_MODULE_METADATA', {
    id: 'linagora.esn.unifiedinbox',
    title: 'Unified Inbox',
    icon: '/unifiedinbox/images/inbox-icon.svg',
    homePage: 'unifiedinbox',
    config: {
      template: 'inbox-config-form',
      displayIn: {
        user: false,
        domain: true,
        platform: false
      }
    }
  })
  .constant('INBOX_SIGNATURE_SEPARATOR', '-- \n'); // https://tools.ietf.org/html/rfc3676#section-4.3
