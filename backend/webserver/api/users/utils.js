module.exports = dependencies => {
  const identitiesLibModule = require('../../../lib/identities')(dependencies);

  return {
    checkUsableIdentities
  };

  function checkUsableIdentities(targetUser, identities) {
    identities = identities.toObject ? identities.toObject() : identities;

    return identitiesLibModule.getValidEmails(targetUser)
      .then(validEmails => identities.map(identity => {
          identity.error = {};
          identity.usable = true;

          if (validEmails.indexOf(identity.email) === -1) {
            identity.usable = false;
            identity.error.email = true;
          }

          if (identity.replyTo && validEmails.indexOf(identity.replyTo) === -1) {
            identity.usable = false;
            identity.error.replyTo = true;
          }

          return identity;
        }));
  }
};
