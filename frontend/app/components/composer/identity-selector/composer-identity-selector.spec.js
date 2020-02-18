'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The inboxComposerIdentitySelector component', function() {

  var $compile, $rootScope, element;
  var DEFAULT_IDENTITY = { default: true, uuid: 'default', name: 'name', email: 'email' };

  function compileDirective(html) {
    element = angular.element(html);
    element.appendTo(document.body);

    $compile(element)($rootScope.$new());
    $rootScope.$digest();

    return element;
  }

  afterEach(function() {
    if (element) {
      element.remove();
    }
  });

  beforeEach(module('jadeTemplates', 'linagora.esn.unifiedinbox', function($provide) {
    $provide.value('inboxIdentitiesService', {
      getAllIdentities: function() {
        return $q.when([
          DEFAULT_IDENTITY,
          { id: 'another identity', name: 'another name', email: 'another email' }
        ]);
      }
    });
  }));

  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should populate the dropdown with all identities, preselecting the default one', function() {
    compileDirective('<inbox-composer-identity-selector identity="identity" on-identity-update="identity = $identity" />');

    expect(element.find('select > option')).to.have.length(2);
    expect(element.find('select > option[selected]').val()).to.equal('0');
  });

  it('should select the given identity when defined', function() {
    $rootScope.identity = { id: 'another identity' };

    compileDirective('<inbox-composer-identity-selector identity="identity" on-identity-update="identity = $identity" />');

    expect(element.find('select > option')).to.have.length(2);
    expect(element.find('select > option[selected]').val()).to.equal('1');
  });

  it('should notify when identity selection changes', function(done) {
    compileDirective('<inbox-composer-identity-selector identity="identity" on-identity-update="onIdentityUpdate($identity)" />');

    $rootScope.onIdentityUpdate = function($identity) {
      expect($identity.id).to.equal('another identity');

      done();
    };

    element.find('select').val('1').change();
  });

  it('should format identity labels', function() {
    compileDirective('<inbox-composer-identity-selector identity="identity" on-identity-update="identity = $identity" />');

    expect(element.find('select > option[selected]').text()).to.equal('name <email>');
  });

});
