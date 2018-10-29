'use strict';

const express = require('express');

module.exports = dependencies => {
  const router = express.Router();
  const mailtoController = require('./controller')(dependencies);

  router.get('/', mailtoController.renderMailto);

  return router;
};
