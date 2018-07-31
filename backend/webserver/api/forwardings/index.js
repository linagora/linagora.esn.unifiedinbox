'use strict';

const express = require('express');

module.exports = dependencies => {
  const router = express.Router();
  const helperMW = dependencies('helperMW');
  const configurationMW = dependencies('configurationMW');
  const controller = require('./controller')(dependencies);
  const middleware = require('./middleware')(dependencies);

  router.get('/',
    middleware.canRead,
    controller.get
  );
  router.put('/',
    middleware.canUpdate,
    controller.create
  );
  router.delete('/',
    middleware.canUpdate,
    controller.remove
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

  return router;
};
