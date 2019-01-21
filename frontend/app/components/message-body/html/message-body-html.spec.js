'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The inboxMessageBodyHtml component', function() {

  var $compile, $rootScope;
  var element;

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
  });

  beforeEach(inject(function(_$compile_, _$rootScope_, jmap) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    $rootScope.message = new jmap.Message({}, 'id', 'blobId', 'threadId', ['inbox'], {
      htmlBody: '<html><body><div>Message HTML Body</div></body></html>'
    });
  }));

  it('should post html content after having filtered it with loadImagesAsync filters', function() {
    $rootScope.message.htmlBody = '<img src="remote.png" /><img src="cid:1" />';

    compile('<inbox-message-body-html message="message" />');
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
  });

  it('should call postMessage with the argument 1', function() {
    $rootScope.message.htmlBody = '<html><body><img src="cid:1" /></body></html>';
    $rootScope.message.attachments = [{
      cid: '2',
      getSignedDownloadUrl: function() {
        return;
      }
    }];

    compile('<inbox-message-body-html message="message" />');
  });
});
