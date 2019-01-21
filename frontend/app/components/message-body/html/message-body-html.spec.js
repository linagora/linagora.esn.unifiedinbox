'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The inboxMessageBodyHtml component', function() {

  var $compile, $rootScope, IFRAME_MESSAGE_PREFIXES;
  var element, iFrameResize;

  function compile(html) {
    element = angular.element(html);
    element.appendTo(document.body);

    $compile(element)($rootScope);
    $rootScope.$digest();

    return element;
  }

  afterEach(function() {
    if (element) {
      element.remove();
    }
  });

  beforeEach(function() {
    module('linagora.esn.unifiedinbox');
    module('jadeTemplates');

    module(function($provide) {
      $provide.provider('iFrameResize', function() {
        return {
          $get: function() {
            return iFrameResize;
          }
        };
      });
    });
  });

  beforeEach(inject(function(_$compile_, _$rootScope_, _IFRAME_MESSAGE_PREFIXES_, jmap) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    IFRAME_MESSAGE_PREFIXES = _IFRAME_MESSAGE_PREFIXES_;

    $rootScope.message = new jmap.Message({}, 'id', 'blobId', 'threadId', ['inbox'], {
      htmlBody: '<html><body><div>Message HTML Body</div></body></html>'
    });
  }));

  it('should post html content after having filtered it with loadImagesAsync filters', function(done) {
    $rootScope.message.htmlBody = '<img src="remote.png" /><img src="cid:1" />';

    compile('<inbox-message-body-html message="message" />');

    $rootScope.$broadcast('iframe:loaded', {
      contentWindow: {
        postMessage: function(content, target) {
          expect(target).to.equal('*');

          var contentWithoutRandomPort = content.replace(/localhost:\d*/g, 'localhost:PORT');

          expect(contentWithoutRandomPort).to.equal(
            '[linagora.esn.unifiedinbox.changeDocument]<html><body>' +
            '<img src="http://localhost:PORT/images/throbber-amber.svg" data-async-src="remote.png" />' +
            '<img src="http://localhost:PORT/images/throbber-amber.svg" data-async-src="cid:1" />' +
            '</body></html>');

          done();
        }
      }
    });
  });

  it('should get a signed download URL for inline attachments, when asked by the iFrame', function(done) {
    $rootScope.message.htmlBody = '<img src="cid:1" />';
    $rootScope.message.attachments = [{
      cid: '1',
      getSignedDownloadUrl: function() {
        done();

        return $q.when('signedUrl');
      }
    }];

    compile('<inbox-message-body-html message="message" />');

    $rootScope.$broadcast('wm:' + IFRAME_MESSAGE_PREFIXES.INLINE_ATTACHMENT, '1', {});
  });

  it('should call postMessage with the argument 1', function(done) {
    $rootScope.message.htmlBody = '<html><body><img src="cid:1" /></body></html>';
    $rootScope.message.attachments = [{
      cid: '2',
      getSignedDownloadUrl: function() {
        return;
      }
    }];

    compile('<inbox-message-body-html message="message" />');

    $rootScope.$broadcast('wm:' + IFRAME_MESSAGE_PREFIXES.INLINE_ATTACHMENT, '1', {
      contentWindow: {
        postMessage: function(content, target) {
          expect(target).to.equal('*');

          var contentWithoutRandomPort = content.replace(/localhost:\d*/g, 'localhost:PORT');

          expect(contentWithoutRandomPort).to.equal('[linagora.esn.unifiedinbox.inlineAttachment]1');

          done();
        }
      }
    });
  });
});
