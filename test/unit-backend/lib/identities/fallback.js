const sinon = require('sinon');
const { expect } = require('chai');
const mokery = require('mockery');

describe('The identities module', function() {
  let esnConfigModuleMock, i18nModuleMock, userModuleMock;
  let getModule, moduleHelpers, user, displayName, uuid;
  let esnConfigInModuleMock, esnConfigForUserMock, esnConfigGetMock;

  beforeEach(function() {
    moduleHelpers = this.moduleHelpers;

    esnConfigGetMock = sinon.stub().returns(Promise.resolve());
    esnConfigForUserMock = sinon.stub().returns({
      get: esnConfigGetMock
    });
    esnConfigInModuleMock = sinon.stub().returns({
      forUser: esnConfigForUserMock
    });
    esnConfigModuleMock = sinon.stub().returns({
      inModule: esnConfigInModuleMock
    });

    i18nModuleMock = {
      __: sinon.spy(({ phrase }) => phrase)
    };
    displayName = 'foo bar';
    userModuleMock = {
      getDisplayName: sinon.stub().returns(displayName)
    };
    user = {
      _id: 'userId',
      preferredEmail: 'foo@lng.org'
    };

    moduleHelpers.addDep('esn-config', esnConfigModuleMock);
    moduleHelpers.addDep('i18n', i18nModuleMock);
    moduleHelpers.addDep('user', userModuleMock);

    uuid = 'uuid';

    mokery.registerMock('uuid/v4', () => uuid);

    getModule = () => require(`${moduleHelpers.backendPath}/lib/identities/fallback`)(moduleHelpers.dependencies);
  });

  describe('The getDefaultIdentity method', function() {
    it('should reject if failed to get default identity from user configuration', function(done) {
      esnConfigGetMock.onSecondCall().returns(Promise.reject(new Error('something wrong')));

      getModule().getDefaultIdentity(user)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(esnConfigModuleMock).to.have.been.calledTwice;
          expect(esnConfigModuleMock.secondCall.calledWith('identities.default')).to.be.true;

          expect(esnConfigInModuleMock).to.have.been.calledTwice;
          expect(esnConfigInModuleMock.secondCall.calledWith('linagora.esn.unifiedinbox')).to.be.true;

          expect(esnConfigForUserMock).to.have.been.calledTwice;
          expect(esnConfigForUserMock.secondCall.calledWith(user, true)).to.be.true;

          expect(esnConfigGetMock).to.have.been.calledTwice;
          expect(err.message).to.equal('something wrong');

          done();
        });
    });

    it('should resolve with default identity if failed to get user locale', function(done) {
      esnConfigGetMock.onFirstCall().returns(Promise.reject(new Error('something wrong')));

      getModule().getDefaultIdentity(user)
        .then(defaultIdentity => {
          expect(esnConfigModuleMock).to.have.been.calledTwice;
          expect(esnConfigModuleMock.firstCall.calledWith('language')).to.be.true;
          expect(esnConfigModuleMock.secondCall.calledWith('identities.default')).to.be.true;

          expect(esnConfigInModuleMock).to.have.been.calledTwice;
          expect(esnConfigInModuleMock.firstCall.calledWith('core')).to.be.true;
          expect(esnConfigInModuleMock.secondCall.calledWith('linagora.esn.unifiedinbox')).to.be.true;

          expect(esnConfigForUserMock).to.have.been.calledTwice;
          expect(esnConfigForUserMock.firstCall.calledWith(user, true)).to.be.true;
          expect(esnConfigForUserMock.secondCall.calledWith(user, true)).to.be.true;

          expect(esnConfigGetMock).to.have.been.calledTwice;
          expect(userModuleMock.getDisplayName).to.have.been.calledWith(user);
          expect(i18nModuleMock.__).to.have.been.calledWith({ locale: 'en', phrase: 'My default identity' });

          expect(defaultIdentity).to.deep.equal({
            uuid,
            default: true,
            name: displayName,
            email: user.preferredEmail,
            replyTo: user.preferredEmail,
            description: 'My default identity',
            htmlSignature: '',
            textSignature: ''
          });

          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });

    it('should resolve with default identity if success to get user locale', function(done) {
      const userLocale = 'vi';

      esnConfigGetMock.onFirstCall().returns(Promise.resolve(userLocale));

      getModule().getDefaultIdentity(user)
        .then(defaultIdentity => {
          expect(esnConfigModuleMock).to.have.been.calledTwice;
          expect(esnConfigModuleMock.firstCall.calledWith('language')).to.be.true;
          expect(esnConfigModuleMock.secondCall.calledWith('identities.default')).to.be.true;

          expect(esnConfigInModuleMock).to.have.been.calledTwice;
          expect(esnConfigInModuleMock.firstCall.calledWith('core')).to.be.true;
          expect(esnConfigInModuleMock.secondCall.calledWith('linagora.esn.unifiedinbox')).to.be.true;

          expect(esnConfigForUserMock).to.have.been.calledTwice;
          expect(esnConfigForUserMock.firstCall.calledWith(user, true)).to.be.true;
          expect(esnConfigForUserMock.secondCall.calledWith(user, true)).to.be.true;

          expect(esnConfigGetMock).to.have.been.calledTwice;
          expect(userModuleMock.getDisplayName).to.have.been.calledWith(user);
          expect(i18nModuleMock.__).to.have.been.calledWith({ locale: userLocale, phrase: 'My default identity' });

          expect(defaultIdentity).to.deep.equal({
            uuid,
            default: true,
            name: displayName,
            email: user.preferredEmail,
            replyTo: user.preferredEmail,
            description: 'My default identity',
            htmlSignature: '',
            textSignature: ''
          });

          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });

    it('should resolve with default identity if user already configured his signatures for default identity in esn configuration', function(done) {
      const signatures = {
        htmlSignature: 'html signature',
        textSignature: 'text signature'
      };

      esnConfigGetMock.onSecondCall().returns(Promise.resolve(signatures));

      getModule().getDefaultIdentity(user)
        .then(defaultIdentity => {
          expect(esnConfigModuleMock).to.have.been.calledTwice;
          expect(esnConfigModuleMock.firstCall.calledWith('language')).to.be.true;
          expect(esnConfigModuleMock.secondCall.calledWith('identities.default')).to.be.true;

          expect(esnConfigInModuleMock).to.have.been.calledTwice;
          expect(esnConfigInModuleMock.firstCall.calledWith('core')).to.be.true;
          expect(esnConfigInModuleMock.secondCall.calledWith('linagora.esn.unifiedinbox')).to.be.true;

          expect(esnConfigForUserMock).to.have.been.calledTwice;
          expect(esnConfigForUserMock.firstCall.calledWith(user, true)).to.be.true;
          expect(esnConfigForUserMock.secondCall.calledWith(user, true)).to.be.true;

          expect(esnConfigGetMock).to.have.been.calledTwice;
          expect(userModuleMock.getDisplayName).to.have.been.calledWith(user);
          expect(i18nModuleMock.__).to.have.been.calledWith({ locale: 'en', phrase: 'My default identity' });

          expect(defaultIdentity).to.deep.equal({
            uuid,
            default: true,
            name: displayName,
            email: user.preferredEmail,
            replyTo: user.preferredEmail,
            description: 'My default identity',
            htmlSignature: signatures.htmlSignature,
            textSignature: signatures.textSignature
          });

          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });
  });
});
