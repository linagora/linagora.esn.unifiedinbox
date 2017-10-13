'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The inboxFolderSettings controller', function() {
  var $rootScope, scope, $controller, inboxJmapItemService;

  beforeEach(function() {
    angular.mock.module('linagora.esn.unifiedinbox', 'jadeTemplates');
  });

  beforeEach(inject(function(_$rootScope_, _$controller_, _inboxJmapItemService_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    scope = $rootScope.$new();
    inboxJmapItemService = _inboxJmapItemService_;

    inboxJmapItemService.emptyMailbox = sinon.spy();
  }));

  function initController() {
    var controller = $controller('inboxFolderSettingsController', {});

    scope.$digest();

    return controller;
  }

  beforeEach(function() {
    scope.mailbox = {
      id: 'id_mailbox',
      role: {
        value: 'trash'
      },
      totalMessages: 10
    };
  });

  it('should call "inboxJmapItemService" with the given "mailboxId" when clicked in emptyTrash', function() {
    var controller = initController();

    controller.emptyTrash(scope.mailbox.id);

    expect(scope.mailbox.role.value).to.equal('trash');
    expect(inboxJmapItemService.emptyMailbox).to.have.been.calledWith(scope.mailbox.id);
  });
});
