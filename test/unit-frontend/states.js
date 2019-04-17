'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The Inbox states', function() {

  var $rootScope, $templateCache, $state;
  var jmapClient;

  function mockTemplate(templateUri) {
    $templateCache.put(templateUri, '');
  }

  function goTo(state, params) {
    $state.go(state, params);
    $rootScope.$digest();
  }

  beforeEach(function() {
    angular.mock.module('esn.core');
    angular.mock.module('jadeTemplates');
    angular.mock.module('linagora.esn.unifiedinbox');
    angular.mock.module('esn.previous-page');
  });

  beforeEach(function() {
    jmapClient = {
      getMailboxes: function() {
        return $q.when([{ id: '1', name: '1' }]);
      }
    };

    angular.mock.module(function($provide) {
      $provide.value('withJmapClient', function(callback) {
        return callback(jmapClient);
      });
      $provide.value('inboxConfig', function(key, defaultValue) {
        return $q.when(defaultValue);
      });
    });
  });

  beforeEach(function() {
    inject(function(_$rootScope_, _$templateCache_, _$state_) {
      $rootScope = _$rootScope_;
      $templateCache = _$templateCache_;
      $state = _$state_;

      // Mock state templates, so that an HTTP request is not made to the backend to fetch them
      mockTemplate('/unifiedinbox/views/home');
      mockTemplate('/unifiedinbox/views/composer/fullscreen-edit-form/index');
      mockTemplate('/unifiedinbox/views/configuration/index');
      mockTemplate('/unifiedinbox/views/unified-inbox/index');
      mockTemplate('/unifiedinbox/views/configuration/vacation/index');
      mockTemplate('/unifiedinbox/views/email/view/index');
    });
  });

  describe('The unifiedinbox.inbox.attachments.message state', function() {

    it('should hide the attachments sidebar', function() {
      goTo('unifiedinbox.inbox.attachments');

      expect($rootScope.inbox.rightSidebar.isVisible).to.equal(true);

      goTo('.message', {emailId: 'id'});

      expect($rootScope.inbox.rightSidebar.isVisible).to.equal(true);
      expect($rootScope.inbox.list.isElementOpened).to.equal(true);
      expect($rootScope.inbox.list.infiniteScrollDisabled).to.equal(true);
    });

  });

});
