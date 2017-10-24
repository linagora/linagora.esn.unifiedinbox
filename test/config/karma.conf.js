'use strict';

module.exports = function(config) {
  config.set({
    basePath: '../../',
    files: [
      'frontend/components/mdi/css/materialdesignicons.css',
      'frontend/components/chai/chai.js',
      'node_modules/chai-shallow-deep-equal/chai-shallow-deep-equal.js',
      'frontend/components/lodash/dist/lodash.js',
      'frontend/components/jquery/dist/jquery.js',
      'frontend/components/angular/angular.js',
      'frontend/components/angular-ui-router/release/angular-ui-router.js',
      'frontend/components/angular-mocks/angular-mocks.js',
      'frontend/components/angular-component/dist/angular-component.js',
      'frontend/components/dynamic-directive/dist/dynamic-directive.js',
      'frontend/components/sinon-chai/lib/sinon-chai.js',
      'node_modules/sinon/pkg/sinon.js',
      'frontend/components/moment/moment.js',
      'frontend/components/moment-timezone/builds/moment-timezone-with-data.js',
      'frontend/components/lodash/dist/lodash.js',
      'frontend/components/jmap-client/dist/jmap-client.js',
      'frontend/components/angular-moment/angular-moment.js',
      'frontend/components/angular-sanitize/angular-sanitize.js',
      'frontend/components/angular-material/angular-material.js',
      'frontend/components/angular-material/angular-material.css',
      'frontend/components/angular-uuid4/angular-uuid4.js',
      'frontend/components/angular-feature-flags/dist/featureFlags.js',
      'frontend/components/re-tree/re-tree.js',
      'frontend/components/ng-device-detector/ng-device-detector.js',
      'frontend/components/restangular/dist/restangular.js',
      'frontend/components/remarkable-bootstrap-notify/bootstrap-notify.js',

      'frontend/components/chai-datetime/chai-datetime.js',
      'frontend/components/angular-translate/angular-translate.js',
      'frontend/components/offline/offline.js',
      'frontend/components/angular-file-upload/dist/angular-file-upload.js',
      'frontend/components/matchmedia-ng/matchmedia-ng.js',
      'frontend/components/Autolinker.js/dist/Autolinker.js',
      'frontend/components/ngInfiniteScroll/build/ng-infinite-scroll.js',
      'frontend/components/openpaas-logo/openpaas-logo.js',
      'frontend/components/angular-strap/dist/angular-strap.js',
      'frontend/components/angular-strap/dist/modules/modal.js',
      'frontend/components/angular-strap/dist/modules/alert.js',
      'frontend/components/angular-strap/dist/modules/popover.js',
      'frontend/components/ng-tags-input/ng-tags-input.js',
      'frontend/components/ngGeolocation/ngGeolocation.js',
      'frontend/components/jquery.focus/dist/jquery.focus.js',
      'frontend/components/jquery-mockjax/dist/jquery.mockjax.js',

      'frontend/components/angular-material/angular-material.min.js',
      'frontend/components/angular-material/angular-material.min.css',

      'frontend/components/bootstrap/dist/js/bootstrap.js',
      'frontend/components/summernote/dist/summernote.js',
      'frontend/components/angular-summernote/dist/angular-summernote.js',
      'frontend/components/angular-messages/angular-messages.js',
      'frontend/components/angular-animate/angular-animate.js',
      'frontend/components/waves/src/js/waves.js',

      'frontend/components/videogular/videogular.min.js',
      'frontend/components/videogular-buffering/vg-buffering.min.js',
      'frontend/components/videogular-controls/vg-controls.min.js',
      'frontend/components/videogular-overlay-play/vg-overlay-play.min.js',
      'frontend/components/angular-file-saver/dist/angular-file-saver.bundle.js',

      { pattern: 'node_modules/linagora-rse/frontend/js/modules/i18n/i18n.config.js', watched: false, included: false, served: true },
      { pattern: 'frontend/app/components/message-body/html/*.*', watched: false, included: false, served: true },
      { pattern: 'frontend/images/**/*.*', watched: false, included: false, served: true },
      { pattern: 'frontend/components/mdi/fonts/**/*.*', watched: false, included: false, served: true },

      'node_modules/linagora-rse/test/fixtures/**/*.js',
      'node_modules/linagora-rse/frontend/js/modules/**/*.module.js',
      'node_modules/linagora-rse/frontend/js/modules/**/*.js',
      'node_modules/linagora-rse/frontend/views/modules/**/*.pug',
      'node_modules/linagora-rse/frontend/js/*.js',

      'node_modules/linagora-rse/modules/linagora.esn.graceperiod/frontend/js/*.js',

      'test/unit-frontend/mocks/**/*.js',
      'test/unit-frontend/**/*.js',
      'frontend/js/app.js',
      'frontend/js/**/*.js',
      'frontend/app/**/*.js',
      'frontend/app/**/*.pug',
      'frontend/views/**/*.pug'
    ],
    exclude: [
      'node_modules/linagora-rse/frontend/js/**/*.spec.js'
    ],
    frameworks: ['mocha'],
    colors: true,
    singleRun: true,
    autoWatch: true,
    browsers: ['PhantomJS', 'Chrome', 'Firefox'],
    customLaunchers: {
      Chrome_with_debugging: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9222'],
        debug: true
      }
    },
    reporters: ['coverage', 'spec'],
    preprocessors: {
      'frontend/js/**/*.js': ['coverage'],
      '**/*.pug': ['ng-jade2module']
    },

    proxies: {
      '/images/': '/base/frontend/images/'
    },

    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-mocha',
      'karma-coverage',
      'karma-spec-reporter',
      'karma-ng-jade2module-preprocessor'
    ],

    coverageReporter: {type: 'text', dir: '/tmp'},

    ngJade2ModulePreprocessor: {
      stripPrefix: 'frontend',
      cacheIdFromPath: function(filepath) {
        return filepath
          .replace(/pug$/, 'html')
          .replace(/^frontend/, '/unifiedinbox')
          .replace(/^node_modules\/linagora-rse\/frontend/, '');
      },
      prependPrefix: '/unifiedinbox',
      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('templates')
      jadeRenderOptions: {
        basedir: require('path').resolve(__dirname, '../../node_modules/linagora-rse/frontend/views')
      },
      jadeRenderLocals: {
        __: function(str) {
          return str;
        }
      },
      moduleName: 'jadeTemplates'
    }

  });
};
