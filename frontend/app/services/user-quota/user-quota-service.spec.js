(function() {
  'use strict';

  /* global chai: false, sinon: false, jmap: false, $q: false */
  var expect = chai.expect;

  describe('The inboxUserQuotaService service', function() {

    var $rootScope, inboxUserQuotaService, mailboxesServiceMock, mockPromise;
    var defaultQuotas = { STORAGE: {used: 120000000, max: 2000000000}, MESSAGE: {used: 3000000000, max: 4000000000 }};
    var fakeInbox = new jmap.Mailbox({}, 'id', 'INBOX', { role: { value: 'inbox' }, quotas: {'private#...': defaultQuotas}});

    beforeEach(module('linagora.esn.unifiedinbox'));
    beforeEach(module(function($provide) {
      mailboxesServiceMock = { getMailboxWithRole: sinon.spy(function() { return mockPromise || $q.when(fakeInbox);}) };
      $provide.value('inboxMailboxesService', mailboxesServiceMock);
    }));

    beforeEach(inject(function(_$rootScope_, _inboxUserQuotaService_) {
      $rootScope = _$rootScope_;
      inboxUserQuotaService = _inboxUserQuotaService_;
    }));

    beforeEach(function() {
      mockPromise = undefined;
    });

    describe('The getUserQuotaInfo function', function() {

      it('should return INBOX\'s first defined quota when set', function(done) {
        inboxUserQuotaService.getUserQuotaInfo().then(function(quota) {
            expect(quota).to.deep.equal({
              usedStorage: 120000000,
              maxStorage: 2000000000,
              storageRatio: 6
            });
            expect(mailboxesServiceMock.getMailboxWithRole).to.have.been.calledOnce;
            done();
          });
        $rootScope.$digest();
      });

      it('should reject when missing INBOX', function(done) {
        mockPromise = $q.when({});
        inboxUserQuotaService.getUserQuotaInfo().catch(function(e) {
          expect(mailboxesServiceMock.getMailboxWithRole).to.have.been.calledOnce;
          expect(e.message).to.equal('Could not find any quota info');
          done();
        });
        $rootScope.$digest();
      });

    });
  });

})();
