const request = require('supertest');
const express = require('express');
const { expect } = require('chai');

describe('The user identity valid emails getting API', function() {
  const API_PATH = '/api/inbox/users';
  const password = 'secret';
  let helpers, models, app, user1, port, james;
  let alias, allowedFromHeaders;

  before(function(done) {
    helpers = this.helpers;
    helpers.modules.initMidway('linagora.esn.unifiedinbox', helpers.callbacks.noErrorAnd(done));
  });

  before(function(done) {
    allowedFromHeaders = ['foo@lng.com', 'bar@lng.com'];
    alias = 'alias@kng.org';

    const app = express();

    port = this.testEnv.serversConfig.express.port;

    app.get('/address/aliases/:username', (req, res) => res.status(200).json([{ source: alias }]));
    app.get('/users/:givenUser/allowedFromHeaders', (req, res) => res.status(200).json(allowedFromHeaders));
    james = app.listen(port, error => {
      if (error) return done(error);

      helpers.requireBackend('core/esn-config')('webadminApiBackend')
        .inModule('linagora.esn.james')
        .store(`http://localhost:${port}`)
        .then(() => helpers.jwt.saveTestConfiguration(done))
        .catch(done);
    });
  });

  beforeEach(function() {
    const inboxApp = require('../../../backend/webserver/application')(helpers.modules.current.deps);

    app = helpers.modules.getWebServer(inboxApp);
  });

  beforeEach(function(done) {
    helpers.api.applyDomainDeployment('linagora_test_domain', (err, deployedModels) => {
      if (err) return done(err);

      models = deployedModels;
      user1 = models.users[1];

      done();
    });

  });

  afterEach(function(done) {
    helpers.api.cleanDomainDeployment(models, done);
  });

  after(function(done) {
    james.close(() => done());
  });

  it('should return 401 if not logged in', function(done) {
    request(app)
      .get(`${API_PATH}/123123/identities/validEmails`)
      .expect(401)
      .end(done);
  });

  it('should return 404 if uuid is invalid', function(done) {
    helpers.api.loginAsUser(app, user1.emails[0], password, (err, requestAsMember) => {
      if (err) return done(err);

      const req = requestAsMember(request(app).get(`${API_PATH}/invaliduuid/identities/validEmails`));

      req.expect(404);
      req.end(done);
    });
  });

  it('should return 404 if target user not found by uuid', function(done) {
    helpers.api.loginAsUser(app, user1.emails[0], password, (err, requestAsMember) => {
      if (err) return done(err);

      const req = requestAsMember(request(app).get(`${API_PATH}/999999999999999999999999/identities/validEmails`));

      req.expect(404);
      req.end(done);
    });
  });

  describe('when identity email sources do not accept domain aliases', function() {
    beforeEach(function(done) {
      helpers.requireBackend('core/esn-config')('features')
        .inModule('linagora.esn.unifiedinbox')
        .forUser(user1)
        .store({ identity: { acceptDomainAliasesAsEmailSource: false } })
        .then(() => done())
        .catch(done);
    });

    afterEach(function(done) {
      helpers.requireBackend('core/esn-config')('features')
        .inModule('linagora.esn.unifiedinbox')
        .forUser(user1)
        .store({ identity: {} })
        .then(() => done())
        .catch(done);
    });

    it('should return 200 with a list of valid emails for user identity', function(done) {
      helpers.api.loginAsUser(app, user1.emails[0], password, (err, requestAsMember) => {
        if (err) return done(err);

        const req = requestAsMember(request(app).get(`${API_PATH}/${user1._id}/identities/validEmails`));

        req.expect(200);
        req.end((error, res) => {
          if (error) return done(error);

          expect(res.body).to.shallowDeepEqual([user1.preferredEmail, alias]);
          done();
        });
      });
    });
  });

  describe('when identity email sources accept domain aliases', function() {
    beforeEach(function(done) {
      helpers.requireBackend('core/esn-config')('features')
        .inModule('linagora.esn.unifiedinbox')
        .forUser(user1)
        .store({ identity: { acceptDomainAliasesAsEmailSource: true } })
        .then(() => done())
        .catch(done);
    });

    afterEach(function(done) {
      helpers.requireBackend('core/esn-config')('features')
        .inModule('linagora.esn.unifiedinbox')
        .forUser(user1)
        .store({ identity: {} })
        .then(() => done())
        .catch(done);
    });

    it('should return 200 with a list of valid emails for user identity', function(done) {
      helpers.api.loginAsUser(app, user1.emails[0], password, (err, requestAsMember) => {
        if (err) return done(err);

        const req = requestAsMember(request(app).get(`${API_PATH}/${user1._id}/identities/validEmails`));

        req.expect(200);
        req.end((error, res) => {
          if (error) return done(error);

          expect(res.body).to.shallowDeepEqual(allowedFromHeaders);
          done();
        });
      });
    });
  });
});
