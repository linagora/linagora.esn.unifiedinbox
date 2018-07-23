'use strict';

describe('The inboxForwardingClient service', function() {
  var API_PATH = '/unifiedinbox/api/inbox/forwardings';
  var $httpBackend;
  var inboxForwardingClient;

  beforeEach(module('linagora.esn.unifiedinbox'));

  beforeEach(inject(function(_$httpBackend_, _inboxForwardingClient_) {
    $httpBackend = _$httpBackend_;
    inboxForwardingClient = _inboxForwardingClient_;
  }));

  describe('The addForwarding function', function() {
    it('should PUT to right endpoint to add new forwarding', function() {
      var forwarding = 'email@op.org';

      $httpBackend.expectPUT(API_PATH, { forwarding: forwarding }).respond(204);

      inboxForwardingClient.addForwarding(forwarding);
      $httpBackend.flush();
    });
  });

  describe('The list function', function() {
    it('should GET to right endpoint to list forwarding', function() {
      $httpBackend.expectGET(API_PATH).respond(200, []);

      inboxForwardingClient.list();
      $httpBackend.flush();
    });
  });

  describe('The removeForwarding function', function() {
    it('should DELETE to right endpoint to remove forwarding', function() {
      var forwarding = 'email@op.org';

      $httpBackend.expect('DELETE', API_PATH, { forwarding: forwarding }).respond(204);

      inboxForwardingClient.removeForwarding(forwarding);
      $httpBackend.flush();
    });
  });

  describe('The updateForwardingConfigurations function', function() {
    it('should PUT to right endpoint to update forwarding configurations', function() {
      var domainId = 'domain-id';
      var configurations = {
        forwarding: true,
        isLocalCopyEnabled: false
      };

      $httpBackend.expectPUT(API_PATH + '/configurations?domain_id=' + domainId + '&scope=domain', configurations).respond(204);

      inboxForwardingClient.updateForwardingConfigurations(domainId, configurations);
      $httpBackend.flush();
    });
  });
});
