'use strict';

const express = require('express');

module.exports = dependencies => {
  const router = express.Router();

  router.get('/', (req, res) => res.status(200).render('mailto/mailto', { assets: dependencies('assets').envAwareApp('mailto') }));

  return router;
};
