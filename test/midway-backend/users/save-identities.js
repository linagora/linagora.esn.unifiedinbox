const request = require('supertest');
const express = require('express');
const { expect } = require('chai');

describe('The user identities saving API', function() {
  const API_PATH = '/api/inbox/users';
  const password = 'secret';
  let helpers, models, admin, app, user1, user2, identites, james, port;

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

      models = deployedModels;
      admin = models.users[0];
      user1 = models.users[1];
      user2 = models.users[2];
      identites = [{
        default: true,
        name: 'User 1 Identity 1',
        email: user1.emails[0],
        replyTo: user1.emails[0],
        description: 'Identity 1'
      }, {
        default: false,
        name: 'User 1 Identity 2',
        email: user1.emails[0],
        replyTo: user1.emails[0],
        description: 'Identity 2'
      }];

      done();
    });
  });

  before(function(done) {
    const app = express();

    port = this.testEnv.serversConfig.express.port;

    app.get('/address/aliases/:username', (req, res) => res.status(200).json([]));
    james = app.listen(port, error => {
      if (error) return done(error);

      helpers.requireBackend('core/esn-config')('webadminApiBackend')
        .inModule('linagora.esn.james')
        .store(`http://localhost:${port}`)
        .then(() => helpers.jwt.saveTestConfiguration(done))
        .catch(done);
    });
  });

  after(function(done) {
    james.close(() => done());
  });

  afterEach(function(done) {
    helpers.api.cleanDomainDeployment(models, done);
  });

  it('should return 401 if not logged in', function(done) {
    request(app)
      .put(`${API_PATH}/123123/identities`)
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

      const req = requestAsMember(request(app).put(`${API_PATH}/999999999999999999999999/identities`));

      req.expect(404);
      req.end(done);
    });
  });

  it('should return 403 if request user is neither the target user or a domain administrator', function(done) {
    helpers.api.loginAsUser(app, user2.emails[0], password, (err, requestAsMember) => {
      if (err) return done(err);

      const req = requestAsMember(request(app).put(`${API_PATH}/${user1.id}/identities`));

      req.send(identites);
      req.expect(403);
      req.end((err, res) => {
        if (err) return done(err);

        expect(res.body.error.details).to.match(/You are not allow to update identities for user/);
        done();
      });
    });
  });

  describe('Identities validation', () => {
    let assert400ResponseWithError;

    beforeEach(function() {
      assert400ResponseWithError = (identites, errorDetails, done) => {
        helpers.api.loginAsUser(app, admin.emails[0], password, (err, requestAsMember) => {
          if (err) return done(err);

          const req = requestAsMember(request(app).put(`${API_PATH}/${user1.id}/identities`));

          req.send(identites);
          req.expect(400);
          req.end((err, res) => {
            if (err) return done(err);

            expect(res.body.error.details).to.equal(errorDetails);
            done();
          });
        });
      };
    });

    it('should return 400 if request body is not an array', function(done) {
      assert400ResponseWithError({}, 'should be array', done);
    });

    it('should return 400 if request body is empty', function(done) {
      assert400ResponseWithError([], 'should NOT have less than 1 items', done);
    });

    it('should return 400 if identity default property is not boolean', function(done) {
      identites[0].default = 'true';

      assert400ResponseWithError(identites, '[0].default: should be boolean', done);
    });

    it('should return 400 if there is no description', function(done) {
      delete identites[0].description;

      assert400ResponseWithError(identites, '[0]: should have required property \'description\'', done);
    });

    it('should return 400 if description is empty', function(done) {
      identites[0].description = '';

      assert400ResponseWithError(identites, '[0].description: should NOT be shorter than 1 characters', done);
    });

    it('should return 400 if description is not string', function(done) {
      identites[0].description = {};

      assert400ResponseWithError(identites, '[0].description: should be string', done);
    });

    it('should return 400 if there is no name', function(done) {
      delete identites[0].name;

      assert400ResponseWithError(identites, '[0]: should have required property \'name\'', done);
    });

    it('should return 400 if name is empty', function(done) {
      identites[0].name = '';

      assert400ResponseWithError(identites, '[0].name: should NOT be shorter than 1 characters', done);
    });

    it('should return 400 if name is not string', function(done) {
      identites[0].name = {};

      assert400ResponseWithError(identites, '[0].name: should be string', done);
    });

    it('should return 400 if there is no email', function(done) {
      delete identites[0].email;

      assert400ResponseWithError(identites, '[0]: should have required property \'email\'', done);
    });

    it('should return 400 if email is not email formatted', function(done) {
      identites[0].email = '!#@$%$%';

      assert400ResponseWithError(identites, '[0].email: should match format "email"', done);
    });

    it('should return 400 if replyTo is not email formatted', function(done) {
      identites[0].replyTo = '!#@$%$%';

      assert400ResponseWithError(identites, '[0].replyTo: should match format "email"', done);
    });

    it('should return 400 if htmlSignature is not string', function(done) {
      identites[0].htmlSignature = 123123;

      assert400ResponseWithError(identites, '[0].htmlSignature: should be string', done);
    });

    it('should return 400 if textSignature is not string', function(done) {
      identites[0].textSignature = 123123;

      assert400ResponseWithError(identites, '[0].textSignature: should be string', done);
    });

    it('should return 400 if there is more than 1 default identity', function(done) {
      identites[1].default = true;

      assert400ResponseWithError(identites, 'There must be 1 default identity', done);
    });

    it('should return 400 if there is no default identity', function(done) {
      identites[0].default = false;

      assert400ResponseWithError(identites, 'There must be 1 default identity', done);
    });

    it('should return 400 if there are duplicated identity uuids', function(done) {
      identites[0].uuid = 'not-so-unique-id';
      identites[1].uuid = 'not-so-unique-id';

      assert400ResponseWithError(identites, 'Identity UUIDs must either unique or null', done);
    });
  });

  describe('As normal user while identities management is disabled', () => {
    beforeEach(function(done) {
      helpers.requireBackend('core/esn-config')('features')
        .inModule('linagora.esn.unifiedinbox')
        .forUser(admin)
        .store({ allowMembersToManageIdentities: false })
        .then(() => done())
        .catch(done);
    });

    it('should return 403', function(done) {
      helpers.api.loginAsUser(app, user1.emails[0], password, (err, requestAsMember) => {
        if (err) return done(err);

        const req = requestAsMember(request(app).put(`${API_PATH}/${user1.id}/identities`));

        req.send(identites);
        req.expect(403);
        req.end((err, res) => {
          if (err) return done(err);

          expect(res.body.error.details).to.match(/You are not allow to update identities for user/);
          done();
        });
      });
    });
  });

  describe('As normal user while identities management is enabled', () => {
    beforeEach(function(done) {
      helpers.requireBackend('core/esn-config')('features')
        .inModule('linagora.esn.unifiedinbox')
        .forUser(admin)
        .store({ allowMembersToManageIdentities: true })
        .then(() => done())
        .catch(done);
    });

    it('should return 200 with updated identities', function(done) {
      helpers.api.loginAsUser(app, user1.emails[0], password, (err, requestAsMember) => {
        if (err) return done(err);

        const req = requestAsMember(request(app).put(`${API_PATH}/${user1.id}/identities`));

        req.send(identites);
        req.expect(200);
        req.end((err, res) => {
          if (err) return done(err);

          expect(res.body).to.shallowDeepEqual(identites);
          done();
        });
      });
    });
  });

  describe('As domain administrator', () => {
    it('should return 200 with updated identities even if the feature is disabled', function(done) {
      helpers.requireBackend('core/esn-config')('features')
        .inModule('linagora.esn.unifiedinbox')
        .forUser(admin)
        .store({ allowMembersToManageIdentities: false })
        .then(() => helpers.api.loginAsUser(app, admin.emails[0], password, (err, requestAsAdmin) => {
          if (err) return done(err);

          const req = requestAsAdmin(request(app).put(`${API_PATH}/${user1.id}/identities`));

          req.send(identites);
          req.expect(200);
          req.end((err, res) => {
            if (err) return done(err);

            expect(res.body).to.shallowDeepEqual(identites);
            done();
          });
        }))
        .catch(done);
    });

    it('should return 200 with updated identities', function(done) {
      helpers.api.loginAsUser(app, admin.emails[0], password, (err, requestAsAdmin) => {
        if (err) return done(err);

        const req = requestAsAdmin(request(app).put(`${API_PATH}/${user1.id}/identities`));

        req.send(identites);
        req.expect(200);
        req.end((err, res) => {
          if (err) return done(err);

          expect(res.body).to.shallowDeepEqual(identites);
          done();
        });
      });
    });

    it('should return 200 with updated identities with their usability', function(done) {
      identites[1].email = 'radom@email';

      helpers.api.loginAsUser(app, admin.emails[0], password, (err, requestAsAdmin) => {
        if (err) return done(err);

        const req = requestAsAdmin(request(app).put(`${API_PATH}/${user1.id}/identities`));

        req.send(identites);
        req.expect(200);
        req.end((err, res) => {
          if (err) return done(err);

          expect(res.body).to.shallowDeepEqual(identites);
          expect(res.body[0].usable).to.be.true;
          expect(res.body[1].usable).to.be.false;
          expect(res.body[1].error.email).to.be.true;
          done();
        });
      });
    });
  });
});
