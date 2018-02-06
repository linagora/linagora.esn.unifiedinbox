'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The inboxAttachmentUploadService service', function() {
  var $rootScope;
  var inboxAttachmentUploadService, inboxAttachmentProviderRegistry;
  var attachmentProviderMock;

  beforeEach(module('linagora.esn.unifiedinbox'));

  beforeEach(inject(function(_$rootScope_, _inboxAttachmentUploadService_, _inboxAttachmentProviderRegistry_) {
    $rootScope = _$rootScope_;
    inboxAttachmentUploadService = _inboxAttachmentUploadService_;
    inboxAttachmentProviderRegistry = _inboxAttachmentProviderRegistry_;

    attachmentProviderMock = {};
    inboxAttachmentProviderRegistry.get = function() {
      return attachmentProviderMock;
    };
  }));

  describe('The upload service', function() {
    it('should use attachment provider\'s uploader to upload attachment', function() {
      attachmentProviderMock.upload = sinon.stub().returns({
        promise: $q.defer().promise
      });

      var attachment = { attachmentType: 'jmap' };

      inboxAttachmentUploadService.upload(attachment);

      expect(attachmentProviderMock.upload).to.have.been.calledWith(attachment);
      expect(attachment.status).to.equal('uploading');
      expect(attachment.upload.progress).to.equal(0);
    });

    it('should set upload status to uploaded on promise resolved', function() {
      attachmentProviderMock.upload = function() {
        return {
          promise: $q.when()
        };
      };

      var attachment = { attachmentType: 'jmap' };

      inboxAttachmentUploadService.upload(attachment);

      $rootScope.$digest();
      expect(attachment.status).to.equal('uploaded');
    });

    it('should set upload status to error on promise rejected', function() {
      attachmentProviderMock.upload = function() {
        return {
          promise: $q.reject()
        };
      };

      var attachment = { attachmentType: 'jmap' };

      inboxAttachmentUploadService.upload(attachment);

      $rootScope.$digest();
      expect(attachment.status).to.equal('error');
    });

    it('should update the upload progress on promise notified', function() {
      var uploadDeferred = $q.defer();

      attachmentProviderMock.upload = function() {
        return {
          promise: uploadDeferred.promise
        };
      };

      var attachment = { attachmentType: 'jmap' };

      inboxAttachmentUploadService.upload(attachment);

      expect(attachment.upload.progress).to.equal(0);

      uploadDeferred.notify(50);
      $rootScope.$digest();

      expect(attachment.upload.progress).to.equal(50);
    });

    it('should set upload status error when there is no corresponding attachment provider', function() {
      attachmentProviderMock = null;

      var attachment = { attachmentType: 'jmap' };

      inboxAttachmentUploadService.upload(attachment);

      expect(attachment.status).to.equal('error');
    });
  });
});
