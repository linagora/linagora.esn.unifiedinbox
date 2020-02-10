module.exports = dependencies => {
  const i18n = dependencies('i18n');
  const esnConfig = dependencies('esn-config');
  const mongoose = dependencies('db').mongo.mongoose;
  const { getDisplayName } = dependencies('user');
  const InboxUserIdentities = mongoose.model('InboxUserIdentities');
  const validators = require('./validators')(dependencies);
  const __ = (locale, phrase) => i18n.__({ locale, phrase });

  return {
    get,
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
          return _buildDefaultIdentity(user).then(identity => [identity]);
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

  function _buildDefaultIdentity(user) {
    const DEFAULT_LOCALE = 'en';
    const defaultIdentity = {
      default: true,
      name: getDisplayName(user),
      email: user.preferredEmail,
      replyTo: user.preferredEmail,
      htmlSignature: '',
      textSignature: ''
    };

    return esnConfig('language').inModule('core').forUser(user, true).get()
      .catch(() => DEFAULT_LOCALE)
      .then((locale = DEFAULT_LOCALE) => ({
        description: __(locale, 'My default identity'),
        ...defaultIdentity
      }));
  }
};
