'use strict';

const emailAddresses = require('email-addresses');

module.exports = (dependencies, lib) => {
  const esnConfig = dependencies('esn-config');
  const { sendError } = require('../utils')(dependencies);

  return {
    canCreate,
    canDelete,
    validateForwarding
  };

  function canCreate(req, res, next) {
    const EsnConfig = new esnConfig.EsnConfig('linagora.esn.unifiedinbox', req.user.preferredDomainId);

    EsnConfig.getMultiple(['forwarding', 'isLocalCopyEnabled'])
      .then(configs => {
        const { isForwardingEnabled, isLocalCopyEnabled } = { isForwardingEnabled: configs[0].value, isLocalCopyEnabled: configs[1].value };

        if (!isForwardingEnabled) {
          return sendError(res, 403, 'You are not allowed to create a forwarding');
        }

        if (req.body.forwarding === req.user.preferredEmail) {
          return _canKeepLocalCopy(req, res, next, isLocalCopyEnabled);
        }

        next();
      })
      .catch(err => sendError(res, 500, 'Unable to get forwarding configurations', err));
  }

  function _canKeepLocalCopy(req, res, next, isLocalCopyEnabled) {
    if (!isLocalCopyEnabled) {
      return sendError(res, 403, 'You are not allowed to add your email as a forwarding');
    }

    next();
  }

  function canDelete(req, res, next) {
    esnConfig('forwarding').inModule('linagora.esn.unifiedinbox').forUser(req.user).get()
      .then(isForwardingEnabled => {
        if (isForwardingEnabled) {
          return next();
        }

        sendError(res, 403, 'You are not allowed to delete a forwarding');
      })
      .catch(err => sendError(res, 500, 'Unable to get forwarding configuration', err));
  }

  function validateForwarding(req, res, next) {
    const { forwarding } = req.body;

    if (!forwarding) {
      return sendError(res, 400, 'forwarding is required');
    }

    if (emailAddresses.parseOneAddress(forwarding) === null) {
      return sendError(res, 400, 'forwarding is not a valid email address');
    }

    next();
  }
};
