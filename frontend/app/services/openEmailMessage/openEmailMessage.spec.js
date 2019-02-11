'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The inboxOpenEmailMessageService factory', function() {

  var $stateParams, $state, mailbox, inboxOpenEmailMessageService;

  beforeEach(module('linagora.esn.unifiedinbox'));
  beforeEach(inject(function(_$stateParams_, _$state_, _inboxOpenEmailMessageService_) {
    $stateParams = _$stateParams_;
    $state = _$state_;
    inboxOpenEmailMessageService = _inboxOpenEmailMessageService_;

    $state.href = sinon.spy($state.href);
    $stateParams.mailbox = null;
  }));

  describe('The getEmailState function', function() {

    it('should return email state with email parameter', function() {
      var email = { id: 'expectedId' };

      $stateParams.mailbox = '123';
      mailbox = { id: '456' };

      inboxOpenEmailMessageService.getEmailState('.message', email, mailbox);

      expect($state.href).to.have.been.calledWith('.message', {
        emailId: 'expectedId',
        mailbox: $stateParams.mailbox,
        item: email
      });
    });

    it('should do nothing with no email parameter', function() {
      var email;

      $stateParams.mailbox = '123';
      mailbox = { id: '456' };

      inboxOpenEmailMessageService.getEmailState('.message', email, mailbox);

      expect(email).to.be.undefined;
    });

  });

  describe('The getThreadState function', function() {

    it('should return thread state with email parameter', function() {
      var thread = { id: 'expectedId' };

      $stateParams.mailbox = '123';
      mailbox = { id: '456' };

      inboxOpenEmailMessageService.getThreadState('.thread', thread, mailbox);

      expect($state.href).to.have.been.calledWith('.thread', {
        threadId: 'expectedId',
        mailbox: $stateParams.mailbox,
        item: thread
      });
    });

    it('should do nothing with no thread parameter', function() {
      var thread;

      $stateParams.mailbox = '123';
      mailbox = { id: '456' };

      inboxOpenEmailMessageService.getThreadState('.thread', thread, mailbox);

      expect(thread).to.be.undefined;
    });

  });

});
