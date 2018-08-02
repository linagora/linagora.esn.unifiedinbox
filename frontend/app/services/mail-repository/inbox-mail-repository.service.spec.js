'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The inboxMailRepositoryService service', function() {
  var $rootScope, $q;
  var inboxMailRepositoryService, InboxMailRepositoryEmail, jamesWebadminClient;
  var userAPI, userUtils;
  var INBOX_QUARANTINE_EMAIL_FIELDS;

  beforeEach(module('linagora.esn.unifiedinbox'));

  beforeEach(inject(function(
    _$rootScope_,
    _$q_,
    _inboxMailRepositoryService_,
    _InboxMailRepositoryEmail_,
    _jamesWebadminClient_,
    _userAPI_,
    _userUtils_,
    _INBOX_QUARANTINE_EMAIL_FIELDS_
  ) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    inboxMailRepositoryService = _inboxMailRepositoryService_;
    InboxMailRepositoryEmail = _InboxMailRepositoryEmail_;
    jamesWebadminClient = _jamesWebadminClient_;
    userAPI = _userAPI_;
    userUtils = _userUtils_;
    INBOX_QUARANTINE_EMAIL_FIELDS = _INBOX_QUARANTINE_EMAIL_FIELDS_;

    userAPI.getUsersByEmail = function() {
      return $q.when([{
        _id: 'user1'
      }]);
    };
    userUtils.displayNameOf = function() {
      return 'User 1';
    };
  }));

  describe('The list function', function() {
    it('should get the mailkeys from quarantine email repository then populate email sender details', function(done) {
      var emailKeys = ['email-key-1', 'email-key-2'];
      var mailSample = {
        sender: 'user1@op.co',
        recipients: []
      };

      jamesWebadminClient.listMailsInMailRepository = sinon.stub().returns($q.when(emailKeys));
      jamesWebadminClient.getMailInMailRepository = sinon.stub().returns($q.when(mailSample));

      inboxMailRepositoryService.list('mail/repository').then(function(results) {
        expect(jamesWebadminClient.listMailsInMailRepository).to.have.been.calledOnce;
        expect(jamesWebadminClient.listMailsInMailRepository).to.have.been.calledWith('mail/repository');
        expect(jamesWebadminClient.getMailInMailRepository).to.have.been.calledTwice;
        expect(jamesWebadminClient.getMailInMailRepository).to.have.been.calledWith('mail/repository', emailKeys[0], {
          additionalFields: INBOX_QUARANTINE_EMAIL_FIELDS
        });
        expect(jamesWebadminClient.getMailInMailRepository).to.have.been.calledWith('mail/repository', emailKeys[1], {
          additionalFields: INBOX_QUARANTINE_EMAIL_FIELDS
        });
        expect(results[0]).to.be.an.instanceof(InboxMailRepositoryEmail);
        expect(results[1]).to.be.an.instanceof(InboxMailRepositoryEmail);
        expect(results[0].sender.name).to.equal('User 1');
        expect(results[1].sender.name).to.equal('User 1');

        done();
      });

      $rootScope.$digest();
    });
  });

  describe('The downloadEmlFile function', function() {
    it('should call downloadEmlFileFromMailRepository with quarantine email repository', function() {
      jamesWebadminClient.downloadEmlFileFromMailRepository = sinon.spy();

      inboxMailRepositoryService.downloadEmlFile('mail/repository', 'email-key');

      expect(jamesWebadminClient.downloadEmlFileFromMailRepository).to.have.been.calledWith('mail/repository', 'email-key');
    });
  });
});
