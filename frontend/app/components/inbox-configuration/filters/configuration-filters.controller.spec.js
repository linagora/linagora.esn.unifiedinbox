'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The inboxConfigurationFiltersController', function() {
  var $controller, $scope, $rootScope, inboxMailboxesFilterService;

  beforeEach(function() {
    module('jadeTemplates');
    module('linagora.esn.unifiedinbox', function($provide) {
      inboxMailboxesFilterService = {
        getFilters: angular.noop
      };

      $provide.value('inboxMailboxesFilterService', inboxMailboxesFilterService);
    });
  });

  beforeEach(inject(function(
    _$controller_,
    _$rootScope_
  ) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
  }));

  function initController() {
    $scope = $rootScope.$new();

    var controller = $controller('inboxConfigurationFiltersController');

    $scope.$digest();

    return controller;
  }

  describe('$onInit', function() {
    it('should assign the filters list', function(done) {
      inboxMailboxesFilterService.getFilters = sinon.stub().returns($q.when([1, 2, 3]));

      var target = initController();

      target.$onInit().then(function() {
        expect(inboxMailboxesFilterService.getFilters).to.have.been.called;
        expect(target.filtersList).to.eql([1, 2, 3]);

        done();
      });

      $rootScope.$digest();
    });
  });

});
