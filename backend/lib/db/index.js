module.exports = dependencies => {
  const InboxUserIdentities = require('./InboxUserIdentities')(dependencies);

  return {
    InboxUserIdentities
  };
};
