const request = require('supertest');
const { expect } = require('chai');

describe('The user identities getting API', function() {
  const API_PATH = '/api/inbox/users';
  const password = 'secret';
  let helpers, models, admin, app, user1, user2, lib;

  before(function(done) {
    helpers = this.helpers;
    helpers.modules.initMidway('linagora.esn.unifiedinbox', helpers.callbacks.noErrorAnd(done));
  });

  beforeEach(function() {
    const inboxApp = require('../../../backend/webserver/application')(helpers.modules.current.deps);

    app = helpers.modules.getWebServer(inboxApp);
  });

  beforeEach(function(done) {
    helpers.api.applyDomainDeployment('linagora_test_domain', (err, deployedModels) => {
      if (err) return done(err);

      lib = helpers.modules.current.lib.lib;
      models = deployedModels;
      admin = models.users[0];
      user1 = models.users[1];
      user2 = models.users[2];

      done();
    });

  });

  afterEach(function(done) {
    helpers.api.cleanDomainDeployment(models, done);
  });

  it('should return 401 if not logged in', function(done) {
    request(app)
      .get(`${API_PATH}/123123/identities`)
      .expect(401)
      .end(done);
  });

  it('should return 404 if uuid is invalid', function(done) {
    helpers.api.loginAsUser(app, user1.emails[0], password, (err, requestAsMember) => {
      if (err) return done(err);

      const req = requestAsMember(request(app).get(`${API_PATH}/invaliduuid/identities`));

      req.expect(404);
      req.end(done);
    });
  });

  it('should return 404 if target user not found by uuid', function(done) {
    helpers.api.loginAsUser(app, user1.emails[0], password, (err, requestAsMember) => {
      if (err) return done(err);

      const req = requestAsMember(request(app).get(`${API_PATH}/999999999999999999999999/identities`));

      req.expect(404);
      req.end(done);
    });
  });

  it('should return 403 if request user is neither the target user or a domain administrator', function(done) {
    helpers.api.loginAsUser(app, user1.emails[0], password, (err, requestAsMember) => {
      if (err) return done(err);

      const req = requestAsMember(request(app).get(`${API_PATH}/${user2.id}/identities`));

      req.expect(403);
      req.end((err, res) => {
        if (err) return done(err);

        expect(res.body.error.details).to.match(/You are not allow to get identities for user/);
        done();
      });
    });
  });

  describe('As domain administrator', () => {
    it('should return 200 with default identity of target user if no stored identites found', function(done) {
      helpers.api.loginAsUser(app, admin.emails[0], password, (err, requestAsMember) => {
        if (err) return done(err);

        const req = requestAsMember(request(app).get(`${API_PATH}/${user1.id}/identities`));

        req.expect(200);
        req.end((err, res) => {
          if (err) return done(err);

          const identities = res.body;

          expect(identities).to.have.lengthOf(1);
          expect(identities[0].email).to.equal(user1.emails[0]);
          done();
        });
      });
    });

    it('should return 200 with user identities', function(done) {
      const identites = [{
        default: true,
        name: 'Larry Skywalker',
        email: 'lskywalker@open-paas.org',
        description: 'Identity'
      }];

      lib.identities.update(user1.id, identites).then(() => {
        helpers.api.loginAsUser(app, admin.emails[0], password, (err, requestAsMember) => {
          if (err) return done(err);

          const req = requestAsMember(request(app).get(`${API_PATH}/${user1.id}/identities`));

          req.expect(200);
          req.end((err, res) => {
            if (err) return done(err);

            const identities = res.body;

            expect(res.body).to.have.lengthOf(1);
            expect(identities[0].email).to.equal(identities[0].email);
            done();
          });
        });
      })
      .catch(done);
    });
  });

  describe('As normal user', () => {
    it('should return 200 with default identity of target user if no stored identites found', function(done) {
      helpers.api.loginAsUser(app, user1.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;
        const req = requestAsMember(request(app).get(`${API_PATH}/${user1.id}/identities`));

        req.expect(200);
        req.end((err, res) => {
          if (err) return done(err);

          const identities = res.body;

          expect(identities).to.have.lengthOf(1);
          expect(identities[0].email).to.equal(user1.emails[0]);
          done();
        });
      });
    });

    it('should return 200 with user identities', function(done) {
      const identites = [{
        default: true,
        name: 'Larry Skywalker',
        email: 'lskywalker@open-paas.org',
        description: 'Identity'
      }];

      lib.identities.update(user1.id, identites).then(() => {
        helpers.api.loginAsUser(app, user1.emails[0], password, (err, requestAsMember) => {
          expect(err).to.not.exist;
          const req = requestAsMember(request(app).get(`${API_PATH}/${user1.id}/identities`));

          req.expect(200);
          req.end((err, res) => {
            if (err) return done(err);

            const identities = res.body;

            expect(res.body).to.have.lengthOf(1);
            expect(identities[0].email).to.equal(identities[0].email);
            done();
          });
        });
      })
      .catch(done);
    });
  });
});
