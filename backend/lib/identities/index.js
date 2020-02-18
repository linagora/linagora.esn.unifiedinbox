module.exports = dependencies => {
  const mongoose = dependencies('db').mongo.mongoose;
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
   * @returns {Promise} On resolve, return a list of identity objects
   */
  function get(user) {
    return InboxUserIdentities.findOne({ _id: user._id})
      .then(userIdentities => {
        if (!userIdentities || !userIdentities.identities) {
          return getDefaultIdentity(user).then(identity => [identity]);
        }

        return userIdentities.identities;
      });
  }

  /**
   * Update identities of a user.
   *
   * @param {Object} userId ID of target user for update
   * @param {Array} identities A list of identities
   * @return {Promise} On resolve, return updated identities of user
   */
  function update(userId, identities) {
    return InboxUserIdentities.findOneAndUpdate(
      { _id: userId },
      { $set: { identities } },
      { new: true, upsert: true }
    ).exec();
  }

  /**
   * Get all the valid emails for identities of a user.
   *
   * @param {Object} user A User object
   * @return {Promise} On resolve, return a list of emails
   */
  function getValidEmails(user) {
    return Promise.resolve(user.emails);
  }
};
