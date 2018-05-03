'use strict';

module.exports = dependencies => {
  const jamesModule = dependencies('james');
  const { sendError } = require('../utils')(dependencies);

  return {
    get,
    create,
    remove
  };

  function get(req, res) {
    jamesModule.lib.client.listDestinationsOfForward(req.user.preferredEmail)
      .then(forwardings => res.status(200).json(forwardings))
      .catch(err => sendError(res, 500, 'Unable to get forwardings', err));
  }

  function create(req, res) {
    jamesModule.lib.client.addDestinationsToForward(req.user.preferredEmail, [req.body.forwarding])
      .then(() => res.status(204).end())
      .catch(err => sendError(res, 500, 'Unable to create forwarding', err));
  }

  function remove(req, res) {
    jamesModule.lib.client.removeDestinationsOfForward(req.user.preferredEmail, [req.body.forwarding])
      .then(() => res.status(204).end())
      .catch(err => sendError(res, 500, 'Unable to remove forwarding', err));
  }
};
