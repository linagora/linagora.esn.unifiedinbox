'use strict';

const request = require('supertest');
const expect = require('chai').expect;

describe('The forwarding delete API: DELETE /forwardings', function() {
  const API_PATH = '/api/inbox/forwardings';
  const password = 'secret';
  let helpers, models, user, app;

  before(function(done) {
    helpers = this.helpers;
    helpers.modules.initMidway('linagora.esn.unifiedinbox', helpers.callbacks.noErrorAnd(done));
  });

  beforeEach(function() {
    const inboxApp = require('../../backend/webserver/application')(helpers.modules.current.deps);

    app = helpers.modules.getWebServer(inboxApp);
  });

  beforeEach(function(done) {
    helpers.api.applyDomainDeployment('linagora_test_domain', (err, deployedModels) => {
      if (err) {
        return done(err);
      }

      models = deployedModels;
      user = models.users[0];

      done();
    });
  });

  afterEach(function(done) {
    helpers.requireBackend('core/esn-config')('forwarding').inModule('linagora.esn.unifiedinbox').store(false).then(() => helpers.api.cleanDomainDeployment(models, done));
  });

  it('should return 401 if not logged in', function(done) {
    request(app)
      .delete(API_PATH)
      .expect(401)
      .end(done);
  });

  it('should return 403 if forwarding is not enabled', function(done) {
    helpers.requireBackend('core/esn-config')('forwarding').inModule('linagora.esn.unifiedinbox')
      .store(false, this.helpers.callbacks.noErrorAnd(() => {
        request(app)
          .delete(API_PATH)
          .auth(user.emails[0], password)
          .expect(403)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.error.details).to.equal('You are not allowed to delete a forwarding');

            done();
          });
      }));
  });

  it('should return 400 if forwarding is not given', function(done) {
    helpers.requireBackend('core/esn-config')('forwarding').inModule('linagora.esn.unifiedinbox')
      .store(true, helpers.callbacks.noErrorAnd(() => {
        helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
          expect(err).to.not.exist;
          const req = requestAsMember(request(app).delete(API_PATH));

          req.expect(400);
          req.end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.error.details).to.equal('forwarding is required');

            done();
          });
        });
      }));
  });

  it('should return 400 if forwarding is not a valid email address', function(done) {
    helpers.requireBackend('core/esn-config')('forwarding').inModule('linagora.esn.unifiedinbox')
      .store(true, helpers.callbacks.noErrorAnd(() => {
        helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
          expect(err).to.not.exist;
          const req = requestAsMember(request(app).delete(API_PATH));

          req.send({ forwarding: 'invalid-email' });
          req.expect(400);
          req.end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.error.details).to.equal('forwarding is not a valid email address');

            done();
          });
        });
      }));
  });
});
