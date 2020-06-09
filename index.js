const glob = require('glob-all');
const path = require('path');
const AwesomeModule = require('awesome-module');
const Dependency = AwesomeModule.AwesomeModuleDependency;

const FRONTEND_JS_PATH = path.join(__dirname, 'frontend/app/');
const FRONTEND_JS_PATH_BUILD = __dirname + '/dist/';
const APP_ENTRY_POINT = path.join(FRONTEND_JS_PATH, 'app.js');
const NAMESPACE = 'unifiedinbox';
const MODULE_NAME = 'linagora.esn.unifiedinbox';

const getPath = item => path.join('../components', item);
const EXTERNAL_COMPONENTS_JS = [
  'angularjs-dragula/dist/angularjs-dragula.js',
  'sanitize-html/dist/sanitize-html.js',
  'jmap-draft-client/dist/jmap-draft-client.min.js'
].map(getPath);

const EXTERNAL_COMPONENTS_CSS = [
  'angularjs-dragula/dist/dragula.css'
].map(getPath);

module.exports = new AwesomeModule(MODULE_NAME, {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.logger', 'logger'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.db', 'db'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.esn-config', 'esn-config'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.email', 'email'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.i18n', 'i18n'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.user', 'user'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.domain', 'domain'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.wrapper', 'webserver-wrapper'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.middleware.authorization', 'authorizationMW'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.middleware.module', 'moduleMW'),
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
        lib: require('./backend/lib')(dependencies),
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
      let frontendFullPathModules, frontendUriModules;

      if (process.env.NODE_ENV !== 'production') {
        frontendFullPathModules = [APP_ENTRY_POINT].concat(
          glob.sync([
            `${FRONTEND_JS_PATH}**/!(*spec).js`,
            `!${FRONTEND_JS_PATH}/mailto/**`,
            `!${APP_ENTRY_POINT}`
          ])
        );

        frontendUriModules = frontendFullPathModules.map(filepath => filepath.replace(FRONTEND_JS_PATH, ''));
      } else {
        frontendFullPathModules = glob.sync([
          FRONTEND_JS_PATH_BUILD + '*.js'
        ]);

        frontendUriModules = frontendFullPathModules.map(filepath => filepath.replace(FRONTEND_JS_PATH_BUILD, ''));
      }

      webserverWrapper.injectJS(NAMESPACE, EXTERNAL_COMPONENTS_JS, 'esn');
      webserverWrapper.injectCSS(NAMESPACE, EXTERNAL_COMPONENTS_CSS, 'esn');

      webserverWrapper.injectAngularAppModules(NAMESPACE, frontendUriModules, MODULE_NAME, ['esn'], {localJsFiles: frontendFullPathModules});
      webserverWrapper.injectLess(NAMESPACE, [path.resolve(__dirname, './frontend/app/inbox.less')], ['esn']);

      webserverWrapper.addApp(NAMESPACE, app);

      require('./backend/lib/config')(dependencies).register();

      return callback();
    },

    start: (dependencies, callback) => callback()
  }
});
