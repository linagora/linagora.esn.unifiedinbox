'use strict';

const express = require('express');

module.exports = dependencies => {
  const router = express.Router();
  const controller = require('./controller')(dependencies);
  const middleware = require('./middleware')(dependencies);

  router.get('/', controller.get);
  router.put('/',
    middleware.canCreate,
    middleware.validateForwarding,
    controller.create
  );
  router.delete('/',
    middleware.canDelete,
    middleware.validateForwarding,
    controller.remove
  );

  return router;
};
