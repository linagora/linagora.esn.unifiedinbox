const express = require('express');

module.exports = dependencies => {
  const router = express.Router();

  router.get('/default', require('./controller')(dependencies).getDefaultIdentity);

  return router;
};
