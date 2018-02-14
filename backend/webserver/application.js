'use strict';

const express = require('express');

const FRONTEND_PATH = require('./constants').FRONTEND_PATH;

module.exports = function(dependencies) {
  const application = express(),
        auth = dependencies('authorizationMW');

  // This needs to be initialized before the body parser
  require('./config/i18n')(dependencies, application);
  require('./config/views')(dependencies, application);

  application.use(express.static(FRONTEND_PATH));
  application.use('/api/inbox', auth.requiresAPILogin, require('./api')(dependencies));
  application.use('/mailto', auth.requiresLogin, require('./mailto')(dependencies));

  return application;
};
