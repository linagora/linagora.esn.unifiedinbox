'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The inboxConfigurationNewFilterController', function() {
  var $controller, $scope, $state, $rootScope, inboxMailboxesService, inboxMailboxesFilterService, JMAP_FILTER, userAPI;

  beforeEach(function() {
    module('esn.i18n', function($translateProvider) {
      $translateProvider.useInterpolation('esnI18nInterpolator');
    });

    module('jadeTemplates');
    module('linagora.esn.unifiedinbox', function($provide) {
      $provide.value('inboxMailboxesService', {
        assignMailboxesList: angular.noop
      });

      inboxMailboxesFilterService = {
        addFilter: angular.noop,
        setFilters: angular.noop,
        editFilter: angular.noop
      };

      userAPI = {
        getUsersByEmail: sinon.stub(),
        user: sinon.spy(function() {
          return [{id: '1', firstname: 'user1', lastname: 'user1', preferredEmail: 'user1@test.com'}];
        })
      };

      JMAP_FILTER = {
        CONDITIONS: {
          FROM: {JMAP_KEY: 'from', HUMAN_REPRESENTATION: 'email is from %s'},
          CONDITION2: {JMAP_KEY: 'condition2', HUMAN_REPRESENTATION: 'conditionMessage2'},
          CONDITION3: {JMAP_KEY: 'condition3', HUMAN_REPRESENTATION: 'conditionMessage3'}
        },
        ACTIONS: {
          MOVE_TO: {JMAP_KEY: 'appendIn', HUMAN_REPRESENTATION: 'move to destination folder %s'},
          ACTION2: {JMAP_KEY: 'action2', HUMAN_REPRESENTATION: 'actionMessage2'},
          ACTION3: {JMAP_KEY: 'action3', HUMAN_REPRESENTATION: 'actionMessage3'}
        }
      };

      $provide.value('userAPI', userAPI);
      $provide.value('inboxMailboxesFilterService', inboxMailboxesFilterService);
      $provide.constant('JMAP_FILTER', JMAP_FILTER);
    });
  });

  beforeEach(inject(function(
    _$controller_,
    _$rootScope_,
    _$state_,
    _inboxMailboxesService_
  ) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $state = _$state_;
    inboxMailboxesService = _inboxMailboxesService_;
  }));

  function initController() {
    $scope = $rootScope.$new();

    var controller = $controller('inboxConfigurationNewFilterController');

    $scope.$digest();

    return controller;
  }

  describe('$onInit', function() {
    it('should initialize the mailbox list', function() {
      sinon.spy(inboxMailboxesService, 'assignMailboxesList');

      var controller = initController();

      controller.$onInit();

      expect(inboxMailboxesService.assignMailboxesList).to.have.been.calledWith(controller);
    });

    it('should init the models', function() {
      var controller = initController();

      controller.$onInit();

      expect(controller.conditionsOptions).to.deep.eql([
        {key: 'from', val: 'email is from '},
        {key: 'condition2', val: 'conditionMessage2'},
        {key: 'condition3', val: 'conditionMessage3'}
      ]);
      expect(controller.actionOptions).to.deep.eql([
        {key: 'appendIn', val: 'move to destination folder '},
        {key: 'action2', val: 'actionMessage2'},
        {key: 'action3', val: 'actionMessage3'}
      ]);
      expect(controller.newFilter.when).to.equal(controller.conditionsOptions[0]);
      expect(controller.newFilter.then).to.equal(controller.actionOptions[0]);
    });

    it('should call initEditForm() when filter ID is provided', function() {
      var controller = initController();

      sinon.stub(controller, 'initEditForm');
      controller.editFilterId = 'b6e82a3f-d175-4138-8cd7-acd30fbcc477';

      controller.$onInit();

      expect(controller.initEditForm).to.have.been.called;
    });
  });

  describe('saving filters', function() {
    describe('when adding a new filter', function() {
      it('should add the new filter to the list', function() {
        var controller = initController();

        sinon.spy($state, 'go');
        sinon.spy(inboxMailboxesFilterService, 'addFilter');
        sinon.stub(inboxMailboxesFilterService, 'setFilters').returns($q.when());

        controller.newFilter = {
          name: 'My filter',
          when: {key: 'from'},
          from: [{email: 'admin@open-paas.org'}],
          then: {key: 'MoveTo'},
          moveTo: {id: 'b2b44073-325e-4e01-ab59-925ea4723ee9'}
        };

        controller.saveFilter();

        expect(inboxMailboxesFilterService.addFilter).to.have.been
          .calledWith('from', 'My filter', 'admin@open-paas.org',
            {action: 'MoveTo', mailboxId: 'b2b44073-325e-4e01-ab59-925ea4723ee9'});
      });
    });

    describe('when editing an existing filter', function() {
      it('should add the new filter to the list', function() {
        var controller = initController();

        controller.editFilterId = '3ec75e00-414e-4c7d-8a16-1c4fea55131a';

        sinon.spy($state, 'go');
        sinon.spy(inboxMailboxesFilterService, 'editFilter');
        sinon.stub(inboxMailboxesFilterService, 'setFilters').returns($q.when());

        controller.newFilter = {
          name: 'My filter',
          when: {key: 'from'},
          from: [{email: 'admin@open-paas.org'}],
          then: {key: 'MoveTo'},
          moveTo: {id: 'b2b44073-325e-4e01-ab59-925ea4723ee9'}
        };

        controller.saveFilter();

        expect(inboxMailboxesFilterService.editFilter).to.have.been
          .calledWith('3ec75e00-414e-4c7d-8a16-1c4fea55131a', 'from', 'My filter', 'admin@open-paas.org',
            {action: 'MoveTo', mailboxId: 'b2b44073-325e-4e01-ab59-925ea4723ee9'});
      });
    });

    it('should set the filter and then redirect', function(done) {
      sinon.spy($state, 'go');
      inboxMailboxesFilterService.setFilters = sinon.stub().returns($q.when());

      var controller = initController();

      controller.newFilter = {
        name: 'My filter',
        when: {key: 'from'},
        from: [{email: 'admin@open-paas.org'}],
        then: {key: 'MoveTo'},
        moveTo: {id: 'b2b44073-325e-4e01-ab59-925ea4723ee9'}
      };

      controller.saveFilter().then(function() {
        expect(inboxMailboxesFilterService.setFilters).to.have.been.called;
        expect($state.go).to.have.been.calledWith('unifiedinbox.configuration.filters');

        done();
      });
      $rootScope.$digest();
    });
  });

  describe('hideMoreResults', function() {
    it('should return true when the filter contains one email', function() {
      var controller = $controller('inboxConfigurationNewFilterController');

      controller.newFilter.from = undefined;
      expect(controller.hideMoreResults()).to.be.false;

      controller.newFilter.from = [];
      expect(controller.hideMoreResults()).to.be.false;

      controller.newFilter.from = [undefined];
      expect(controller.hideMoreResults()).to.be.true;
    });
  });

  describe('initEditForm', function() {
    it('should start initing `newFilter`', function(done) {
      inboxMailboxesFilterService.getFilters = sinon.stub().returns($q.when());
      inboxMailboxesFilterService.filtersIds = {
        '3ec75e00-414e-4c7d-8a16-1c4fea55131a': {
          name: 'My filter',
          condition: {
            field: 'condition2'
          },
          action: {action2: {}}
        }
      };

      var controller = initController();

      controller.$onInit(); // Initialize the models

      controller.editFilterId = '3ec75e00-414e-4c7d-8a16-1c4fea55131a';
      controller.initEditForm().then(function() {
        expect(controller.newFilter).to.deep.eql({
          name: 'My filter',
          when: {key: 'condition2', val: 'conditionMessage2'},
          then: {key: 'action2', val: 'actionMessage2'}
        });

        done();
      });

      $rootScope.$digest();
    });

    describe('initializing conditions', function() {
      it('should initilize the model when condition is JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY', function(done) {
        userAPI.getUsersByEmail.withArgs('open-paas.org').returns($q.when({
          data: [{
            preferredEmail: 'open-paas.org',
            firstname: 'admin',
            lastname: 'admin'
          }]
        }));
        inboxMailboxesFilterService.getFilters = sinon.stub().returns($q.when());
        inboxMailboxesFilterService.filtersIds = {
          '3ec75e00-414e-4c7d-8a16-1c4fea55131a': {
            name: 'My filter',
            condition: {
              field: JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY,
              value: 'open-paas.org'
            },
            action: {action2: {}}
          }
        };

        var controller = initController();

        controller.$onInit(); // Initialize the models

        controller.editFilterId = '3ec75e00-414e-4c7d-8a16-1c4fea55131a';
        controller.initEditForm().then(function() {
          expect(controller.newFilter).to.deep.eql({
            name: 'My filter',
            when: {key: JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY, val: 'email is from '},
            then: {key: 'action2', val: 'actionMessage2'},
            from: [{
              email: 'open-paas.org',
              name: 'admin admin'
            }]
          });

          done();
        });

        $rootScope.$digest();
      });
    });

    describe('initializing action', function() {
      it('should initilize the model when condition is JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY', function(done) {
        var mailboxes = [{id: 'aca5887c-2a90-4180-9b53-042f7917f4d8', name: 'My mailbox'}];

        inboxMailboxesService.assignMailboxesList = function(object) {
          object.mailboxes = mailboxes;
          return $q.when();
        };

        inboxMailboxesFilterService.getFilters = sinon.stub().returns($q.when());
        inboxMailboxesFilterService.filtersIds = {
          '3ec75e00-414e-4c7d-8a16-1c4fea55131a': {
            name: 'My filter',
            condition: {
              field: 'condition2'
            },
            action: {appendIn: {mailboxIds: ['aca5887c-2a90-4180-9b53-042f7917f4d8']}}
          }
        };

        var controller = initController();

        controller.$onInit(); // Initialize the models

        controller.editFilterId = '3ec75e00-414e-4c7d-8a16-1c4fea55131a';
        controller.initEditForm().then(function() {
          console.error(JSON.stringify(controller.newFilter));
          expect(controller.newFilter).to.deep.eql({
            name: 'My filter',
            when: {key: 'condition2', val: 'conditionMessage2'},
            then: {key: 'appendIn', val: 'move to destination folder '},
            moveTo: {id: 'aca5887c-2a90-4180-9b53-042f7917f4d8', name: 'My mailbox'}
          });

          done();
        });

        $rootScope.$digest();
      });
    });
  });
});
