'use strict';

/* global chai: false */

var expect = chai.expect;

describe.skip('The inboxComposerBodyEditorHtml component', function() {

  var $rootScope, $compile, element;

  function compileComponent() {
    element = angular.element(
      '<inbox-composer-body-editor-html message="message" identity="identity" send="send()" on-body-update="message.htmlBody = $body" />'
    );
    element.appendTo(document.body);

    $compile(element)($rootScope.$new());
    $rootScope.$digest();

    return element;
  }

  function ctrlEnterEvent() {
    var ctrlEnterEvent = new jQuery.Event('keydown');

    ctrlEnterEvent.which = 13;
    ctrlEnterEvent.keyCode = 13;
    ctrlEnterEvent.ctrlKey = true;

    return ctrlEnterEvent;
  }

  afterEach(function() {
    if (element) {
      element.remove();
    }
  });

  beforeEach(module('jadeTemplates', 'linagora.esn.unifiedinbox'));

  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(function() {
    $rootScope.message = {};
    $rootScope.identity = {
      textSignature: 'my signature'
    };
  });

  it('should add a new inbox-composer-attachments component inside the body', function() {
    expect(compileComponent().find('.note-editable + inbox-composer-attachments')).to.have.length(1);
  });

  it('should add the identity to the body when composing from scratch', function() {
    compileComponent();

    expect(element.find('.note-editable .openpaas-signature').html()).to.equal('-- \nmy signature');
  });

  it('should not add the identity to the body when composing from an existing message', function() {
    $rootScope.message.htmlBody = '<b>body</b>';

    compileComponent();

    expect(element.find('.note-editable .openpaas-signature')).to.have.length(0);
  });

  it('should update the identity when it changes', function() {
    compileComponent();

    $rootScope.identity = {
      textSignature: 'another signature'
    };
    $rootScope.$digest();

    expect(element.find('.note-editable .openpaas-signature').html()).to.equal('-- \nanother signature');
  });

  it('should send the message when ctrl+enter is pressed in body', function(done) {
    $rootScope.send = done;

    compileComponent();

    element.find('.note-editable').trigger(ctrlEnterEvent());
  });

  it('should force tabindex=-1 on all toolbar form input', function(done) {
    compileComponent();

    element.find('.note-toolbar :input').each(function() {
      if ($(this).attr('tabindex') !== '-1') {
        done('Input element has a positive tabindex', this);
      }
    });

    done();
  });

  it('should call onBodyUpdate on blur', function() {
    compileComponent();

    element.find('.summernote').summernote('focus');
    element.find('.summernote').summernote('insertText', 'some other text');
    element.find('.note-editable').blur();
    $rootScope.$digest();

    expect($rootScope.message.htmlBody).to.equal('<p>some other text<br></p><pre class="openpaas-signature">-- \nmy signature</pre>');
  });

});
