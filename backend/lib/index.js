module.exports = dependencies => {
  const models = require('./db')(dependencies);

  return {
    models
  };
};
