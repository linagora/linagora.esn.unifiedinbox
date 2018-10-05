const glob = require('glob-all');
const path = require('path');
const AwesomeModule = require('awesome-module');
const Dependency = AwesomeModule.AwesomeModuleDependency;

const FRONTEND_JS_PATH = path.join(__dirname, 'frontend/app/');
const APP_ENTRY_POINT = path.join(FRONTEND_JS_PATH, 'app.js');

module.exports = new AwesomeModule('linagora.esn.unifiedinbox', {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.logger', 'logger'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.esn-config', 'esn-config'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.email', 'email'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.i18n', 'i18n'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.wrapper', 'webserver-wrapper'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.middleware.authorization', 'authorizationMW'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.middleware.authentication', 'authenticationMW'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.middleware.domain', 'domainMW'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.middleware.users', 'usersMW'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.middleware.configuration', 'configurationMW'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.middleware.helper', 'helperMW'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.assets', 'assets'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.graceperiod', 'graceperiod'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.james', 'james')
  ],
  states: {
    lib: function(dependencies, callback) {
      const lib = {
        api: {
          inbox: require('./backend/webserver/api')(dependencies)
        }
      };

      return callback(null, lib);
    },

    deploy: function(dependencies, callback) {
      require('./backend/webserver/mailto/app')(dependencies);
      const app = require('./backend/webserver/application')(dependencies);
      const webserverWrapper = dependencies('webserver-wrapper');
      const frontendFullPathModules = [APP_ENTRY_POINT].concat(
        glob.sync([
          `${FRONTEND_JS_PATH}**/!(*spec).js`,
          `!${FRONTEND_JS_PATH}/mailto/**`,
          `!${APP_ENTRY_POINT}`
        ])
      );
      const frontendUriModules = frontendFullPathModules.map(filepath => filepath.replace(FRONTEND_JS_PATH, ''));

      webserverWrapper.injectAngularAppModules('unifiedinbox', frontendUriModules, 'linagora.esn.unifiedinbox', ['esn'], { localJsFiles: frontendFullPathModules });
      webserverWrapper.injectLess('unifiedinbox', [path.resolve(__dirname, './frontend/app/inbox.less')], ['esn']);
      webserverWrapper.addApp('unifiedinbox', app);

      require('./backend/lib/config')(dependencies).register();

      return callback();
    },

    start: (dependencies, callback) => callback()
  }
});
