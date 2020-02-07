const express = require('express');

module.exports = dependencies => {
  const router = express.Router();

  router.post('/', require('./controller')(dependencies).sendEmailToRecipients);

  return router;
};
