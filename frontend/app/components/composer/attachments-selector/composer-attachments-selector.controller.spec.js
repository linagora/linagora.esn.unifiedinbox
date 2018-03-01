'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The inboxComposerAttachmentsSelectorController controller', function() {

  var $rootScope, $componentController, ctrl, inboxAttachmentAlternativeUploaderModal;
  var DEFAULT_FILE_TYPE, DEFAULT_MAX_SIZE_UPLOAD;

  beforeEach(module('jadeTemplates', 'linagora.esn.unifiedinbox', function($provide) {
    $provide.value('inboxConfig', function(key, defaultValue) {
      return $q.when(defaultValue);
    });
    $provide.value('withJmapClient', function(callback) {
      return callback({});
    });
    $provide.value('inboxAttachmentAlternativeUploaderModal', {
      show: sinon.spy()
    });
  }));

  beforeEach(inject(function(_$rootScope_, _$componentController_, _inboxAttachmentAlternativeUploaderModal_,
                             _DEFAULT_FILE_TYPE_, _DEFAULT_MAX_SIZE_UPLOAD_) {
    $rootScope = _$rootScope_;
    $componentController = _$componentController_;

    inboxAttachmentAlternativeUploaderModal = _inboxAttachmentAlternativeUploaderModal_;

    DEFAULT_FILE_TYPE = _DEFAULT_FILE_TYPE_;
    DEFAULT_MAX_SIZE_UPLOAD = _DEFAULT_MAX_SIZE_UPLOAD_;
  }));

  beforeEach(function() {
    ctrl = $componentController('inboxComposerAttachmentsSelector', {}, {
      attachments: [],
      upload: sinon.spy(),
      onAttachmentsUpdate: sinon.spy()
    });
  });

  describe('The onAttachmentsSelect function', function() {

    it('should do nothing if no files are given', function() {
      ctrl.onAttachmentsSelect();
      $rootScope.$digest();

      expect(ctrl.attachments).to.deep.equal([]);
      expect(ctrl.upload).to.have.not.been.calledWith();
    });

    it('should do nothing if files is zerolength', function() {
      ctrl.onAttachmentsSelect([]);
      $rootScope.$digest();

      expect(ctrl.attachments).to.deep.equal([]);
      expect(ctrl.upload).to.have.not.been.calledWith();
    });

    it('should add the attachment, with a default file type, upload it and notify caller of the change', function() {
      ctrl.onAttachmentsSelect([{ name: 'name', size: 1 }]);
      $rootScope.$digest();

      expect(ctrl.attachments[0]).to.shallowDeepEqual({
        name: 'name',
        size: 1,
        type: DEFAULT_FILE_TYPE
      });

      expect(ctrl.upload).to.have.been.calledWith(sinon.match({ $attachment: sinon.match({ name: 'name' }) }));
      expect(ctrl.onAttachmentsUpdate).to.have.been.calledWith(sinon.match({ $attachments: [sinon.match({ name: 'name' })] }));
    });

    it('should add the attachment if the file size is exactly the limit', function() {
      ctrl.onAttachmentsSelect([{ name: 'name', size: DEFAULT_MAX_SIZE_UPLOAD }]);
      $rootScope.$digest();

      expect(ctrl.attachments).to.have.length(1);
    });

    it('should show alternative uploader modal and not add the attachment if file is larger that the limit', function() {
      var largeFiles = [
        { name: 'name1', size: DEFAULT_MAX_SIZE_UPLOAD + 1 },
        { name: 'name2', size: DEFAULT_MAX_SIZE_UPLOAD + 2 }
      ];

      ctrl.onAttachmentsSelect(largeFiles);
      $rootScope.$digest();

      expect(inboxAttachmentAlternativeUploaderModal.show).to.have.been.calledWith(largeFiles, '20MB', sinon.match.func);
      expect(ctrl.attachments).to.deep.equal([]);
    });

    it('should add and upload large files using alternative uploaded', function() {
      var largeFiles = [{ name: 'name1', size: DEFAULT_MAX_SIZE_UPLOAD + 1 }];

      inboxAttachmentAlternativeUploaderModal.show = function(files, maxSizeUpload, onUpload) {
        onUpload({
          fileToAttachment: function(file) {
            return { name: file.name, size: file.size };
          }
        }, files);
      };

      ctrl.onAttachmentsSelect(largeFiles);
      $rootScope.$digest();

      expect(ctrl.attachments).to.deep.equal(largeFiles);
      expect(ctrl.upload).to.have.been.calledWith(sinon.match({ $attachment: sinon.match({ name: 'name1' }) }));
      expect(ctrl.onAttachmentsUpdate).to.have.been.calledWith(sinon.match({ $attachments: [sinon.match({ name: 'name1' })] }));
    });

  });

  describe('the getAttachmentsStatus function', function() {

    it('should return a value wuth number=0 when there is no attachments', function() {
      expect(ctrl.getAttachmentsStatus()).to.deep.equal({
        number: 0,
        uploading: false,
        error: false
      });
    });

    it('should consider only JMAP attachments', function() {
      ctrl.attachments.push({ isInline: false, attachmentType: 'jmap' });
      ctrl.attachments.push({ isInline: false, attachmentType: 'linshare' });

      expect(ctrl.getAttachmentsStatus()).to.deep.equal({
        number: 1,
        uploading: false,
        error: false
      });
    });

    it('should consider only non-inline attachments', function() {
      ctrl.attachments.push({ isInline: false, attachmentType: 'jmap' });
      ctrl.attachments.push({ isInline: false, attachmentType: 'jmap' });
      ctrl.attachments.push({ isInline: true, attachmentType: 'jmap' });

      expect(ctrl.getAttachmentsStatus()).to.deep.equal({
        number: 2,
        uploading: false,
        error: false
      });
    });

    it('should consider currently uploading attachments for uploading=true flag', function() {
      ctrl.attachments.push({ isInline: false, attachmentType: 'jmap' });
      ctrl.attachments.push({ isInline: false, status: 'uploading', attachmentType: 'jmap' });

      expect(ctrl.getAttachmentsStatus()).to.deep.equal({
        number: 2,
        uploading: true,
        error: false
      });
    });

    it('should consider failed uploads for error=true flag', function() {
      ctrl.attachments.push({ isInline: false, attachmentType: 'jmap' });
      ctrl.attachments.push({ isInline: false, status: 'error', attachmentType: 'jmap' });

      expect(ctrl.getAttachmentsStatus()).to.deep.equal({
        number: 2,
        uploading: false,
        error: true
      });
    });

  });

});
