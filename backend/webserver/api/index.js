'use strict';

const express = require('express');

module.exports = dependencies => {
  const router = express.Router();
  const moduleName = 'linagora.esn.unifiedinbox';

  router.use('/sendemail', require('./sendEmail')(dependencies, moduleName));
  router.use('/identities', require('./identities')(dependencies, moduleName));
  router.use('/forwardings', require('./forwardings')(dependencies, moduleName));

  return router;
};
