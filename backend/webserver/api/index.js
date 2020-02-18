const express = require('express');

module.exports = dependencies => {
  const router = express.Router();
  const moduleName = 'linagora.esn.unifiedinbox';
  const moduleMW = dependencies('moduleMW');
  const authorizationMW = dependencies('authorizationMW');

  router.all('/*',
    authorizationMW.requiresAPILogin,
    moduleMW.requiresModuleIsEnabledInCurrentDomain(moduleName)
  );
  router.use('/sendemail', require('./sendEmail')(dependencies));
  router.use('/forwardings', require('./forwardings')(dependencies));
  router.use('/users', require('./users')(dependencies));

  return router;
};
