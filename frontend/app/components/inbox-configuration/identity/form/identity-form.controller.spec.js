'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The inboxIdentityFormController', function() {
  var $q, $rootScope, $controller, scope;
  var identity, userId, emails;
  var inboxUsersIdentitiesClient;

  beforeEach(function() {
    identity = [{ email: 'a', replyTo: 'b' }];
    userId = '1';
    emails = ['a', 'b', 'c'];

    module('linagora.esn.unifiedinbox');

    inject(function(
      _$q_,
      _$rootScope_,
      _$controller_,
      _inboxUsersIdentitiesClient_,
    ) {
      $q = _$q_;
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      scope = $rootScope.$new();
      inboxUsersIdentitiesClient = _inboxUsersIdentitiesClient_;
    });
  });

  function initController(ctrl) {
    var controller = $controller(ctrl,
      { $scope: scope },
      {
        userId: userId,
        identity: identity
      }
    );

    controller.$onInit();
    scope.$digest();

    return controller;
  }
  describe('The $onInit function', function() {
    it('should set status to loaded when success loading form', function() {
      inboxUsersIdentitiesClient.getValidEmails = sinon.stub().returns($q.when(emails));

      var controller = initController('inboxIdentityFormController');

      expect(inboxUsersIdentitiesClient.getValidEmails).to.have.been.calledOnce;
      expect(inboxUsersIdentitiesClient.getValidEmails).to.have.been.calledWith(userId);
      expect(controller.status).to.equal('loaded');
    });

    it('should set status to error when failed to loading form', function() {
      inboxUsersIdentitiesClient.getValidEmails = sinon.stub().returns($q.reject());

      var controller = initController('inboxIdentityFormController');

      expect(inboxUsersIdentitiesClient.getValidEmails).to.have.been.calledOnce;
      expect(inboxUsersIdentitiesClient.getValidEmails).to.have.been.calledWith(userId);
      expect(controller.status).to.equal('error');
    });

    it('should display email of identity if it has', function() {
      inboxUsersIdentitiesClient.getValidEmails = sinon.stub().returns($q.when(emails));

      var controller = initController('inboxIdentityFormController');

      expect(inboxUsersIdentitiesClient.getValidEmails).to.have.been.calledOnce;
      expect(inboxUsersIdentitiesClient.getValidEmails).to.have.been.calledWith(userId);
      expect(controller.identity.email).to.equal(identity.email);
    });

    it('should display replyTo of identity if it has', function() {
      inboxUsersIdentitiesClient.getValidEmails = sinon.stub().returns($q.when(emails));

      var controller = initController('inboxIdentityFormController');

      expect(inboxUsersIdentitiesClient.getValidEmails).to.have.been.calledOnce;
      expect(inboxUsersIdentitiesClient.getValidEmails).to.have.been.calledWith(userId);
      expect(controller.identity.replyTo).to.equal(identity.replyTo);
    });

    it('should display first email if there is no identity email', function() {
      inboxUsersIdentitiesClient.getValidEmails = sinon.stub().returns($q.when(emails));

      var controller = initController('inboxIdentityFormController');

      expect(inboxUsersIdentitiesClient.getValidEmails).to.have.been.calledOnce;
      expect(inboxUsersIdentitiesClient.getValidEmails).to.have.been.calledWith(userId);
      expect(controller.identity.email).to.equal(emails[0]);
    });

    it('should display first reply-to email if there is no identity email', function() {
      inboxUsersIdentitiesClient.getValidEmails = sinon.stub().returns($q.when(emails));

      var controller = initController('inboxIdentityFormController');

      expect(inboxUsersIdentitiesClient.getValidEmails).to.have.been.calledOnce;
      expect(inboxUsersIdentitiesClient.getValidEmails).to.have.been.calledWith(userId);
      expect(controller.identity.replyTo).to.equal(emails[0]);
    });
  });
});
