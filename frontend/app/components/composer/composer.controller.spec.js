'use strict';

/* global chai: false, sinon: false, angular: false */

var expect = chai.expect;

describe('The inboxComposerController controller', function() {

  var $rootScope, $componentController, ctrl, InboxDraft, sendEmail, Offline, notificationFactory, inboxRequestReceiptsService, isConfiguredToSendAskReceiptsByDefault;

  function InboxDraftMock() {
    this.save = sinon.stub().returns($q.when());
    this.destroy = sinon.stub().returns($q.when());
  }

  beforeEach(module('jadeTemplates', 'linagora.esn.unifiedinbox', function($provide) {
    $provide.constant('DRAFT_SAVING_DEBOUNCE_DELAY', 0);
    $provide.value('InboxDraft', InboxDraftMock);
    $provide.value('sendEmail', sinon.stub());
    $provide.value('notificationFactory', {
      weakSuccess: sinon.spy(),
      weakError: sinon.stub().returns({
        setCancelAction: sinon.spy()
      })
    });
    $provide.value('inboxRequestReceiptsService', {
      getDefaultReceipts: sinon.spy(function fakeDefaultReceiptsConfig() {
        return $q.when({ isRequestingReadReceiptsByDefault: isConfiguredToSendAskReceiptsByDefault });
      })
    });

  }));

  beforeEach(inject(function(_$rootScope_, _$componentController_, _InboxDraft_, _sendEmail_, _Offline_, _notificationFactory_, _inboxRequestReceiptsService_) {
    $rootScope = _$rootScope_;
    $componentController = _$componentController_;

    InboxDraft = _InboxDraft_;
    sendEmail = _sendEmail_;
    Offline = _Offline_;
    notificationFactory = _notificationFactory_;
    inboxRequestReceiptsService = _inboxRequestReceiptsService_;
  }));

  beforeEach(function() {
    isConfiguredToSendAskReceiptsByDefault = false;
    ctrl = $componentController('inboxComposer', {}, {
      message: {
        id: 'messageId',
        subject: 'subject',
        to: [{
          name: 'name',
          email: 'email'
        }]
      },
      onSend: sinon.spy(),
      onSave: sinon.spy(),
      onDiscard: sinon.spy(),
      onHide: sinon.spy(),
      onShow: sinon.spy(),
      onTitleUpdate: sinon.spy()
    });
    angular.mock.inject(function(session) {
      session.user = {
        firstname: 'user',
        lastname: 'using',
        preferredEmail: 'user@linagora.com'
      };
    });
  });

  function shortCircuitDebounce(fn, done) {
    setTimeout(function() {
      fn();
      done();
    }, 10);
  }

  describe('The $onInit function', function() {

    it('should start the draft at init time', function() {
      ctrl.$onInit();

      expect(ctrl.draft).to.be.an.instanceof(InboxDraft);
    });

    it('should set isCollapsed=true when there is no message', function() {
      ctrl.message = undefined;

      ctrl.$onInit();

      expect(ctrl.isCollapsed).to.equal(true);
    });

    it('should set isCollapsed=true when there is neither cc nor bcc', function() {
      ctrl.$onInit();

      expect(ctrl.isCollapsed).to.equal(true);
    });

    it('should set isCollapsed=false when there is a cc and a bcc', function() {
      ctrl.message = {
        to: [{ displayName: '1', email: '1@linagora.com' }],
        cc: [{ displayName: '1', email: '1@linagora.com' }],
        bcc: [{ displayName: '1', email: '1@linagora.com' }]
      };

      ctrl.$onInit();

      expect(ctrl.isCollapsed).to.equal(false);
    });

    it('should set isCollapsed=false when there is a cc but no bcc', function() {
      ctrl.message = {
        to: [{ displayName: '1', email: '1@linagora.com' }],
        cc: [{ displayName: '1', email: '1@linagora.com' }],
        bcc: []
      };

      ctrl.$onInit();

      expect(ctrl.isCollapsed).to.equal(false);
    });

    it('should set isCollapsed=false when there is no cc but a bcc', function() {
      ctrl.message = {
        to: [{ displayName: '1', email: '1@linagora.com' }],
        cc: [],
        bcc: [{ displayName: '1', email: '1@linagora.com' }]
      };

      ctrl.$onInit();

      expect(ctrl.isCollapsed).to.equal(false);
    });

    it('should update the title with nothing when there is no message', function() {
      ctrl.message = undefined;

      ctrl.$onInit();

      expect(ctrl.onTitleUpdate).to.have.been.calledWith({ $title: undefined });
    });

    it('should update the title with the actual message subject', function() {
      ctrl.$onInit();

      expect(ctrl.onTitleUpdate).to.have.been.calledWith({ $title: 'subject' });
    });

  });

  describe('The $onDestroy function', function() {

    it('should save the draft', function(done) {
      ctrl.$onInit();
      ctrl.$onDestroy();

      shortCircuitDebounce(function() {
        expect(ctrl.draft.save).to.have.been.calledWith();
      }, done);
    });

    it('should not save the draft if the composer is destroyed after send', function(done) {
      ctrl.$onInit();
      ctrl.send();
      ctrl.$onDestroy();

      shortCircuitDebounce(function() {
        expect(ctrl.draft.save).to.have.not.been.calledWith();
      }, done);
    });

    it('should not save the draft if the composer is destroyed after destroying the draft', function(done) {
      ctrl.$onInit();
      ctrl.destroyDraft();
      ctrl.$onDestroy();

      shortCircuitDebounce(function() {
        expect(ctrl.draft.save).to.have.not.been.calledWith();
      }, done);
    });

  });

  describe('The saveDraft function', function() {

    it('should save the draft silently', function(done) {
      ctrl.$onInit();
      ctrl.saveDraft();

      shortCircuitDebounce(function() {
        expect(ctrl.draft.save).to.have.been.calledWith(ctrl.message, { silent: true });
      }, done);
    });

    it('should notify when the draft is successfully saved', function(done) {
      ctrl.$onInit();
      ctrl.saveDraft();

      shortCircuitDebounce(function() {
        $rootScope.$digest();

        expect(ctrl.onSave).to.have.been.calledWith();
      }, done);
    });

  });

  describe('The upload function', function() {
    var inboxAttachmentUploadService;

    beforeEach(inject(function(_inboxAttachmentUploadService_) {
      inboxAttachmentUploadService = _inboxAttachmentUploadService_;
    }));

    it('should start the upload', function() {
      inboxAttachmentUploadService.upload = sinon.stub().returns($q.when());

      ctrl.$onInit();
      ctrl.upload('attachment');

      expect(inboxAttachmentUploadService.upload).to.have.been.calledWith('attachment');
    });

    it('should save draft on success', function(done) {
      inboxAttachmentUploadService.upload = sinon.stub().returns($q.when());

      ctrl.$onInit();
      ctrl.upload('attachment');
      $rootScope.$digest();

      shortCircuitDebounce(function() {
        expect(ctrl.draft.save).to.have.been.calledWith();
      }, done);
    });

    it('should not save draft when upload fails', function(done) {
      inboxAttachmentUploadService.upload = sinon.stub().returns($q.reject());

      ctrl.$onInit();
      ctrl.upload('attachment');
      $rootScope.$digest();

      shortCircuitDebounce(function() {
        expect(ctrl.draft.save).to.have.not.been.calledWith();
      }, done);
    });

  });

  describe('The removeAttachment function', function() {

    it('should remove the attachment from the message and cancel the upload', function() {
      var attachment = {
        upload: {
          cancel: sinon.spy()
        }
      };

      ctrl.message.attachments = [attachment];
      ctrl.$onInit();
      ctrl.removeAttachment(attachment);

      expect(attachment.upload.cancel).to.have.been.calledWith();
      expect(ctrl.message.attachments).to.deep.equal([]);
    });

    it('should remove attachments that do not have upload attributes', function() {
      var attachment = {};

      ctrl.message.attachments = [attachment];
      ctrl.$onInit();
      ctrl.removeAttachment(attachment);

      expect(ctrl.message.attachments).to.deep.equal([]);
    });

    it('should save the draft', function(done) {
      var attachment = {};

      ctrl.message.attachments = [attachment];
      ctrl.$onInit();
      ctrl.removeAttachment(attachment);

      shortCircuitDebounce(function() {
        expect(ctrl.draft.save).to.have.been.calledWith(ctrl.message, { silent: true });
      }, done);
    });

  });

  describe('The send function', function() {
    var INBOX_MESSAGE_HEADERS;

    function sendMessage() {
      ctrl.$onInit();
      ctrl.send();

      $rootScope.$digest();
    }

    beforeEach(inject(function(_INBOX_MESSAGE_HEADERS_) {
      INBOX_MESSAGE_HEADERS = _INBOX_MESSAGE_HEADERS_;
    }));

    afterEach(function() {
      Offline.state = 'up';
    });

    it('should not hide the composer and not send the message when there is no recipient', function() {
      ctrl.message.to.length = 0;

      sendMessage();

      expect(ctrl.onHide).to.have.not.been.calledWith();
      expect(sendEmail).to.have.not.been.calledWith();
    });

    it('should not hide the composer and not send the message when network connection is down', function() {
      Offline.state = 'down';

      sendMessage();

      expect(ctrl.onHide).to.have.not.been.calledWith();
      expect(sendEmail).to.have.not.been.calledWith();
    });

    it('should deduplicate recipients', function() {
      ctrl.message.cc = [{
        name: 'name',
        email: 'email'
      }];
      ctrl.message.bcc = [{
        name: 'name',
        email: 'email'
      }];

      sendMessage();

      expect(sendEmail).to.have.been.calledWith();
      expect(ctrl.message).to.shallowDeepEqual({
        to: [{
          name: 'name',
          email: 'email'
        }],
        cc: [],
        bcc: []
      });
    });

    it('should notify caller when email is successfully sent', function() {
      sendMessage();

      expect(sendEmail).to.have.been.calledWith();
      expect(ctrl.onSend).to.have.been.calledWith();
    });

    it('should successfully send an email even if only bcc is used', function() {
      ctrl.message.to.length = 0;
      ctrl.message.bcc = [{ displayName: '1', email: '1@linagora.com' }];

      sendMessage();

      expect(sendEmail).to.have.been.calledWith();
    });

    it('should destroy the original draft silently when the message is sent', function() {
      sendMessage();

      expect(sendEmail).to.have.been.calledWith();
      expect(ctrl.draft.destroy).to.have.been.calledWith({ silent: true });
    });

    it('should quote the original email if current email is not already quoting', function() {
      ctrl.message = {
        to: [{
          email: 'A@A.com'
        }],
        textBody: 'The actual reply',
        quoteTemplate: 'default',
        quoted: {
          from: {
            name: 'test',
            email: 'test@open-paas.org'
          },
          subject: 'Heya',
          date: '2015-08-21T00:10:00Z',
          htmlBody: '<cite>On Aug 21, 2015 12:10:00 AM, from test@open-paas.org</cite><blockquote><p>HtmlBody</p></blockquote>'
        }
      };

      sendMessage();

      expect(sendEmail).to.have.been.calledWith(sinon.match({
        htmlBody: '<pre>The actual reply</pre><br/><div><cite>On Aug 21, 2015 12:10:00 AM, from test@open-paas.org</cite><blockquote><p>HtmlBody</p></blockquote></div>'
      }));
    });

    it('should not quote the original email if current email is already quoting', function() {
      ctrl.message = {
        to: [{ email: 'A@A.com' }],
        quoteTemplate: 'default',
        textBody: 'Body',
        isQuoting: true,
        quoted: {
          from: {
            name: 'test',
            email: 'test@open-paas.org'
          },
          subject: 'Heya',
          date: '2015-08-21T00:10:00Z',
          htmlBody: '<p>HtmlBody</p>'
        }
      };

      sendMessage();

      expect(sendEmail).to.have.been.calledWith(sinon.match({
        textBody: 'Body',
        htmlBody: undefined
      }));
    });

    it('should not quote the original email if there is no original email', function() {
      ctrl.message = {
        to: [{ email: 'A@A.com' }],
        textBody: 'Body'
      };

      sendMessage();

      expect(sendEmail).to.have.been.calledWith(sinon.match({
        textBody: 'Body',
        htmlBody: undefined
      }));
    });

    it('should notify on success', function() {
      sendMessage();

      expect(notificationFactory.weakSuccess).to.have.been.calledWith('Success', 'Message sent');
    });

    it('should notify on failure', function() {
      sendEmail.returns($q.reject());

      sendMessage();

      expect(notificationFactory.weakError).to.have.been.calledWith('Error', 'Your message cannot be sent');
    });

    it('should notify on failure with a custom error message if the network connection is down', function() {
      sendEmail.returns($q.reject());

      ctrl.$onInit();
      ctrl.send();
      Offline.state = 'down';

      $rootScope.$digest();

      expect(notificationFactory.weakError).to.have.been.calledWith('Error', 'You have been disconnected. Please check if the message was sent before retrying');
    });

    function validMDNHeaders() {
      var message = {
        textBody: 'Body',
        headers: { }
      };

      message.headers[INBOX_MESSAGE_HEADERS.READ_RECEIPT] = 'user@linagora.com';

      return sinon.match(message);
    }

    it('should add an MDN header when read receipt has been requested', function() {
      ctrl.message = {
        to: [{ email: 'A@A.com' }],
        textBody: 'Body'
      };
      ctrl.$onInit();
      ctrl.toggleReadReceiptRequest();
      ctrl.send();
      $rootScope.$digest();

      expect(sendEmail).to.have.been.calledWith(validMDNHeaders());
    });

    it('should add an MDN header when read receipts are configured to be sent by default', function() {
      ctrl.message = {
        to: [{ email: 'A@A.com' }],
        textBody: 'Body'
      };
      isConfiguredToSendAskReceiptsByDefault = true;
      ctrl.$onInit();
      $rootScope.$digest();
      ctrl.send();
      $rootScope.$digest();

      expect(inboxRequestReceiptsService.getDefaultReceipts).to.have.been.calledOnce;
      expect(sendEmail).to.have.been.calledWith(validMDNHeaders());
    });

    it('should NOT any header when no read receipt were requested', function() {
      ctrl.message = {
        to: [{ email: 'A@A.com' }],
        headers: {name: 'value'},
        textBody: 'Body'
      };

      sendMessage();

      var missingReceiptHeaderMatcher = sinon.match(function(message) {
        return !(message.headers && INBOX_MESSAGE_HEADERS.READ_RECEIPT in message.headers);
      }, 'missingReceiptRequestHeaderInMessage');

      expect(sendEmail).to.have.been.calledWith(missingReceiptHeaderMatcher.and(sinon.match({textBody: 'Body'})));
    });

  });

  describe('The "destroyDraft" function', function() {

    it('should hide the composer', function() {
      ctrl.$onInit();
      ctrl.destroyDraft();

      expect(ctrl.onHide).to.have.been.calledWith();
    });

    it('should cancel all attachments uploads', function() {
      ctrl.message.attachments = [{
        upload: {
          cancel: sinon.spy()
        }
      }, {
        upload: {
          cancel: sinon.spy()
        }
      }];

      ctrl.$onInit();
      ctrl.destroyDraft();

      expect(ctrl.message.attachments[0].upload.cancel).to.have.been.calledWith();
      expect(ctrl.message.attachments[1].upload.cancel).to.have.been.calledWith();
    });

    it('should destroy the draft, passing the given options', function() {
      ctrl.$onInit();
      ctrl.destroyDraft({ option: 'a' });

      expect(ctrl.draft.destroy).to.have.been.calledWith({ option: 'a' });
    });

    it('should notify when the draft is destroyed', function() {
      ctrl.$onInit();
      ctrl.destroyDraft();
      $rootScope.$digest();

      expect(ctrl.onDiscard).to.have.been.calledWith();
    });

    it('should reopen the composer when the draft could not be destroyed', function() {
      ctrl.$onInit();
      ctrl.draft.destroy.returns($q.reject());
      ctrl.destroyDraft();
      $rootScope.$digest();

      expect(ctrl.onDiscard).to.have.not.been.calledWith();
      expect(ctrl.onShow).to.have.been.calledWith();
    });

  });

});
