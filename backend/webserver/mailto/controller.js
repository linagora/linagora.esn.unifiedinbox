
module.exports = dependencies => {
  const esnConfig = dependencies('esn-config');
  const { i18nConfigTemplate } = dependencies('i18n');

  return {
    renderMailto
  };

  /**
   * Get locale from config
   * @param {request} req
   * @param {response} res
   */
  function renderMailto(req, res) {
    _getConfig(req.user).then(config => {
      const fullLocale = i18nConfigTemplate.fullLocales.hasOwnProperty(config) ? i18nConfigTemplate.fullLocales[config] : config || i18nConfigTemplate.defaultLocale;

      return res.status(200).render('mailto/mailto', { assets: dependencies('assets').envAwareApp('mailto'), fullLocale: fullLocale});
    });
  }

  function _getConfig(user) {
    return esnConfig('language').inModule('core').forUser(user, true).get();
  }

};
