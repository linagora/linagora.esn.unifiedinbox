'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The InboxMailboxSharedSettingsController controller', function() {
  var $rootScope,
    $controller,
    scope,
    user,
    otheruser,
    anotheruser,
    mailbox,
    anothermailbox,
    inboxMailboxesService,
    userAPIMock,
    userUtils,
    $q;

  beforeEach(function() {
    user = {_id: '1', firstname: 'user1', lastname: 'user1', preferredEmail: 'user1@test.com'};
    otheruser = {_id: '2', firstname: 'user2', lastname: 'user2', preferredEmail: 'user2@test.com'};
    anotheruser = {_id: '3', firstname: 'user3', lastname: 'user3', preferredEmail: 'user3@test.com'};

    var result = {
      data: [user]
    };

    userAPIMock = {
      getUsersByEmail: sinon.spy(function() {
        return $q.when(result);
      }),
      user: sinon.spy(function() {
        return user;
      })
    };
  });

  beforeEach(function() {
    angular.mock.module('linagora.esn.unifiedinbox', 'jadeTemplates');
    angular.mock.module(function($provide) {
      $provide.value('userAPI', userAPIMock);
    });
  });

  beforeEach(function() {
    mailbox = {_id: '1', sharedWith: {'user2@test.com': ['l', 'r']}};
    anothermailbox = {_id: '2', sharedWith: {}};

    angular.mock.inject(function(_$rootScope_, _$controller_, _inboxMailboxesService_, _$q_, _userUtils_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      scope = $rootScope.$new();
      userUtils = _userUtils_;
      inboxMailboxesService = _inboxMailboxesService_;
      $q = _$q_;
    });

    scope.mailbox = mailbox;

    inboxMailboxesService.updateMailbox = sinon.spy();
    userUtils.displayNameOf = sinon.spy();
  });

  function initController() {
    var controller = $controller('InboxMailboxSharedSettingsController', {
      $scope: scope
    });

    scope.$digest();

    return controller;
  }

  describe('$onInit', function() {
    it('should clone originalMailbox', function() {
      var $controller = initController();

      expect($controller.originalMailbox).to.deep.equal(mailbox);
    });

    it('should add  displayName to sessionUser', function() {
      var $controller = initController();

      expect(userUtils.displayNameOf).to.have.been.calledWith($controller.sessionUser);
    });
  });

  describe('The getUserSharedInformation function', function() {
    it('should call getUserSharedInformation and do nothing if sharedWith is empty object', function() {
      scope.mailbox = anothermailbox;

      var $controller = initController();

      $controller.sessionUser = user;

      expect($controller.mailbox.sharedWith).to.be.deep.equal({});
    });

    it('if sharedWith is emtpy object usersShared should only have sessionUser', function() {
      scope.mailbox = anothermailbox;

      var $controller = initController();

      expect($controller.usersShared).to.have.lengthOf(1);
    });

    it('should call getUsersByEmail for all usersShared and add it in usersShared list', function() {
      var $controller = initController();

      expect(userAPIMock.getUsersByEmail).to.have.been.calledWith(otheruser.preferredEmail);
      expect($controller.usersShared).to.have.lengthOf(2);
    });
  });

  describe('The onUserAdded function', function() {
    it('should fill controller usersShared with the user shared', function() {
      var $controller = initController();

      $controller.onUserAdded(anotheruser);
      $rootScope.$digest();

      expect($controller.usersShared[2]).to.deep.equal(anotheruser);
      expect($controller.usersShared).to.have.lengthOf(3);
      expect($controller.users).to.deep.equal([]);
    });
  });

  describe('The onUserRemoved function', function() {
    it('should not change the usersShared when user is not defined', function() {
      var $controller = initController();

      $controller.onUserRemoved();
      $rootScope.$digest();

      expect($controller.usersShared).to.have.lengthOf(2);
    });

    it('should remove user added in usersShared', function() {
      var $controller = initController();

      $controller.usersShared.push(anotheruser);

      $controller.onUserRemoved(anotheruser);
      $rootScope.$digest();

      expect($controller.usersShared).to.have.lengthOf(2);
    });
  });

  describe('the onAddingUser function', function() {
    var $tag;

    it('should return false if the $tag do not contain the _id field', function() {
      $tag = {};

      var $controller = initController();

      expect($controller.onAddingUser($tag)).to.be.false;
    });

    it('should return true if the $tag contain the _id field', function() {
      $tag = {
        _id: '11111111'
      };

      var $controller = initController();

      expect($controller.onAddingUser($tag)).to.be.true;
    });

    it('should return false when the $tag does already exist in the usersShared', function() {
      $tag = {
        _id: '123'
      };

      var $controller = initController();

      $controller.usersShared = [
        {
          _id: '123'
        }
      ];

      expect($controller.onAddingUser($tag)).to.be.false;
    });
  });

  describe('The addSharedUsers function', function() {
    it('should call inboxMailboxesService', function() {
      var $controller = initController();

      $controller.addSharedUsers();
      $rootScope.$digest();

      expect($controller.usersShared).to.have.lengthOf(1);
      expect(inboxMailboxesService.updateMailbox).to.have.been.calledWith($controller.originalMailbox, $controller.mailbox);
    });
  });
});
