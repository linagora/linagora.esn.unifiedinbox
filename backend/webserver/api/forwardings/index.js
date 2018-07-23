'use strict';

const express = require('express');

module.exports = dependencies => {
  const router = express.Router();
  const helperMW = dependencies('helperMW');
  const configurationMW = dependencies('configurationMW');
  const controller = require('./controller')(dependencies);
  const middleware = require('./middleware')(dependencies);

  router.get('/', controller.get);
  router.put('/',
    middleware.canCreate,
    middleware.validateForwarding,
    controller.create
  );
  router.put('/configurations',
    helperMW.requireInQuery('scope'),
    configurationMW.qualifyScopeQueries,
    middleware.validateForwardingConfigurations,
    configurationMW.validateWriteBody,
    configurationMW.checkAuthorizedRole,
    configurationMW.checkWritePermission,
    controller.updateForwardingConfigurations
  );
  router.delete('/',
    middleware.canDelete,
    middleware.validateForwarding,
    controller.remove
  );

  return router;
};
