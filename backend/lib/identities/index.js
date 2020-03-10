module.exports = dependencies => {
  const mongoose = dependencies('db').mongo.mongoose;
  const jamesModule = dependencies('james');
  const InboxUserIdentities = mongoose.model('InboxUserIdentities');
  const validators = require('./validators')(dependencies);
  const { getDefaultIdentity } = require('./fallback')(dependencies);

  return {
    get,
    getValidEmails,
    update,
    validators,
    rights: require('./rights')(dependencies)
  };

  /**
   * Get all identities of a user.
   * In case of no stored identities, return a default identity
   * based on user info
   *
   * @param {Object} user A User object
   * @param {Object} options Valid options are
   * - populateUsability: extend updated identities with usability of their emails
   * @returns {Promise} On resolve, return a list of identity objects
   */
  function get(user, options = { populateUsability: false }) {
    return InboxUserIdentities.findOne({ _id: user._id})
      .then(userIdentities => {
        if (!userIdentities || !userIdentities.identities) {
          return getDefaultIdentity(user).then(identity => [identity]);
        }

        return userIdentities.identities;
      })
      .then(identities => (options.populateUsability ? _populateUsability(user, identities) : identities));
  }

  /**
   * Update identities of a user.
   *
   * @param {Object} user A User object of target user
   * @param {Array} identities A list of identities
   * @param {Object} options Valid options are
   * - populateUsability: extend identities with usability of their emails
   * @return {Promise} On resolve, return updated identities of user
   */
  function update(user, identities, options = { populateUsability: false }) {
    return InboxUserIdentities.findOneAndUpdate(
      { _id: user._id },
      { $set: { identities } },
      { new: true, upsert: true }
    )
      .exec()
      .then(updated => (options.populateUsability ? _populateUsability(user, updated.identities) : updated.identities));
  }

  /**
   * Get all the valid emails for identities of a user.
   *
   * @param {Object} user A User object
   * @return {Promise} On resolve, return a list of emails
   */
  function getValidEmails(user) {
    return jamesModule.lib.client.listUserAliases(user.preferredEmail)
      .then(userAliases => [user.preferredEmail, ...userAliases.map(alias => alias.source)]);
  }

  function _populateUsability(targetUser, identities) {
    identities = identities.toObject ? identities.toObject() : identities;

    return getValidEmails(targetUser)
      .then(validEmails => identities.map(identity => {
          identity.error = {};
          identity.usable = true;

          if (!validEmails.includes(identity.email)) {
            identity.usable = false;
            identity.error.email = true;
          }

          if (identity.replyTo && !validEmails.includes(identity.replyTo)) {
            identity.usable = false;
            identity.error.replyTo = true;
          }

          return identity;
        }));
  }
};
