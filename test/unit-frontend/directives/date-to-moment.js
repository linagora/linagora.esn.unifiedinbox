'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The dateToMoment directive', function() {
  beforeEach(function() {
    module('jadeTemplates');
    angular.mock.module('esn.core');
    angular.mock.module('linagora.esn.unifiedinbox');

    inject(['$compile', '$rootScope', 'moment', function($c, $r, moment) {
      this.$compile = $c;
      this.$rootScope = $r;
      this.moment = moment;
      this.$scope = this.$rootScope.$new();

      this.initDirective = function(scope) {
        var html = '<input ng-model="event.end" date-to-moment/>';
        var element = this.$compile(html)(scope);

        scope.$digest();

        return element;
      };
    }]);
  });

  it('should return a moment', function() {
    this.$scope.event = {};
    var element = this.initDirective(this.$scope);
    var parser = element.controller('ngModel').$parsers[0];

    expect(moment.isMoment(parser('2015-07-03 10:30'))).to.be.true;
  });

  describe('comportment for invalid date', function() {
    /* global moment: false */

    beforeEach(function() {
      moment.suppressDeprecationWarnings = true;
    });

    it('should return undefined for invalid date', function() {
      this.$scope.event = {
        allDay: false
      };
      var element = this.initDirective(this.$scope);
      var parser = element.controller('ngModel').$parsers[0];

      expect(parser('this is a bad date')).to.be.undefined;
    });

    afterEach(function() {
      moment.suppressDeprecationWarnings = false;
    });
  });
});
