'use strict';

const emailAddresses = require('email-addresses');

module.exports = dependencies => {
  const esnConfig = dependencies('esn-config');
  const { sendError } = require('../utils')(dependencies);
  const composableMw = require('composable-middleware');
  const { loadFromDomainIdParameter } = dependencies('domainMW');
  const { requiresDomainManager, requiresTargetUserIsDomainMember } = dependencies('authorizationMW');
  const { loadTargetUser } = dependencies('usersMW');

  return {
    canGetForTargetUser,
    canCreate,
    canCreateForTargetUser,
    canDelete,
    canDeleteOfTargetUser,
    validateForwarding,
    validateForwardingConfigurations
  };

  function canGetForTargetUser(req, res, next) {
    return composableMw(
      loadFromDomainIdParameter,
      requiresDomainManager,
      loadTargetUser,
      requiresTargetUserIsDomainMember,
      requireForwardingEnabled
    )(req, res, next);
  }

  function canCreate(req, res, next) {
    const middlewares = [requireForwardingEnabled];

    if (req.body.forwarding === req.user.preferredEmail) {
      middlewares.push(requireLocalCopyEnabled);
    }

    return composableMw(...middlewares)(req, res, next);
  }

  function canCreateForTargetUser(req, res, next) {
    return composableMw(
      requireForwardingEnabled,
      loadFromDomainIdParameter,
      requiresDomainManager,
      loadTargetUser,
      requiresTargetUserIsDomainMember,
      _canKeepLocalCopyForTargetUser()
    )(req, res, next);
  }

  function canDelete(req, res, next) {
    return requireForwardingEnabled(req, res, next);
  }

  function canDeleteOfTargetUser(req, res, next) {
    return composableMw(
      loadFromDomainIdParameter,
      requiresDomainManager,
      loadTargetUser,
      requiresTargetUserIsDomainMember,
      requireForwardingEnabled
    )(req, res, next);
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

  function validateForwardingConfigurations(req, res, next) {
    const { forwarding, isLocalCopyEnabled } = req.body;

    if (typeof forwarding === 'undefined') {
      return sendError(res, 400, 'forwarding is required');
    }

    if (typeof isLocalCopyEnabled === 'undefined') {
      return sendError(res, 400, 'isLocalCopyEnabled is required');
    }

    req.body = [{
      name: 'linagora.esn.unifiedinbox',
      configurations: [
        { name: 'forwarding', value: forwarding },
        { name: 'isLocalCopyEnabled', value: forwarding ? isLocalCopyEnabled : false }
      ]
    }];

    next();
  }

  function requireForwardingEnabled(req, res, next) {
    esnConfig('forwarding').inModule('linagora.esn.unifiedinbox').forUser(req.user).get()
      .then(isForwardingEnabled => {
        if (!isForwardingEnabled) {
          return sendError(res, 403, 'You are not allowed to configure forwarding');
        }

        next();
      })
      .catch(err => sendError(res, 500, 'Unable to get forwarding configuration', err));
  }

  function requireLocalCopyEnabled(req, res, next) {
    esnConfig('isLocalCopyEnabled').inModule('linagora.esn.unifiedinbox').forUser(req.user).get()
      .then(isLocalCopyEnabled => {
        if (!isLocalCopyEnabled) {
          return sendError(res, 403, 'You are not allowed to add your email as a forwarding');
        }

        next();
      })
      .catch(err => sendError(res, 500, 'Unable to get forwarding configurations', err));
  }

  function _canKeepLocalCopyForTargetUser() {
    return function(req, res, next) {
      if (req.body.forwarding === req.targetUser.preferredEmail) {
        return requireLocalCopyEnabled(req, res, next);
      }

      next();
    };
  }
};
