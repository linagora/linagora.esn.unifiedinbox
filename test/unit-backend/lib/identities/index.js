const { expect } = require('chai');
const mokery = require('mockery');

describe('The identities module', function() {
  let InboxUserIdentities, i18nModuleMock, userModuleMock;
  let getModule, moduleHelpers;

  beforeEach(function() {
    moduleHelpers = this.moduleHelpers;
    InboxUserIdentities = {
      findOne: () => {},
      findOneAndUpdate: () => {}
    };

    moduleHelpers.addDep('db', {
      mongo: {
        mongoose: {
          model: () => InboxUserIdentities
        }
      }
    });
    moduleHelpers.addDep('i18n', i18nModuleMock);
    moduleHelpers.addDep('user', userModuleMock);

    mokery.registerMock('./validators', () => {});
    mokery.registerMock('./rights', () => {});
    mokery.registerMock('./fallback', () => ({
      getDefaultIdentity: () => Promise.resolve()
    }));

    getModule = () => require(`${moduleHelpers.backendPath}/lib/identities`)(moduleHelpers.dependencies);
  });

  describe('The getValidEmails function', () => {
    it('should resolve with a list of user emails', function(done) {
      const user = {
        emails: ['foo@bar', 'bar@foo']
      };

      getModule().getValidEmails(user)
        .then(emails => {
          expect(emails).to.equal(user.emails);
          done();
        })
        .catch(done);
    });
  });
});
