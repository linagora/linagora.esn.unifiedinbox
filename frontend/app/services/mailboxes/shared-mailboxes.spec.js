(function() {
  'use strict';

  /* global chai: false, sinon: false, jmap: false */
  var expect = chai.expect;

  describe('The inboxSharedMailboxesService service', function() {

    var $rootScope, inboxSharedMailboxesService, inboxConfigMock, INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY, configHiddenSharedCalls, esnUserConfigurationServiceMock;

    beforeEach(module('linagora.esn.unifiedinbox'));
    beforeEach(module(function($provide) {
      inboxConfigMock = {};
      configHiddenSharedCalls = 0;
      $provide.value('inboxConfig', function(key, defaultValue) {
        if (key === INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY) {
          configHiddenSharedCalls++;
        }

        return $q.when(angular.isDefined(inboxConfigMock[key]) ? inboxConfigMock[key] : defaultValue);
      });

      esnUserConfigurationServiceMock = { set: sinon.spy() };
      $provide.value('esnUserConfigurationService', esnUserConfigurationServiceMock);
    }));

    beforeEach(inject(function(_$rootScope_, _inboxSharedMailboxesService_, _INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY_) {
      $rootScope = _$rootScope_;
      inboxSharedMailboxesService = _inboxSharedMailboxesService_;
      INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY = _INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY_;
    }));

    describe('The isSharedMailbox function', function() {

      it('should return false when mailbox is undefined', function() {
        var unassignedMailbox;

        expect(inboxSharedMailboxesService.isShared(unassignedMailbox)).to.equal(false);
      });

      it('should return false for system mailboxes', function() {
        var systemMailbox = new jmap.Mailbox({}, 'id_outbox', 'name_outbox', { role: 'outbox' });

        expect(inboxSharedMailboxesService.isShared(systemMailbox)).to.equal(false);
      });

      it('should return true when mailbox is shared', function() {
        var sharedMailbox = new jmap.Mailbox({}, 'id_shared', 'shared_mailbox', { namespace: { type: 'dElEgAtEd'} });

        expect(inboxSharedMailboxesService.isShared(sharedMailbox)).to.equal(true);
      });

    });

    describe('The getHiddenMaiboxesConfig function', function() {

      it('should get config through inboxConfig', function(done) {
        var fakeHiddenConfig = { 1: true };

        inboxConfigMock[INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY] = fakeHiddenConfig;
        inboxSharedMailboxesService.getHiddenMaiboxesConfig()
          .then(function(config) {
            expect(config).to.deep.equal(fakeHiddenConfig);
            done();
          });
        $rootScope.$digest();
      });

      it('should delegate only once when called twice', function(done) {
        inboxSharedMailboxesService.getHiddenMaiboxesConfig()
          .then(inboxSharedMailboxesService.getHiddenMaiboxesConfig())
          .then(function() {
            expect(configHiddenSharedCalls).to.equal(1);
            done();
          });
        $rootScope.$digest();
      });
    });

    describe('The hideNewMailboxes function', function() {

      it('should reject when no mailbox has been provided', function(done) {
        var undefinedMailboxes;

        inboxSharedMailboxesService.hideNewMailboxes(undefinedMailboxes)
          .then(function() { throw new Error('was not supposed to succeed !'); })
          .catch(function(m) {
            expect(m).to.have.string('no mailboxes provided');
            done();
          });
        $rootScope.$digest();
      });

      it('should resolve with empty promise when provided mailboxes is empty or missing ids', function(done) {
        inboxSharedMailboxesService.hideNewMailboxes([{ name: 'INBOX' }, { name: 'OUTBOX' }])
          .then(function(result) {
            expect(result).to.be.empty;
            done();
          });
        $rootScope.$digest();
      });

      it('should save new config through esnUserConfigurationService when non-empty mailbox collection is provided', function(done) {
        inboxSharedMailboxesService.hideNewMailboxes([{ id: '#1', name: 'Shared #1', isSharedAndHidden: true }, { id: '#2', name: 'Shared #2', isSharedAndHidden: true }])
          .then(function() {
            expect(esnUserConfigurationServiceMock.set).to.have.been.calledOnce;
            expect(esnUserConfigurationServiceMock.set).to.have.been.calledWith([{
              name: INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY, value: { '#1': true, '#2': true }
            }]);
            done();
          });
        $rootScope.$digest();
      });

      it('should save new merged mailbox ids when mailboxes includes existing ids', function(done) {
        inboxConfigMock[INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY] = { '#2': true };
        inboxSharedMailboxesService.hideNewMailboxes([{ id: '#1', name: 'Shared #1', isSharedAndHidden: true }, { id: '#2', name: 'Shared #2', isSharedAndHidden: true }, { id: '#3', name: 'Shared #3', isSharedAndHidden: true }])
          .then(function() {
            expect(esnUserConfigurationServiceMock.set).to.have.been.calledOnce;
            expect(esnUserConfigurationServiceMock.set).to.have.been.calledWith([{
              name: INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY, value: { '#1': true, '#2': true, '#3': true }
            }]);
            done();
          });
        $rootScope.$digest();
      });

      it('should merge old hidden mailboxes list with provided list', function(done) {
        inboxConfigMock[INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY] = { '#2': true };
        inboxSharedMailboxesService.hideNewMailboxes([{ id: '#1', name: 'Shared #1', isSharedAndHidden: true }, { id: '#3', name: 'Shared #3', isSharedAndHidden: true }])
          .then(function() {
            expect(esnUserConfigurationServiceMock.set).to.have.been.calledOnce;
            expect(esnUserConfigurationServiceMock.set).to.have.been.calledWith([{
              name: INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY, value: { '#1': true, '#2': true, '#3': true }
            }]);
            done();
          });
        $rootScope.$digest();
      });

      it('should only consider Truthy values in config objects', function(done) {
        inboxConfigMock[INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY] = { '#2': false };
        inboxSharedMailboxesService.hideNewMailboxes([{ id: '#1', name: 'Shared #1', isSharedAndHidden: true }, { id: '#3', name: 'Shared #3', isSharedAndHidden: true }])
          .then(function() {
            expect(esnUserConfigurationServiceMock.set).to.have.been.calledOnce;
            expect(esnUserConfigurationServiceMock.set).to.have.been.calledWith([{
              name: INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY, value: { '#1': true, '#3': true }
            }]);
            done();
          });
        $rootScope.$digest();
      });

    });

    describe('The setHiddenMailboxes function', function() {

      it('should reject when no mailbox has been provided', function(done) {
        var undefinedMailboxes;

        inboxSharedMailboxesService.setHiddenMailboxes(undefinedMailboxes)
          .then(function() { throw new Error('was not supposed to succeed !'); })
          .catch(function(m) {
            expect(m).to.have.string('no mailboxes provided');
            done();
          });
        $rootScope.$digest();
      });

      it('should resolve with empty promise when provided mailboxes is empty or missing ids', function(done) {
        inboxSharedMailboxesService.setHiddenMailboxes([{ name: 'INBOX' }, { name: 'OUTBOX' }])
          .then(function(result) {
            expect(result).to.be.empty;
            done();
          });
        $rootScope.$digest();
      });

      it('should save new config through esnUserConfigurationService when non-empty mailbox collection is provided', function(done) {
        inboxSharedMailboxesService.setHiddenMailboxes([{ id: '#1', name: 'Shared #1', isSharedAndHidden: true }, { id: '#2', name: 'Shared #2', isSharedAndHidden: true }])
          .then(function() {
            expect(esnUserConfigurationServiceMock.set).to.have.been.calledOnce;
            expect(esnUserConfigurationServiceMock.set).to.have.been.calledWith([{
              name: INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY, value: { '#1': true, '#2': true }
            }]);
            done();
          });
        $rootScope.$digest();
      });

      it('should only store provided hidden mailboxes list, overriding current list', function(done) {
        inboxConfigMock[INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY] = { '#2': true };
        inboxSharedMailboxesService.setHiddenMailboxes([{ id: '#1', name: 'Shared #1', isSharedAndHidden: true }, { id: '#3', name: 'Shared #3', isSharedAndHidden: true }])
          .then(function() {
            expect(esnUserConfigurationServiceMock.set).to.have.been.calledOnce;
            expect(esnUserConfigurationServiceMock.set).to.have.been.calledWith([{
              name: INBOX_HIDDEN_SHAREDMAILBOXES_CONFIG_KEY, value: { '#1': true, '#3': true }
            }]);
            done();
          });
        $rootScope.$digest();
      });

    });

  });

})();
