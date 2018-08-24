'use strict';

const request = require('supertest');
const expect = require('chai').expect;

describe('The forwarding creation API', function() {
  const API_PATH = '/api/inbox/forwardings';
  const password = 'secret';
  let helpers, models, user, app, user1, domain, userDomain2;

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
      user1 = models.users[1];
      domain = models.domain;

      done();
    });

  });

  afterEach(function(done) {
    helpers.requireBackend('core/esn-config')('forwarding').inModule('linagora.esn.unifiedinbox').store(false).then(() => helpers.api.cleanDomainDeployment(models, done));
  });

  describe('GET /forwardings', function() {
    it('should return 401 if not logged in', function(done) {
      request(app)
        .get(API_PATH)
        .expect(401)
        .end(done);
    });
  });

  describe('GET /api/inbox/forwardings/users/:uuid', function() {
    it('should return 401 if not logged in', function(done) {
      request(app)
        .get(API_PATH + '/users/' + user._id + '?domain_id=' + domain._id)
        .expect(401)
        .end(done);
    });

    it('should return 403 if the request user is not domain admin', function(done) {
      helpers.requireBackend('core/esn-config')('forwarding').inModule('linagora.esn.unifiedinbox')
        .store(true, helpers.callbacks.noErrorAnd(() => {
          helpers.api.loginAsUser(app, user1.emails[0], password, (err, requestAsMember) => {
            expect(err).to.not.exist;
            const req = requestAsMember(request(app).get(API_PATH + '/users/' + user._id + '?domain_id=' + domain._id));

            req.send({ forwarding: 'user22@lng.net' });
            req.expect(403);
            req.end((err, res) => {
              expect(err).to.not.exist;
              expect(res.body.error.details).to.equal('User is not the domain manager');

              done();
            });
          });
        }));
    });

    it('should return 403 if domain admin gets forwarding for not domain member', function(done) {
      helpers.requireBackend('core/esn-config')('forwarding').inModule('linagora.esn.unifiedinbox')
        .store(true, helpers.callbacks.noErrorAnd(() => {
          helpers.api.applyDomainDeployment('openAndPrivateCommunities', function(err, deployedModels2) {
            if (err) {
              return done(err);
            }
            expect(err).to.not.exist;
            userDomain2 = deployedModels2.users[2];

            helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
              expect(err).to.not.exist;
              const req = requestAsMember(request(app).get(API_PATH + '/users/' + userDomain2._id + '?domain_id=' + domain._id));

              req.send({ forwarding: user1.emails[0] });
              req.expect(403);
              req.end((err, res) => {
                expect(err).to.not.exist;
                expect(res.body.details).to.equal('User does not belongs to the domain');

                done();
              });
            });
          });
        }));
    });
  });
});
