'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The inboxComposerAttachmentsSelectorController controller', function() {

  var $rootScope, $componentController, ctrl, inboxAttachmentAlternativeUploaderModal;
  var DEFAULT_FILE_TYPE, DEFAULT_MAX_SIZE_UPLOAD;

  beforeEach(module('jadeTemplates', 'linagora.esn.unifiedinbox', 'esn.attachments-selector', function($provide) {
    $provide.value('inboxConfig', function(key, defaultValue) {
      return $q.when(defaultValue);
    });
    $provide.value('withJmapClient', function(callback) {
      return callback({});
    });
    $provide.value('inboxAttachmentAlternativeUploaderModal', {
      show: sinon.spy(function(x, y, callback) {
        callback();
      })
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
      upload: sinon.spy()
    });
  });

  describe('The uploadAttachments function', function() {

    it('should do nothing if no files are given', function(done) {
      ctrl.uploadAttachments().then(function(attachments) {
        expect(attachments).to.deep.equal([]);
        expect(ctrl.upload).to.have.not.been.called;

        done();
      });

      $rootScope.$digest();
    });

    it('should do nothing if files is zerolength', function(done) {
      ctrl.uploadAttachments([]).then(function(attachments) {
        expect(attachments).to.deep.equal([]);
        expect(ctrl.upload).to.have.not.been.called;

        done();
      });

      $rootScope.$digest();
    });

    it('should add the attachment, with a default file type, upload it and notify caller of the change', function(done) {
      var expectedAttachment = {
        name: 'name',
        size: 1,
        type: DEFAULT_FILE_TYPE
      };

      ctrl.uploadAttachments([{ name: 'name', size: 1 }]).then(function(attachments) {
        expect(attachments[0]).to.shallowDeepEqual(expectedAttachment);
        expect(ctrl.upload).to.have.been.calledWith(sinon.match({ $attachment: sinon.match({ name: 'name' }) }));

        done();
      });

      $rootScope.$digest();
    });

    it('should add the attachment if the file size is exactly the limit', function(done) {
      ctrl.uploadAttachments([{ name: 'name', size: DEFAULT_MAX_SIZE_UPLOAD }]).then(function(attachments) {
        expect(attachments).to.have.length(1);

        done();
      });

      $rootScope.$digest();
    });

    describe('on file larger than the limit', function() {

      it('should show alternative uploader modal and not add the attachment if there is no alternative upload provider', function(done) {
        var largeFiles = [
          { name: 'name1', size: DEFAULT_MAX_SIZE_UPLOAD + 1 },
          { name: 'name2', size: DEFAULT_MAX_SIZE_UPLOAD + 2 }
        ];

        ctrl.uploadAttachments(largeFiles).then(function(attachments) {
          expect(inboxAttachmentAlternativeUploaderModal.show).to.have.been.calledWith(largeFiles, '20MB', sinon.match.func);
          expect(attachments).to.deep.equal([]);

          done();
        });

        $rootScope.$digest();
      });

      it('should show alternative uploader modal and add the attachment if there is alternative upload provider', function(done) {
        var largeFiles = [{ name: 'name1', size: DEFAULT_MAX_SIZE_UPLOAD + 1 }];

        inboxAttachmentAlternativeUploaderModal.show = function(files, maxSizeUpload, onUpload) {
          onUpload({
            fileToAttachment: function(file) {
              return { name: file.name, size: file.size };
            }
          }, files);
        };

        ctrl.uploadAttachments(largeFiles).then(function(attachments) {
          expect(attachments).to.deep.equal(largeFiles);
          expect(ctrl.upload).to.have.been.calledWith(sinon.match({ $attachment: sinon.match({ name: 'name1' }) }));
          done();
        });

        $rootScope.$digest();
      });
    });
  });
});
