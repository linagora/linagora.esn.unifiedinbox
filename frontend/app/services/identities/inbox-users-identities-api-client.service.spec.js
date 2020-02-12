'use strict';

describe('The inboxUsersIdentitiesClient service', function() {
  var API_PATH = '/unifiedinbox/api/inbox/users';
  var $httpBackend;
  var inboxUsersIdentitiesClient;

  beforeEach(module('linagora.esn.unifiedinbox'));

  beforeEach(inject(function(_$httpBackend_, _inboxUsersIdentitiesClient_) {
    $httpBackend = _$httpBackend_;
    inboxUsersIdentitiesClient = _inboxUsersIdentitiesClient_;
  }));

  describe('The listForwardings function', function() {
    it('should GET to right endpoint to list forwarding of current user', function() {
      $httpBackend.expectGET(API_PATH + '/user-id/identities').respond(200, []);

      inboxUsersIdentitiesClient.getIdentities('user-id');
      $httpBackend.flush();
    });
  });

  describe('The updateIdentites function', function() {
    it('should PUT to right endpoint to update forwarding configurations', function() {
      var identities = [{
        default: true,
        email: 'user@email'
      }];

      $httpBackend.expectPUT(API_PATH + '/user-id/identities', identities).respond(200, []);

      inboxUsersIdentitiesClient.updateIdentities('user-id', identities);
      $httpBackend.flush();
    });
  });
});
