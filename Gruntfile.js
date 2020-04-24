'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    eslint: {
      options: {
        config: '.eslintrc'
      },
      all: {
        src: ['Gruntfile.js', 'tasks/**/*.js', 'test/**/**/*.js', 'backend/**/*.js', 'frontend/app/**/*.js']
      }
    },
    lint_pattern: {
      options: {
        rules: [
          { pattern: /(describe|it)\.only/, message: 'Must not use .only in tests' }
        ]
      },
      all: {
        src: ['<%= eslint.all.src %>']
      },
      css: {
        options: {
          rules: [
            { pattern: /important;(\s*$|(?=\s+[^/]))/, message: 'CSS important rules only allowed with explanatory comment' }
          ]
        },
        src: [
          'frontend/app/**/*.less',
          'frontend/css/**/*.less'
        ]
      }
    },
    splitfiles: {
      options: {
        chunk: 1
      },
      midway: {
        options: {
          common: ['test/midway-backend/all.js'],
          target: 'mochacli:midway'
        },
        files: {
          src: ['test/midway-backend/**/*.js']
        }
      },
      storage: {
        options: {
          common: ['test/unit-storage/all.js'],
          target: 'mochacli:storage'
        },
        files: {
          src: ['test/unit-storage/**/*.js']
        }
      }
    },
    mochacli: {
      options: {
        require: ['chai', 'mockery'],
        reporter: 'spec',
        timeout: process.env.TEST_TIMEOUT || 5000,
        exit: true
      },
      backend: {
        options: {
          files: ['test/unit-backend/all.js', grunt.option('test') || 'test/unit-backend/**/*.js']
        }
      }
    },
    karma: {
      unit: {
        configFile: './test/config/karma.conf.js'
      }
    },

    i18n_checker: {
      all: {
        options: {
          baseDir: __dirname,
          dirs: [{
            localeDir: 'backend/lib/i18n/locales',
            templateSrc: [
              'frontend/app/**/*.pug',
              'frontend/views/**/*.pug'
            ]
          }, {
            localeDir: 'node_modules/linagora-rse/backend/i18n/locales',
            core: true
          }],
          verifyOptions: {
            defaultLocale: 'en',
            locales: ['en', 'fr', 'vi', 'zh'],
            rules: [
              'all-keys-translated',
              'all-locales-present',
              'key-trimmed',
              'no-duplicate-among-modules',
              'no-untranslated-key',
              'valid-json-file'
            ]
          }
        }
      }
    },

    swagger_generate: {
      options: {
        baseDir: __dirname,
        swaggerOutputFile: 'doc/REST_API/swagger/unifiedinbox-swagger.json',
        info: {
          title: 'OpenPaaS Unifiedinbox Module',
          description: 'OpenPaaS Unifiedinbox Module API',
          version: '0.1'
        },
        host: 'localhost:8080',
        securityDefinitions: {
          auth: {
            type: 'oauth2',
            description: 'OAuth2 security scheme for the OpenPaaS Unifiedinbox Module API',
            flow: 'password',
            tokenUrl: 'localhost:8080/oauth/token',
            scopes: {}
          }
        },
        paths: [
          'backend/webserver/api/*/*.js',
          'doc/REST_API/swagger/*/*.js',
          'node_modules/linagora-rse/doc/REST_API/swagger/*/*.js'
        ]
      }
    },

    swagger_checker: {
      options: {
        path: './doc/REST_API/swagger/unifiedinbox-swagger.json',
        validate: {
          schema: true,
          spec: false
        }
      }
    },

    puglint: {
      all: {
        options: {
          config: {
            disallowAttributeInterpolation: true,
            disallowLegacyMixinCall: true,
            validateExtensions: true,
            validateIndentation: 2
          }
        },
        src: [
          'frontend/**/*.pug'
        ]
      }
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('@linagora/grunt-lint-pattern');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('@linagora/grunt-i18n-checker');
  grunt.loadNpmTasks('grunt-swagger-generate');
  grunt.loadNpmTasks('grunt-swagger-checker');
  grunt.loadNpmTasks('grunt-puglint');

  grunt.loadTasks('tasks');

  grunt.registerTask('test-frontend', 'Test frontend code', ['test-unit-frontend']);

  grunt.registerTask('test-unit-frontend', 'Unit test frontend code', ['karma:unit']);
  grunt.registerTask('test-unit-backend', 'Test backend code', ['mochacli:backend']);

  grunt.registerTask('test-unit-storage', ['splitfiles:storage']);
  grunt.registerTask('test-midway-backend', ['splitfiles:midway']);

  grunt.registerTask('test', ['linters', 'test-frontend', 'test-unit-backend', 'test-midway-backend']);

  grunt.registerTask('i18n', 'Check the translation files', ['i18n_checker']);
  grunt.registerTask('linters', 'Check code for lint', ['eslint:all', 'lint_pattern:all', 'lint_pattern:css', 'pug-linter', 'i18n']);
  grunt.registerTask('linters-dev', 'Check changed files for lint', ['prepare-quick-lint', 'jshint:quick', 'jscs:quick', 'lint_pattern:quick']);
  grunt.registerTask('pug-linter', 'Check the pug/jade files', ['puglint:all']);
  grunt.registerTask('swagger-generate', 'Grunt plugin for swagger generate', ['swagger_generate']);
  grunt.registerTask('swagger-validate', ['swagger_checker']);

  grunt.registerTask('default', ['test']);
};
