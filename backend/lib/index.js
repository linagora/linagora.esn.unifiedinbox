module.exports = dependencies => {
  const models = require('./db')(dependencies);
  const identities = require('./identities')(dependencies);

  return {
    models,
    identities
  };
};
