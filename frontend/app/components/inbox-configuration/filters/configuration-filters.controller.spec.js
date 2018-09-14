'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The inboxConfigurationFiltersController', function() {
  var $q, $controller, $scope, $rootScope, inboxMailboxesFilterService;

  beforeEach(function() {
    module('jadeTemplates');
    module('linagora.esn.unifiedinbox', function($provide) {
      inboxMailboxesFilterService = {};

      $provide.value('inboxMailboxesFilterService', inboxMailboxesFilterService);
    });
  });

  beforeEach(inject(function(
    _$controller_,
    _$rootScope_,
    _$q_
  ) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    inboxMailboxesFilterService.getFilters = sinon.stub().returns($q.when([]));
  }));

  function initController() {
    $scope = $rootScope.$new();

    var controller = $controller('inboxConfigurationFiltersController', {$scope: $scope});

    $scope.$digest();

    return controller;
  }

  describe('$onInit', function() {
    it('should correctly init the component', function() {
      var target = initController();

      sinon.spy(target, 'refreshFilters');
      sinon.spy($scope, '$on');

      target.$onInit();

      expect(target.refreshFilters).to.have.been.called;
      expect($scope.$on).to.have.been.calledWith('filters-list-changed', target.refreshFilters);
    });
  });

  describe('refreshFilters', function() {
    it('should assign the filters list', function(done) {
      inboxMailboxesFilterService.getFilters = sinon.stub().returns($q.when([1, 2, 3]));

      var target = initController();

      target.refreshFilters().then(function() {
        expect(inboxMailboxesFilterService.getFilters).to.have.been.called;
        expect(target.filtersList).to.eql([1, 2, 3]);

        done();
      });

      $rootScope.$digest();
    });
  });

});
