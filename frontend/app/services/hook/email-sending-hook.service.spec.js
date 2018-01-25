'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The inboxEmailSendingHookService', function() {
  var $rootScope, inboxEmailSendingHookService;

  beforeEach(module('linagora.esn.unifiedinbox'));

  beforeEach(inject(function(_$rootScope_, _inboxEmailSendingHookService_) {
    inboxEmailSendingHookService = _inboxEmailSendingHookService_;
    $rootScope = _$rootScope_;
  }));

  describe('The registerPreSendingHook function', function() {
    it('should not register hook if hook is not a function', function() {
      expect(function() {
        inboxEmailSendingHookService.registerPreSendingHook(undefined);
      }).to.throw(TypeError, 'Hook must be a function');
    });
  });

  describe('The registerPostSendingHook function', function() {
    it('should not register hook if hook is not a function', function() {
      expect(function() {
        inboxEmailSendingHookService.registerPostSendingHook(undefined);
      }).to.throw(TypeError, 'Hook must be a function');
    });
  });

  describe('The preSending function', function() {
    it('should call all the pre-hook with input email', function(done) {
      var hook = sinon.spy(function(email) {
        return $q.when();
      });
      var hook2 = sinon.spy(function(email) {
        return $q.when();
      });

      inboxEmailSendingHookService.registerPreSendingHook(hook);
      inboxEmailSendingHookService.registerPreSendingHook(hook2);

      inboxEmailSendingHookService.preSending('email').then(function() {
        expect(hook).to.have.been.calledWith('email');
        expect(hook2).to.have.been.calledWith('email');
        done();
      });
      $rootScope.$digest();
    });

    it('should resolve the input email if all hooks are resolved', function(done) {
      var hook = sinon.spy(function(email) {
        return $q.when();
      });

      inboxEmailSendingHookService.registerPreSendingHook(hook);

      inboxEmailSendingHookService.preSending('email').then(function(data) {
        expect(hook).to.have.been.calledWith('email');
        expect(data).to.equal('email');
        done();
      });
      $rootScope.$digest();
    });

    it('should reject if there is at least one rejected hook', function(done) {
      var hook = sinon.spy(function(email) {
        return $q.reject();
      });

      inboxEmailSendingHookService.registerPreSendingHook(hook);

      inboxEmailSendingHookService.preSending('email').catch(function() {
        expect(hook).to.have.been.calledWith('email');
        done();
      });
      $rootScope.$digest();
    });

    it('should resolve the input email when there is no hook', function(done) {
      inboxEmailSendingHookService.preSending('email').then(function(data) {
        expect(data).to.equal('email');
        done();
      });
      $rootScope.$digest();
    });
  });

  describe('The postSending function', function() {
    it('should call all the post-hook', function(done) {
      var hook = sinon.spy(function(email) {
        return $q.when();
      });
      var hook2 = sinon.spy(function(email) {
        return $q.when();
      });

      inboxEmailSendingHookService.registerPostSendingHook(hook);
      inboxEmailSendingHookService.registerPostSendingHook(hook2);
      inboxEmailSendingHookService.postSending('email').then(function() {
        expect(hook).to.have.been.calledWith('email');
        expect(hook2).to.have.been.calledWith('email');
        done();
      });
      $rootScope.$digest();
    });

    it('should reject if there is at least one rejected hook', function(done) {
      var hook = sinon.spy(function(email) {
        return $q.reject();
      });

      inboxEmailSendingHookService.registerPostSendingHook(hook);

      inboxEmailSendingHookService.postSending('email').catch(function() {
        expect(hook).to.have.been.calledWith('email');
        done();
      });
      $rootScope.$digest();
    });
  });
});
