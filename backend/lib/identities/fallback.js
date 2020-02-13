module.exports = dependencies => {
  const i18n = dependencies('i18n');
  const esnConfig = dependencies('esn-config');
  const { getDisplayName } = dependencies('user');
  const __ = (locale, phrase) => i18n.__({ locale, phrase });

  return {
    getDefaultIdentity
  };

  /**
   * Get default identity of a specific user based on user basic information
   * This method also provides support for compatibility with legacy database
   * where user's default identity is stored on Configuration collection
   * @param {Object} user target user
   * @returns {Promise} resolve with built default identity of the user
   */
  function getDefaultIdentity(user) {
    const DEFAULT_LOCALE = 'en';

    return esnConfig('language').inModule('core').forUser(user, true).get()
      .catch(() => DEFAULT_LOCALE)
      .then((locale = DEFAULT_LOCALE) =>
        esnConfig('identities.default').inModule('linagora.esn.unifiedinbox').forUser(user, true).get()
          .then((defaultIdentity = {}) => ({
            default: true,
            name: getDisplayName(user),
            email: user.preferredEmail,
            replyTo: user.preferredEmail,
            htmlSignature: '',
            textSignature: '',
            description: __(locale, 'My default identity'),
            ...defaultIdentity
          }))
      );
  }
};
