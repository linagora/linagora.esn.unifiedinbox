'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The inboxConfigurationNewFilterController', function() {
  var $controller, $scope, $rootScope, $compile, $timeout, inboxMailboxesService;

  beforeEach(function() {
    module('linagora.esn.unifiedinbox', function($provide) {
      $provide.value('inboxMailboxesService', {
        assignMailboxesList: angular.noop
      });

      $provide.value('inboxMailboxesFilterService', {
        addFilter: angular.noop,
        setFilters: angular.noop
      });
    });
  });

  beforeEach(inject(function(_$controller_, _$rootScope_, _$compile_, _$timeout_, _inboxMailboxesService_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $timeout = _$timeout_;
    inboxMailboxesService = _inboxMailboxesService_;
  }));

  function initController() {
    $scope = $rootScope.$new();

    var controller = $controller('inboxConfigurationNewFilterController');

    $scope.$digest();

    return controller;
  }

  function compileComponent(el) {
    var element = angular.element(el);

    element.appendTo(document.body);

    $compile(element)($rootScope.$new());
    $timeout.flush();

    return element;
  }

  describe('$onInit', function() {
    it('should initialize the mailbox list', function() {
      sinon.spy(inboxMailboxesService, 'assignMailboxesList');

      var controller = initController();

      controller.$onInit();

      expect(inboxMailboxesService.assignMailboxesList).to.have.been.calledWith(controller);
    });
  });

  describe.skip('saving filters', function() { // Deactivating the tests for now
    it('should save the new filter', function() {
      var el = compileComponent('<inbox-configuration-new-filter></inbox-configuration-new-filter>');

      el.find('button')[0].click();
    });
  });
});
