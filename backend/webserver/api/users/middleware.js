module.exports = dependencies => {
  const { sendError } = require('../utils')(dependencies);
  const identities = require('../../../lib/identities')(dependencies);

  return {
    canGet,
    canUpdate,
    validateIdentities
  };

  function validateIdentities(req, res, next) {
    let error = identities.validators.validateFormat(req.body);

    if (error) return sendError(res, 400, error);

    identities.getValidEmails(req.targetUser)
      .then(validEmails => {
        error = identities.validators.validateEmails(validEmails, req.body);

        if (error) return sendError(res, 400, error);

        next();
      })
      .catch(error => sendError(res, 500, `Failed to get valid emails for identities of user ${req.params.uuid}`, error));
  }

  function canGet(req, res, next) {
    identities.rights.canGet(req.targetUser, req.user)
      .then(canGet => {
        if (canGet) return next();

        sendError(res, 403, `You are not allow to get identities for user ${req.params.uuid}`);
      })
      .catch(error => sendError(res, 500, `Failed to check identities get right for user ${req.params.uuid}`, error));
  }

  function canUpdate(req, res, next) {
    identities.rights.canUpdate(req.targetUser, req.user)
      .then(canUpdate => {
        if (canUpdate) return next();

        sendError(res, 403, `You are not allow to update identities for user ${req.params.uuid}`);
      })
      .catch(error => sendError(res, 500, `Failed to check identities update right for user ${req.params.uuid}`, error));
  }
};
