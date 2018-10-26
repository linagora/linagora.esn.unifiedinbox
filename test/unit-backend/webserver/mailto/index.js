'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const q = require('q');

describe('The mailto controller', function() {

  describe('The router', function() {
    it('should set a valid express response', function(done) {

      const getFunctionMock = sinon.stub().returns(q.when('fr'));

      const i18nMock = {
        i18nConfigTemplate: {
          fullLocales: {
            fr: 'fr-FR'
          }
        }
      };

      const esnConfigMock = function(key) {
        expect(key).to.equal('language');

        return {
          inModule: function(key) {
            expect(key).to.equal('core');

            return {
              forUser: function() {

                return {
                  get: getFunctionMock
                };
              }
            };
          }
        };
      };

      this.moduleHelpers.addDep('esn-config', esnConfigMock);
      this.moduleHelpers.addDep('i18n', i18nMock);
      this.moduleHelpers.addDep('assets', {
        envAwareApp: function() {
          return 'asset';
        }
      });

      const controller = require('../../../../backend/webserver/mailto/controller')(this.moduleHelpers.dependencies);

      const req = {
        user: {
          _id: 1234
        }
      };

      const res = {
        status: function(status) {
          expect(status).to.be.equal(200);

          return {render: res.render};
        },
        render: function(templatePath, options) {
          expect(getFunctionMock).to.have.been.called;
          expect(options.fullLocale).to.deep.equal('fr-FR');
          done();
        }
      };

      controller.renderMailto(req, res);
    });
  });
});
