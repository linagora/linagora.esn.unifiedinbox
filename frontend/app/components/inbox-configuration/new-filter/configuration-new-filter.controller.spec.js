'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The inboxConfigurationNewFilterController', function() {
  var $controller, $scope, $state, $rootScope, inboxMailboxesService, inboxMailboxesFilterService;

  beforeEach(function() {
    module('jadeTemplates');
    module('linagora.esn.unifiedinbox', function($provide) {
      $provide.value('inboxMailboxesService', {
        assignMailboxesList: angular.noop
      });

      inboxMailboxesFilterService = {
        addFilter: angular.noop,
        setFilters: angular.noop
      };

      $provide.value('inboxMailboxesFilterService', inboxMailboxesFilterService);
    });
  });

  beforeEach(inject(function(
    _$controller_,
    _$rootScope_,
    _$state_,
    _inboxMailboxesService_
  ) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $state = _$state_;
    inboxMailboxesService = _inboxMailboxesService_;
  }));

  function initController() {
    $scope = $rootScope.$new();

    var controller = $controller('inboxConfigurationNewFilterController');

    $scope.$digest();

    return controller;
  }

  describe('$onInit', function() {
    it('should initialize the mailbox list', function() {
      sinon.spy(inboxMailboxesService, 'assignMailboxesList');

      var controller = initController();

      controller.$onInit();

      expect(inboxMailboxesService.assignMailboxesList).to.have.been.calledWith(controller);
    });
  });

  describe('saving filters', function() {
    it('should add the new filter to the list', function() {
      var controller = initController();

      sinon.spy($state, 'go');
      sinon.spy(inboxMailboxesFilterService, 'addFilter');
      sinon.stub(inboxMailboxesFilterService, 'setFilters').returns($q.when());

      controller.newFilter = {
        name: 'My filter',
        when: {key: 'from'},
        from: [{email: 'admin@open-paas.org'}],
        then: {key: 'MoveTo'},
        moveTo: {id: 'b2b44073-325e-4e01-ab59-925ea4723ee9'}
      };

      controller.saveFilter();

      expect(inboxMailboxesFilterService.addFilter).to.have.been
        .calledWith('from', 'My filter', 'admin@open-paas.org',
          {action: 'MoveTo', mailboxId: 'b2b44073-325e-4e01-ab59-925ea4723ee9'});
    });

    it('should set the filter and then redirect', function(done) {
      sinon.spy($state, 'go');
      inboxMailboxesFilterService.setFilters = sinon.stub().returns($q.when());

      var controller = initController();

      controller.newFilter = {
        name: 'My filter',
        when: {key: 'from'},
        from: [{email: 'admin@open-paas.org'}],
        then: {key: 'MoveTo'},
        moveTo: {id: 'b2b44073-325e-4e01-ab59-925ea4723ee9'}
      };

      controller.saveFilter().then(function() {
        expect(inboxMailboxesFilterService.setFilters).to.have.been.called;
        expect($state.go).to.have.been.calledWith('unifiedinbox.configuration.filters');

        done();
      });
      $rootScope.$digest();
    });
  });

  describe('hideMoreResults', function() {
    it('should return true when the filter contains one email', function() {
      var controller = $controller('inboxConfigurationNewFilterController');

      controller.newFilter.from = undefined;
      expect(controller.hideMoreResults()).to.be.false;

      controller.newFilter.from = [];
      expect(controller.hideMoreResults()).to.be.false;

      controller.newFilter.from = [undefined];
      expect(controller.hideMoreResults()).to.be.true;
    });
  });
});
