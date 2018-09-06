'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The inboxMailboxesFilterService factory', function() {
  var $rootScope, asyncJmapAction, jmapClient, inboxMailboxesFilterService, JMAP_FILTER;

  beforeEach(function() {
    module('esn.i18n', function($translateProvider) {
      $translateProvider.useInterpolation('esnI18nInterpolator');
    });

    module('linagora.esn.unifiedinbox', function($provide) {
      jmapClient = {
        getFilter: sinon.stub().callsFake(function() { // $q is not injected at this stage, `.returns` is unusable
          return $q.when([]);
        }),
        setFilter: sinon.spy()
      };

      asyncJmapAction = sinon.stub().callsFake(function(object, callback) {
        var fn = callback || object;

        return fn(jmapClient);
      });

      var inboxMailboxesService = {
        assignMailboxesList: function(object) {
          object.mailboxes = [{id: '79a160a7-55c1-4fec-87d8-c90c70373990', name: 'INBOX'}];
        }
      };

      $provide.value('asyncJmapAction', asyncJmapAction);
      $provide.value('withJmapClient', asyncJmapAction);
      $provide.value('inboxMailboxesService', inboxMailboxesService);
    });
  });

  beforeEach(inject(function(_$rootScope_, _inboxMailboxesFilterService_, _JMAP_FILTER_) {
    inboxMailboxesFilterService = _inboxMailboxesFilterService_;
    JMAP_FILTER = _JMAP_FILTER_;
    $rootScope = _$rootScope_;
  }));

  describe('addFilter', function() {
    it('should add a new filter', function() {
      inboxMailboxesFilterService.addFilter(
        JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY, 'My filter', 'admin@open-paas.org', {
          action: JMAP_FILTER.ACTIONS.MOVE_TO.JMAP_KEY,
          mailboxId: '79a160a7-55c1-4fec-87d8-c90c70373990'
        });

      var expected = {
        name: 'My filter',
        condition: {
          field: 'from',
          comparator: 'exactly-equals',
          value: 'admin@open-paas.org'
        },
        action: {
          appendIn: {
            mailboxIds: ['79a160a7-55c1-4fec-87d8-c90c70373990']
          }
        }
      };

      expect(inboxMailboxesFilterService.filters.length).to.equal(1);
      // ignoring id as value is random UUID
      delete inboxMailboxesFilterService.filters[0].id;

      expect(inboxMailboxesFilterService.filters[0]).to.deep.eql(expected);

      expect(Object.keys(inboxMailboxesFilterService.filtersIds).length).to.equal(1);
      expect(inboxMailboxesFilterService.filtersIds[Object.keys(inboxMailboxesFilterService.filtersIds)[0]])
        .to.deep.eql(expected);
    });
  });

  describe('getFilters', function() {
    it('should query the backend', function(done) {
      var filter1 = {
        id: '116e2454-3d55-4fe3-948c-95a7e2e92abe',
        name: 'My filter 1',
        condition: {
          field: 'from',
          comparator: 'exactly-equals',
          value: 'admin@open-paas.org'
        },
        action: {
          appendIn: {
            mailboxIds: ['79a160a7-55c1-4fec-87d8-c90c70373990']
          }
        }
      };

      var filter2 = {
        id: '116e2454-3d55-4fe3-948c-95a7e2e92abe',
        name: 'My filter 1',
        condition: {
          field: 'from',
          comparator: 'exactly-equals',
          value: 'admin@open-paas.org'
        },
        action: {
          appendIn: {
            mailboxIds: ['79a160a7-55c1-4fec-87d8-c90c70373990']
          }
        }
      };

      jmapClient.getFilter.returns($q.when([filter1, filter2]));

      inboxMailboxesFilterService.getFilters().then(function() {
        expect(inboxMailboxesFilterService.filters.length).to.equal(2);
        expect(inboxMailboxesFilterService.filters[0]).to.deep.eql(filter1);
        expect(inboxMailboxesFilterService.filters[1]).to.deep.eql(filter2);

        expect(inboxMailboxesFilterService.filtersIds[filter1.id]).to.deep.eql(filter1);
        expect(inboxMailboxesFilterService.filtersIds[filter2.id]).to.deep.eql(filter2);

        done();
      });

      $rootScope.$digest();
    });
  });

  describe('setFilters', function() {
    it('should query the backend', function() {
      inboxMailboxesFilterService.addFilter(
        JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY, 'My filter 1', 'admin@open-paas.org', {
          action: JMAP_FILTER.ACTIONS.MOVE_TO.JMAP_KEY,
          mailboxId: '79a160a7-55c1-4fec-87d8-c90c70373990'
        });

      inboxMailboxesFilterService.addFilter(
        JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY, 'My filter 2', 'admin@open-paas.org', {
          action: JMAP_FILTER.ACTIONS.MOVE_TO.JMAP_KEY,
          mailboxId: '79a160a7-55c1-4fec-87d8-c90c70373990'
        });

      var filter1 = {
        id: inboxMailboxesFilterService.filters[0].id,
        name: 'My filter 1',
        condition: {
          field: 'from',
          comparator: 'exactly-equals',
          value: 'admin@open-paas.org'
        },
        action: {
          appendIn: {
            mailboxIds: ['79a160a7-55c1-4fec-87d8-c90c70373990']
          }
        }
      };

      var filter2 = {
        id: inboxMailboxesFilterService.filters[1].id,
        name: 'My filter 2',
        condition: {
          field: 'from',
          comparator: 'exactly-equals',
          value: 'admin@open-paas.org'
        },
        action: {
          appendIn: {
            mailboxIds: ['79a160a7-55c1-4fec-87d8-c90c70373990']
          }
        }
      };

      inboxMailboxesFilterService.setFilters();

      expect(asyncJmapAction).to.have.been.calledWith({success: 'Filters set', failure: 'Error setting filters'});
      expect(jmapClient.setFilter).to.have.been.calledWith([filter1, filter2]);
    });
  });

  describe('getFilterSummary', function() {
    it('should correctly translate the filter', function() {
      inboxMailboxesFilterService.addFilter(
        JMAP_FILTER.CONDITIONS.FROM.JMAP_KEY, 'My filter', 'admin@open-paas.org', {
          action: JMAP_FILTER.ACTIONS.MOVE_TO.JMAP_KEY,
          mailboxId: '79a160a7-55c1-4fec-87d8-c90c70373990'
        });

      var id = inboxMailboxesFilterService.filters[0].id;
      var target = inboxMailboxesFilterService.getFilterSummary(id);

      expect(target).to
        .eql('When email is from <b>admin@open-paas.org</b> then move to destination folder <b>INBOX</b>');
    });
  });
});
