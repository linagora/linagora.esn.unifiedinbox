module.exports = dependencies => {
  const identities = require('../../../lib/identities')(dependencies);
  const { sendError } = require('../utils')(dependencies);

  return {
    getIdentities,
    getValidEmails,
    updateIdentities
  };

  function getIdentities(req, res) {
    identities.get(req.targetUser)
      .then(identities => res.status(200).json(identities))
      .catch(error => sendError(res, 500, `Failed to get identities for user ${req.params.uuid}`, error));
  }

  function updateIdentities(req, res) {
    identities.update(req.targetUser._id, req.body)
      .then(updated => res.status(200).json(updated.identities))
      .catch(error => sendError(res, 500, `Failed to update identities for user ${req.params.uuid}`, error));
  }

  function getValidEmails(req, res) {
    identities.getValidEmails(req.targetUser)
      .then(validEmails => res.status(200).json(validEmails))
      .catch(error => sendError(res, 500, `Failed to get valid emails for identities of user ${req.params.uuid}`, error));
  }
};
