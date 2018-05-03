'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The InboxForwardingsController controller', function() {
  var $rootScope, $controller, $scope;
  var session, inboxConfigMock, inboxForwardingClient, inboxForwardingsService;

  beforeEach(function() {
    module('linagora.esn.unifiedinbox');

    inboxConfigMock = function(key, defaultValue) {
      return $q.when(defaultValue);
    };

    module(function($provide) {
      $provide.value('inboxConfig', inboxConfigMock);
    });
  });

  beforeEach(function() {
    inject(function(
      _$rootScope_,
      _$controller_,
      _session_,
      _inboxConfig_,
      _inboxForwardingClient_,
      _inboxForwardingsService_
    ) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      session = _session_;
      inboxForwardingClient = _inboxForwardingClient_;
      inboxForwardingClient = _inboxForwardingClient_;
      inboxForwardingsService = _inboxForwardingsService_;
    });
  });

  function initController() {
    $scope = $rootScope.$new();

    var controller = $controller('InboxForwardingsController', { $scope: $scope });

    $scope.$digest();

    return controller;
  }

  describe('The $onInit function', function() {
    it('should set status "loading"', function() {
      var controller = initController();

      controller.$onInit();

      expect(controller.status).to.equal('loading');
    });

    it('should get forwarding configuration', function() {
      var forwardings = ['email1@op.org'];

      inboxForwardingClient.list = sinon.stub().returns($q.when({ data: forwardings }));
      var controller = initController();

      controller.$onInit();

      $scope.$digest();

      expect(controller.status).to.equal('loaded');
      expect(controller.isForwardingEnabled).to.exist;
      expect(controller.isLocalCopyEnabled).to.exist;
      expect(inboxForwardingClient.list).to.have.been.called;
      expect(controller.forwardings).to.deep.equal(['email1@op.org']);
    });

    it('should set excluded emails equal current forwarding emails plus user email', function() {
      var forwardings = ['email1@op.org'];

      session.user = { preferredEmail: 'my-email@op.org' };
      inboxForwardingClient.list = sinon.stub().returns($q.when({ data: forwardings }));
      var controller = initController();

      controller.$onInit();

      $scope.$digest();

      expect(controller.excludedEmails).to.deep.equal([session.user.preferredEmail, 'email1@op.org']);
    });

    it('should show error when failed to get forwarding configuration', function() {
      inboxForwardingClient.list = sinon.stub().returns($q.reject(new Error('an error')));
      var controller = initController();

      controller.$onInit();

      $scope.$digest();

      expect(inboxForwardingClient.list).to.have.been.called;
      expect(controller.status).to.equal('error');
    });
  });

  describe('The onAddForwarding function', function() {
    it('should add new forwardings', function() {
      var forwardings = ['email1@op.org'];

      inboxForwardingClient.list = sinon.stub().returns($q.when({ data: forwardings }));
      var controller = initController();

      controller.$onInit();

      $scope.$digest();

      expect(controller.forwardings).to.deep.equal(forwardings);

      controller.newForwardings = [
        { email: 'email2@op.org' },
        { email: 'email3@op.org' }
      ];
      controller.onAddForwarding();
      expect(controller.forwardings).to.deep.equal(['email1@op.org', 'email2@op.org', 'email3@op.org']);
    });

    it('should add new forwardings to excluded emails', function() {
      var forwardings = ['email1@op.org'];

      session.user = { preferredEmail: 'my-email@op.org' };
      inboxForwardingClient.list = sinon.stub().returns($q.when({ data: forwardings }));
      var controller = initController();

      controller.$onInit();

      $scope.$digest();

      controller.newForwardings = [
        { email: 'email2@op.org' }
      ];
      controller.onAddForwarding();
      expect(controller.excludedEmails).to.deep.equal([session.user.preferredEmail, 'email1@op.org', 'email2@op.org']);
    });
  });

  describe('The onRemoveForwarding function', function() {
    it('should remove forwarding', function() {
      var forwardings = ['email1@op.org', 'email2@op.org'];

      inboxForwardingClient.list = sinon.stub().returns($q.when({ data: forwardings }));
      var controller = initController();

      controller.$onInit();

      $scope.$digest();

      expect(controller.forwardings).to.deep.equal(forwardings);

      controller.onRemoveForwarding('email2@op.org');
      expect(controller.forwardings).to.deep.equal(['email1@op.org']);
    });

    it('should remove removed forwarding from excluded emails', function() {
      var forwardings = ['email1@op.org', 'email2@op.org'];

      session.user = { preferredEmail: 'my-email@op.org' };
      inboxForwardingClient.list = sinon.stub().returns($q.when({ data: forwardings }));
      var controller = initController();

      controller.$onInit();

      $scope.$digest();

      expect(controller.excludedEmails).to.deep.equal([session.user.preferredEmail, 'email1@op.org', 'email2@op.org']);

      controller.onRemoveForwarding('email2@op.org');
      expect(controller.excludedEmails).to.deep.equal([session.user.preferredEmail, 'email1@op.org']);
    });
  });

  describe('The onSave function', function() {
    it('should call inboxForwardingsService.update to update forwardings', function() {
      var forwardings = ['email1@op.org'];

      inboxForwardingClient.list = sinon.stub().returns($q.when({ data: forwardings }));
      var controller = initController();

      controller.$onInit();

      $scope.$digest();

      controller.newForwardings = [
        { email: 'email2@op.org' },
        { email: 'email3@op.org' }
      ];
      controller.onAddForwarding();
      controller.onRemoveForwarding('email1@op.org');

      inboxForwardingsService.update = sinon.stub().returns($q.when());
      controller.onSave();
      $scope.$digest();

      expect(inboxForwardingsService.update).to.have.been.calledWith({
        forwardingsToAdd: ['email2@op.org', 'email3@op.org'],
        forwardingsToRemove: ['email1@op.org']
      });
    });

    it('should add user email as a forwarding address if Keep local copy is ON', function() {
      var forwardings = ['email1@op.org'];

      session.user = { preferredEmail: 'my-email@op.org' };
      inboxForwardingClient.list = sinon.stub().returns($q.when({ data: forwardings }));
      var controller = initController();

      controller.$onInit();

      $scope.$digest();

      inboxForwardingsService.update = sinon.stub().returns($q.when());
      controller.keepLocalCopy = true;
      controller.onSave();
      $scope.$digest();

      expect(inboxForwardingsService.update).to.have.been.calledWith({
        forwardingsToAdd: [session.user.preferredEmail],
        forwardingsToRemove: []
      });
    });

    it('should remove user email from forwarding addresses if Keep local copy is OFF', function() {
      session.user = { preferredEmail: 'my-email@op.org' };
      var forwardings = [session.user.preferredEmail, 'email1@op.org'];

      inboxForwardingClient.list = sinon.stub().returns($q.when({ data: forwardings }));
      var controller = initController();

      controller.$onInit();
      $scope.$digest();

      inboxForwardingsService.update = sinon.stub().returns($q.when());
      controller.keepLocalCopy = false;
      controller.onSave();
      $scope.$digest();

      expect(inboxForwardingsService.update).to.have.been.calledWith({
        forwardingsToAdd: [],
        forwardingsToRemove: [session.user.preferredEmail]
      });
    });
  });
});
