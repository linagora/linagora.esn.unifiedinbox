const { expect } = require('chai');

describe('The forwarding middlewares', function() {
  let esnConfigModule;

  beforeEach(function() {
    esnConfigModule = {};

    this.moduleHelpers.addDep('esn-config', esnConfigModule);
    this.moduleHelpers.addDep('domainMW', {});
    this.moduleHelpers.addDep('authorizationMW', {});
    this.moduleHelpers.addDep('usersMW', {});

    this.loadModule = () => require(`${this.moduleHelpers.backendPath}/webserver/api/forwardings/middleware`)(this.moduleHelpers.dependencies);
  });

  describe('the validateForwardingConfigurations middleware', function() {
    beforeEach(function() {
      this.check400 = function(req, done) {
        const res = {
          status: function(status) {
            expect(status).to.equal(400);

            return {
              json: function(error) {
                expect(error).to.exist;
                done();
              }
            };
          }
        };

        this.loadModule().validateForwardingConfigurations(req, res, function() {
          done('Next should not have been called');
        });
      };
    });

    it('should send 400 if req body has no forwarding', function(done) {
      const req = {
        body: {}
      };

      this.check400(req, done);
    });

    it('should send 400 if req body has no isLocalCopyEnabled', function(done) {
      const req = {
        body: { forwarding: true }
      };

      this.check400(req, done);
    });

    it('should call next if req body has forwarding and isLocalCopyEnabled', function(done) {
      const req = {
        body: { forwarding: true, isLocalCopyEnabled: true }
      };

      this.loadModule().validateForwardingConfigurations(req, null, done);
    });
  });
});
