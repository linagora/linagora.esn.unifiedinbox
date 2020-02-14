'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The inboxIdentitiesController', function() {
  var $q, $rootScope, $controller, scope;
  var canEdit, identities;
  var inboxIdentitiesServiceMock;

  beforeEach(function() {
    canEdit = true;
    identities = [{ a: 1 }, { b: 2 }];

    inboxIdentitiesServiceMock = {
      canEditIdentities: function() {},
      getAllIdentities: function() {}
    };

    module('linagora.esn.unifiedinbox', function($provide) {
      $provide.value('inboxIdentitiesService', inboxIdentitiesServiceMock);
    });

    inject(function(_$q_, _$rootScope_, _$controller_) {
      $q = _$q_;
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      scope = $rootScope.$new();
    });
  });

  function initController(ctrl) {
    var controller = $controller(ctrl, {
      $scope: scope
    });

    scope.$digest();

    return controller;
  }
  describe('The $onInit function', function() {
    it('should turn canEdit flag to which return from service', function(done) {
      inboxIdentitiesServiceMock.canEditIdentities = sinon.stub().returns($q.when(canEdit));
      inboxIdentitiesServiceMock.getAllIdentities = sinon.stub().returns($q.when(identities));

      var controller = initController('inboxIdentitiesController');

      controller.$onInit();

      scope.$digest();

      expect(inboxIdentitiesServiceMock.canEditIdentities).to.have.been.calledOnce;
      expect(controller.canEdit).to.equals(canEdit);

      done();
    });

    it('should create identities from service', function(done) {
      inboxIdentitiesServiceMock.canEditIdentities = sinon.stub().returns($q.when(canEdit));
      inboxIdentitiesServiceMock.getAllIdentities = sinon.stub().returns($q.when(identities));

      var controller = initController('inboxIdentitiesController');

      controller.$onInit();
      scope.$digest();

      expect(inboxIdentitiesServiceMock.getAllIdentities).to.have.been.calledOnce;
      expect(controller.identities).to.equals(identities);

      done();
    });
  });
});
