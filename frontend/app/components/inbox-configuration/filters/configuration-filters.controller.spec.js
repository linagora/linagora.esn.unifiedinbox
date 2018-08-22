'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The inboxConfigurationFiltersController', function() {
  var $rootScope, $controller, scope, config;

  beforeEach(function() {
    config = {};

    angular.mock.inject(function(_$rootScope_, _$controller_) {
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
});
