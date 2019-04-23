'use strict';

const express = require('express');

module.exports = (dependencies, moduleName) => {
  const router = express.Router();
  const moduleMW = dependencies('moduleMW');
  const authorizationMW = dependencies('authorizationMW');

  router.all('/*',
    authorizationMW.requiresAPILogin,
    moduleMW.requiresModuleIsEnabledInCurrentDomain(moduleName)
  );

  router.post('/', require('./controller')(dependencies).sendEmailToRecipients);

  return router;
};
