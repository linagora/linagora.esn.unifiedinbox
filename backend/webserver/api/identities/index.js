'use strict';

const express = require('express');

module.exports = (dependencies, moduleName) => {
  const router = express.Router();
  const authorizationMW = dependencies('authorizationMW');
  const moduleMW = dependencies('moduleMW');

  router.all('/default*',
    authorizationMW.requiresAPILogin,
    moduleMW.requiresModuleIsEnabledInCurrentDomain(moduleName)
  );

  router.get('/default', require('./controller')(dependencies).getDefaultIdentity);

  return router;
};
