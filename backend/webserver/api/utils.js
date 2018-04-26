'use strict';

const HTTP_CODES = require('http').STATUS_CODES;

module.exports = dependencies => {
  const logger = dependencies('logger');

  return {
    sendError
  };

  function sendError(res, code, details, err) {
    if (err) {
      logger.error(details, err);
    }

    res.status(code).json({
      error: {
        code,
        message: HTTP_CODES[code],
        details
      }
    });
  }
};
