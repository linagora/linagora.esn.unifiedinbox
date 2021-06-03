'use strict';

const express = require('express');
const cors = require('cors');

const FRONTEND_PATH = require('./constants').FRONTEND_PATH;

module.exports = function(dependencies) {
  const application = express(),
        authorize = dependencies('authorizationMW'),
        authenticate = dependencies('authenticationMW');

  // This needs to be initialized before the body parser
  require('./config/i18n')(dependencies, application);
  require('./config/views')(dependencies, application);

  application.use(express.static(FRONTEND_PATH));
  application.use('/api/inbox', cors({origin: true, credentials: true}), authorize.requiresAPILogin, require('./api')(dependencies));
  application.use('/mailto', authenticate.loginHandler, authorize.loginAndContinue, require('./mailto')(dependencies));

  return application;
};
