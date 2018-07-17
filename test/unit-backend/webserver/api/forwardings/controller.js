const sinon = require('sinon');
const { expect } = require('chai');
const mockery = require('mockery');

describe('The forwardings controller', function() {
  let jamesModule, esnConfigModule;

  beforeEach(function() {
    jamesModule = {
      lib: {
        client: {}
      }
    };
    esnConfigModule = {
      configurations: {
        updateConfigurations: sinon.stub()
      }
    };

    this.moduleHelpers.addDep('james', jamesModule);
    this.moduleHelpers.addDep('esn-config', esnConfigModule);

    this.loadModule = () => require(`${this.moduleHelpers.backendPath}/webserver/api/forwardings/controller`)(this.moduleHelpers.dependencies);
  });

  describe('The updateForwardingConfigurations function', function() {
    let utils, req, res, status;

    beforeEach(function() {
      status = { end: sinon.stub() };
      req = {
        domain: {
          name: 'domain-name'
        },
        query: {
          domain_id: 'domain-id'
        },
        body: [{
          name: 'linagora.esn.unifiedinbox',
          configurations: [
            { name: 'forwarding', value: true },
            { name: 'isLocalCopyEnabled', value: true }
          ]
        }]
      };
      res = {
        header: sinon.stub(),
        status: () => (status)
      };
      utils = {
        sendError: sinon.stub(),
        send400Error: sinon.stub()
      };

      mockery.registerMock('../utils', () => (utils));
    });

    it('should response success when update configurations successfully', function(done) {
      esnConfigModule.configurations.updateConfigurations.returns(Promise.resolve());
      const module = this.loadModule();

      module.updateForwardingConfigurations(req, res).then(() => {
        expect(esnConfigModule.configurations.updateConfigurations).to.have.been.calledWith(req.body, req.query.domain_id);
        expect(utils.sendError).to.not.have.been.called;
        expect(status.end).to.have.been.calledOnce;
        done();
      }, done);
    });

    it('should response error when update configurations failed', function(done) {
      esnConfigModule.configurations.updateConfigurations.returns(Promise.reject('update failed'));
      const module = this.loadModule();

      module.updateForwardingConfigurations(req, res).then(() => {
        expect(esnConfigModule.configurations.updateConfigurations).to.have.been.calledWith(req.body, req.query.domain_id);
        expect(utils.sendError).to.have.been.called;
        done();
      }, done);
    });

    it('should call James to remove all forwards then call esn-config to update configurations when disable forwarding', function(done) {
      jamesModule.lib.client.listForwardsInDomain = sinon.stub().returns(Promise.resolve(['fw1@op.org', 'fw2@op.org']));
      jamesModule.lib.client.removeForward = sinon.stub().returns(Promise.resolve());

      const module = this.loadModule();

      req.body = [{
        name: 'linagora.esn.unifiedinbox',
        configurations: [
          { name: 'forwarding', value: false },
          { name: 'isLocalCopyEnabled', value: false }
        ]
      }];

      module.updateForwardingConfigurations(req, res).then(() => {
        expect(jamesModule.lib.client.listForwardsInDomain).to.have.been.calledWith(req.domain.name);
        expect(jamesModule.lib.client.removeForward).to.have.been.calledTwice;
        expect(esnConfigModule.configurations.updateConfigurations).to.have.been.called;
        done();
      }, done);
    });

    it('should call James to remove local copy of all forwards then call esn-config to update configurations when disable local copy', function(done) {
      jamesModule.lib.client.listForwardsInDomain = sinon.stub().returns(Promise.resolve(['fw1@op.org', 'fw2@op.org']));
      jamesModule.lib.client.removeLocalCopyOfForward = sinon.stub().returns(Promise.resolve());

      const module = this.loadModule();

      req.body = [{
        name: 'linagora.esn.unifiedinbox',
        configurations: [
          { name: 'forwarding', value: true },
          { name: 'isLocalCopyEnabled', value: false }
        ]
      }];

      module.updateForwardingConfigurations(req, res).then(() => {
        expect(jamesModule.lib.client.listForwardsInDomain).to.have.been.calledWith(req.domain.name);
        expect(jamesModule.lib.client.removeLocalCopyOfForward).to.have.been.calledTwice;
        expect(esnConfigModule.configurations.updateConfigurations).to.have.been.called;
        done();
      }, done);
    });

    it('should not call esn-config to update configurations if James failed to remove all forwards when disable forwarding', function(done) {
      jamesModule.lib.client.listForwardsInDomain = sinon.stub().returns(Promise.resolve(['fw1@op.org', 'fw2@op.org']));
      jamesModule.lib.client.removeForward = sinon.stub().returns(Promise.reject('failed remove forwards'));

      const module = this.loadModule();

      req.body = [{
        name: 'linagora.esn.unifiedinbox',
        configurations: [
          { name: 'forwarding', value: false },
          { name: 'isLocalCopyEnabled', value: false }
        ]
      }];

      module.updateForwardingConfigurations(req, res).then(() => {
        expect(jamesModule.lib.client.listForwardsInDomain).to.have.been.calledWith(req.domain.name);
        expect(jamesModule.lib.client.removeForward).to.have.been.calledTwice;
        expect(esnConfigModule.configurations.updateConfigurations).to.not.have.been.called;
        done();
      }, done);
    });

    it('should not call esn-config to update configurations if James failed to remove local copy of all forwards when disable local copy', function(done) {
      jamesModule.lib.client.listForwardsInDomain = sinon.stub().returns(Promise.resolve(['fw1@op.org', 'fw2@op.org']));
      jamesModule.lib.client.removeLocalCopyOfForward = sinon.stub().returns(Promise.reject('failed remove local copy'));

      const module = this.loadModule();

      req.body = [{
        name: 'linagora.esn.unifiedinbox',
        configurations: [
          { name: 'forwarding', value: true },
          { name: 'isLocalCopyEnabled', value: false }
        ]
      }];

      module.updateForwardingConfigurations(req, res).then(() => {
        expect(jamesModule.lib.client.listForwardsInDomain).to.have.been.calledWith(req.domain.name);
        expect(jamesModule.lib.client.removeLocalCopyOfForward).to.have.been.calledTwice;
        expect(esnConfigModule.configurations.updateConfigurations).to.not.have.been.called;
        done();
      }, done);
    });
  });
});
