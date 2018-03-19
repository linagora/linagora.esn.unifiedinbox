'use strict';

/* global chai, sinon: false, $q: false */

var expect = chai.expect;

describe('The inboxReadReceiptController controller', function() {
  var $rootScope,
    $controller,
    scope,
    inboxJmapItemService,
    emailSendingService,
    message;

  beforeEach(function() {
    angular.mock.module('linagora.esn.unifiedinbox');
  });

  beforeEach(function() {
    angular.mock.inject(function(_$rootScope_, _$controller_, _inboxJmapItemService_, _emailSendingService_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      scope = $rootScope.$new();
      inboxJmapItemService = _inboxJmapItemService_;
      emailSendingService = _emailSendingService_;
    });

    message = {
      headers: {
        'Disposition-Notification-To': 'test@test.com'
      }
    };

    sinon.stub(inboxJmapItemService, 'ackReceipt').returns($q.when());
    sinon.stub(emailSendingService, 'getReadReceiptRequest').returns($q.when());
  });

  function initController() {
    var controller = $controller('inboxReadReceiptController', {
      message: message
    });

    scope.$digest();

    return controller;
  }

  describe('$onInit function', function() {
    it('should get read receipt request', function() {
      var controller = initController();

      controller.$onInit();

      expect(emailSendingService.getReadReceiptRequest).to.have.been.calledWith(controller.message);
    });
  });

  describe('ackReceipt function', function() {
    it('should send read receipt', function() {
      var controller = initController();

      controller.ackReceipt();

      expect(inboxJmapItemService.ackReceipt).to.have.been.called;
      expect(controller.hide).to.equal.false;
    });
  });
});
