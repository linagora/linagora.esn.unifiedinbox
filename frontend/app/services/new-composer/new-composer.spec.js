'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The newComposerService ', function() {

  var $rootScope, $state, $timeout, config, newComposerService, deviceDetector, boxOverlayOpener;

  beforeEach(function() {
    angular.mock.module('linagora.esn.unifiedinbox', 'jadeTemplates', function($provide) {
      config = config || {};

      $provide.value('esnConfig', function(key, defaultValue) {
        return $q.when(angular.isDefined(config[key]) ? config[key] : defaultValue);
      });
      $provide.value('withJmapClient', function(callback) {
        return callback({
          getMessages: function() {
            return $q.when([{ id: 'id' }]);
          }
        }, { url: 'http://jmap' });
      });
    });
  });

  afterEach(function() {
    config = {};
  });

  beforeEach(inject(function(_$rootScope_, _$state_, _$timeout_, _newComposerService_, _deviceDetector_, _boxOverlayOpener_) {
    $rootScope = _$rootScope_;
    newComposerService = _newComposerService_;
    deviceDetector = _deviceDetector_;
    $state = _$state_;
    $timeout = _$timeout_;
    boxOverlayOpener = _boxOverlayOpener_;
  }));

  beforeEach(function() {
    $state.current = {
      name: 'stateName'
    };
    $state.params = 'stateParams';
    $state.go = sinon.spy();
  });

  afterEach(function() {
    $('.box-overlay-open').remove();
  });

  describe('The "open" method', function() {

    it('should delegate to deviceDetector to know if the device is mobile or not', function(done) {
      deviceDetector.isMobile = done;
      newComposerService.open();
    });

    it('should update the location if deviceDetector returns true', function() {
      deviceDetector.isMobile = sinon.stub().returns(true);

      newComposerService.open();
      $timeout.flush();

      expect($state.go).to.have.been.calledWith('unifiedinbox.compose', {
        email: undefined,
        compositionOptions: undefined
      });
    });

    it('should delegate to boxOverlayOpener if deviceDetector returns false', function() {
      deviceDetector.isMobile = sinon.stub().returns(false);
      boxOverlayOpener.open = sinon.spy();

      newComposerService.open();

      expect(boxOverlayOpener.open).to.have.been.calledWithMatch({
        title: 'New message',
        templateUrl: '/unifiedinbox/views/composer/box-compose.html'
      });
    });

  });

  describe('The "openDraft" method', function() {

    it('should delegate to deviceDetector to know if device is mobile or not', function(done) {
      deviceDetector.isMobile = done;

      newComposerService.openDraft('id');
      $rootScope.$digest();
    });

    it('should update the location with the email id if deviceDetector returns true', function() {
      deviceDetector.isMobile = sinon.stub().returns(true);
      $state.go = sinon.spy();

      newComposerService.openDraft('id');
      $rootScope.$digest();

      expect($state.go).to.have.been.calledWith('unifiedinbox.compose', {
        email: { id: 'id' },
        compositionOptions: undefined
      });
    });

    it('should delegate to boxOverlayOpener if deviceDetector returns false', function() {
      deviceDetector.isMobile = sinon.stub().returns(false);
      boxOverlayOpener.open = sinon.spy();

      newComposerService.openDraft('id');
      $rootScope.$digest();

      expect(boxOverlayOpener.open).to.have.been.calledWith({
        id: 'id',
        title: 'New message',
        templateUrl: '/unifiedinbox/views/composer/box-compose.html',
        email: { id: 'id' },
        compositionOptions: null
      });
    });

    it('should not open twice the same draft on desktop', function() {
      deviceDetector.isMobile = sinon.stub().returns(false);

      newComposerService.openDraft('id');
      newComposerService.openDraft('id');
      $rootScope.$digest();

      expect($('.box-overlay-open').length).to.equal(1);
    });

  });

  describe('The "openEmailCustomTitle" method', function() {

    it('should delegate to deviceDetector to know if the device is mobile', function(done) {
      deviceDetector.isMobile = done;
      newComposerService.open({id: 'value'}, 'title');
    });

    it('should update the location with the email id if deviceDetector returns true', function() {
      deviceDetector.isMobile = sinon.stub().returns(true);

      newComposerService.open({expected: 'field'});
      $timeout.flush();

      expect($state.go).to.have.been.calledWith('unifiedinbox.compose', {
        email: {expected: 'field'},
        compositionOptions: undefined
      });
    });

    it('should delegate to boxOverlayOpener if deviceDetector returns false', function() {
      deviceDetector.isMobile = sinon.stub().returns(false);
      boxOverlayOpener.open = sinon.spy();

      newComposerService.open({ id: '1234', subject: 'object' });

      expect(boxOverlayOpener.open).to.have.been.calledWith({
        id: '1234',
        templateUrl: '/unifiedinbox/views/composer/box-compose.html',
        email: { id: '1234', subject: 'object' },
        title: 'New message',
        compositionOptions: undefined
      });
    });

    it('should use the email subject when opening an existing message', function() {
      deviceDetector.isMobile = sinon.stub().returns(false);
      boxOverlayOpener.open = sinon.spy();

      newComposerService.open({ id: '1234', subject: 'object' });

      expect(boxOverlayOpener.open).to.have.been.calledWith({
        id: '1234',
        title: 'New message',
        templateUrl: '/unifiedinbox/views/composer/box-compose.html',
        email: { id: '1234', subject: 'object' },
        compositionOptions: undefined
      });
    });

    it('should forward the compositionOptions when "open" is called and is on mobile', function() {
      deviceDetector.isMobile = sinon.stub().returns(true);

      newComposerService.open({expected: 'field'}, {expected: 'options'});
      $timeout.flush();

      expect($state.go).to.have.been.calledWith('unifiedinbox.compose', {
        email: {expected: 'field'},
        compositionOptions: {expected: 'options'}
      });
    });

    it('should forward the compositionOptions when "open" is called and is not on mobile', function() {
      deviceDetector.isMobile = sinon.stub().returns(false);
      boxOverlayOpener.open = sinon.spy();

      newComposerService.open({id: '1234', subject: 'object'}, {expected: 'options'});

      expect(boxOverlayOpener.open).to.have.been.calledWith({
        id: '1234',
        templateUrl: '/unifiedinbox/views/composer/box-compose.html',
        email: {id: '1234', subject: 'object'},
        compositionOptions: {expected: 'options'},
        title: 'New message'
      });
    });

  });

});
