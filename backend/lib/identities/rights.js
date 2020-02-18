const { promisify } = require('util');

module.exports = dependencies => {
  const { load, userIsDomainAdministrator} = dependencies('domain');
  const esnConfig = dependencies('esn-config');
  const loadDomain = promisify(load);
  const isDomainAdministrator = promisify(userIsDomainAdministrator);

  return {
    canGet,
    canUpdate
  };

  function canUpdate(target, actor) {
    return loadDomain(target.preferredDomainId)
      .then(domain => isDomainAdministrator(actor, domain))
      .then(_isDomainAdministrator => {
        if (_isDomainAdministrator) {
          return true;
        }

        if (target.id !== actor.id) {
          return false;
        }

        return esnConfig('features')
          .inModule('linagora.esn.unifiedinbox')
          .forUser(target)
          .get()
          .then(features => !!(features && features.allowMembersToManageIdentities));
      });
  }

  function canGet(target, actor) {
    if (target.id === actor.id) return Promise.resolve(true);

    return loadDomain(target.preferredDomainId)
      .then(domain => isDomainAdministrator(actor, domain));
  }
};
