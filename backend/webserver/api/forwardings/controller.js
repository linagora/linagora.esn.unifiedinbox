'use strict';

module.exports = dependencies => {
  const jamesModule = dependencies('james');
  const esnConfig = dependencies('esn-config');
  const { sendError } = require('../utils')(dependencies);

  return {
    get,
    create,
    remove,
    updateForwardingConfigurations
  };

  function get(req, res) {
    if (!req.query.email) {
      req.query.email = req.user.preferredEmail;
    }

    jamesModule.lib.client.listDestinationsOfForward(req.query.email)
      .then(forwardings => res.status(200).json(forwardings))
      .catch(err => sendError(res, 500, 'Unable to get forwardings', err));
  }

  function create(req, res) {
    if (!req.body.email) {
      req.body.email = req.user.preferredEmail;
    }

    jamesModule.lib.client.addDestinationsToForward(req.body.email, [req.body.forwarding])
      .then(() => res.status(204).end())
      .catch(err => sendError(res, 500, 'Unable to create forwarding', err));
  }

  function remove(req, res) {
    if (!req.body.email) {
      req.body.email = req.user.preferredEmail;
    }

    jamesModule.lib.client.removeDestinationsOfForward(req.body.email, [req.body.forwarding])
      .then(() => res.status(204).end())
      .catch(err => sendError(res, 500, 'Unable to remove forwarding', err));
  }

  function updateForwardingConfigurations(req, res) {
    const configs = req.body[0].configurations;
    const domainId = req.query.domain_id || null;

    let updateJamesForwardingsConfigs = Promise.resolve();

    configs.some(config => {
      if (config.name === 'forwarding' && !config.value) {
        updateJamesForwardingsConfigs = _removeAllForwardsInDomain(req.domain);

        return true;
      }

      if (config.name === 'isLocalCopyEnabled' && !config.value) {
        updateJamesForwardingsConfigs = _removeLocalCopyOfAllForwardsInDomain(req.domain);

        return true;
      }
    });

    return updateJamesForwardingsConfigs
      .then(() => esnConfig.configurations.updateConfigurations(req.body, domainId))
      .then(() => res.status(204).end())
      .catch(err => sendError(res, 500, 'Error while updating forwarding configurations', err));
  }

  function _removeAllForwardsInDomain(domain) {
    return jamesModule.lib.client.listForwardsInDomain(domain.name)
             .then(forwards => Promise.all(forwards.map(forward => jamesModule.lib.client.removeForward(forward))));
  }

  function _removeLocalCopyOfAllForwardsInDomain(domain) {
    return jamesModule.lib.client.listForwardsInDomain(domain.name)
             .then(forwards => Promise.all(forwards.map(forward => jamesModule.lib.client.removeLocalCopyOfForward(forward))));
  }
};
