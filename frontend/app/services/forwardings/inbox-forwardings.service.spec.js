'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The inboxForwardingsService service', function() {
  var $rootScope, inboxForwardingClient, inboxForwardingsService;

  beforeEach(module('linagora.esn.unifiedinbox'));

  beforeEach(
    inject(function(
      _$rootScope_,
      _inboxForwardingClient_,
      _inboxForwardingsService_
    ) {
      $rootScope = _$rootScope_;
      inboxForwardingClient = _inboxForwardingClient_;
      inboxForwardingsService = _inboxForwardingsService_;
    })
  );

  describe('The update function', function() {
    it('should call inboxForwardingClient.addForwarding to add new forwardings', function(done) {
      inboxForwardingClient.addForwarding = sinon.spy();
      var updateData = {
        forwardingsToAdd: ['email1@op.org', 'email2@op.org'],
        forwardingsToRemove: []
      };

      inboxForwardingsService.update(updateData)
        .then(function() {
          expect(inboxForwardingClient.addForwarding).to.have.been.calledTwice;

          done();
        });
      $rootScope.$digest();
    });

    it('should call inboxForwardingClient.removeForwarding to remove forwardings', function(done) {
      inboxForwardingClient.removeForwarding = sinon.spy();
      var updateData = {
        forwardingsToAdd: [],
        forwardingsToRemove: ['email1@op.org', 'email2@op.org']
      };

      inboxForwardingsService.update(updateData)
        .then(function() {
          expect(inboxForwardingClient.removeForwarding).to.have.been.calledTwice;

          done();
        });
      $rootScope.$digest();
    });
  });
});
