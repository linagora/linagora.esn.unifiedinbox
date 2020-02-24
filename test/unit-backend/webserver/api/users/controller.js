const sinon = require('sinon');
const { expect } = require('chai');
const mockery = require('mockery');

describe('The identities controller', function() {
  let identitiesLibModuleMock;
  let getModule;

  beforeEach(function() {
    identitiesLibModuleMock = {
      getValidEmails: () => [],
      get: () => {},
      update: () => {}
    };
    mockery.registerMock('../../../lib/identities', () => identitiesLibModuleMock);

    getModule = () => require(`${this.moduleHelpers.backendPath}/webserver/api/users/controller`)(this.moduleHelpers.dependencies);
  });

  describe('The getIdentities method', function() {
    let req, res, status;

    beforeEach(function() {
      status = { json: sinon.stub() };
      req = {
        targetUser: { _id: 'userId' },
        params: {}
      };
      res = {
        status: () => status
      };
    });

    it('should response success with the list of checked usable identities', function(done) {
      const identities = [{
        uuid: 'id1',
        email: 'foo@lng.org',
        replyTo: 'foo@lng.org'
      }, {
        uuid: 'id2',
        email: 'foo@lng.org',
        replyTo: 'bar@lng.org'
      }, {
        uuid: 'id3',
        email: 'bar@lng.org',
        replyTo: 'bar@lng.org'
      }];

      identities.toObject = () => identities;

      const validEmails = ['foo@lng.org'];

      identitiesLibModuleMock.get = sinon.stub().returns(Promise.resolve(identities));
      identitiesLibModuleMock.getValidEmails = sinon.stub().returns(Promise.resolve(validEmails));

      mockery.registerMock('../../../lib/identities', () => identitiesLibModuleMock);

      res = {
        status: code => {
          expect(code).to.equal(200);

          return {
            json: _identities => {
              expect(identitiesLibModuleMock.get).to.have.been.calledWith(req.targetUser);
              expect(identitiesLibModuleMock.getValidEmails).to.have.been.calledWith(req.targetUser);
              expect(_identities).to.deep.equal([{
                uuid: 'id1',
                email: 'foo@lng.org',
                replyTo: 'foo@lng.org',
                usable: true,
                error: {}
              }, {
                uuid: 'id2',
                email: 'foo@lng.org',
                replyTo: 'bar@lng.org',
                usable: false,
                error: {
                  replyTo: true
                }
              }, {
                uuid: 'id3',
                email: 'bar@lng.org',
                replyTo: 'bar@lng.org',
                usable: false,
                error: {
                  email: true,
                  replyTo: true
                }
              }]);
              done();
            }
          };
        }
      };

      getModule().getIdentities(req, res);
    });
  });
});
