module.exports = dependencies => {
  const identitiesLibModule = require('../../../lib/identities')(dependencies);
  const { sendError } = require('../utils')(dependencies);

  return {
    getIdentities,
    getValidEmails,
    updateIdentities
  };

  function getIdentities(req, res) {
    identitiesLibModule.get(req.targetUser, { populateUsability: true })
      .then(identities => res.status(200).json(identities))
      .catch(error => sendError(res, 500, `Failed to get identities for user ${req.params.uuid}`, error));
  }

  function updateIdentities(req, res) {
    identitiesLibModule.update(req.targetUser, req.body, { populateUsability: true })
      .then(identities => res.status(200).json(identities))
      .catch(error => sendError(res, 500, `Failed to update identities for user ${req.params.uuid}`, error));
  }

  function getValidEmails(req, res) {
    identitiesLibModule.getValidEmails(req.targetUser)
      .then(validEmails => res.status(200).json(validEmails))
      .catch(error => sendError(res, 500, `Failed to get valid emails for identities of user ${req.params.uuid}`, error));
  }
};
