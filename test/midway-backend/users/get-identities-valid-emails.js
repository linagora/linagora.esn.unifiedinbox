const request = require('supertest');

describe('The user identity valid emails getting API', function() {
  const API_PATH = '/api/inbox/users';
  const password = 'secret';
  let helpers, models, app, user1;

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
      user1 = models.users[1];

      done();
    });

  });

  afterEach(function(done) {
    helpers.api.cleanDomainDeployment(models, done);
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
});
