'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The inboxRequestReadReceiptsController controller', function() {

  var $componentController, $rootScope;

  beforeEach(function() {
    module('jadeTemplates');
    module('linagora.esn.unifiedinbox', function($provide) {
      $provide.value('$state', {
        go: sinon.spy()
      });
      $provide.value('inboxIdentitiesService', {
        getIdentity: sinon.spy(function(id) {
          return $q.when(!id ? undefined : { id: id, isDefault: id === 'default' });
        }),
        storeIdentity: sinon.spy(function() {
          return $q.when();
        })
      });
    });
  });

  beforeEach(inject(function(_$rootScope_, _$componentController_) {
    $rootScope = _$rootScope_;
    $componentController = _$componentController_;
  }));

  describe('The $onInit function', function() {

    it('should load the identity during initialization', function() {
      var controller = $componentController('inboxIdentityForm', {}, { identityId: '1234' });

      controller.$onInit();
      $rootScope.$digest();

      expect(controller.identity).to.deep.equal({ id: '1234', isDefault: false });
    });

    it('should initialize the identity to an empty object if no identityId is provided', function() {
      var controller = $componentController('inboxIdentityForm', {}, {});

      controller.$onInit();
      $rootScope.$digest();

      expect(controller.identity).to.deep.equal({});
    });

  });

});
