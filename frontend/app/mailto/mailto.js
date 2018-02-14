(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.mailto', [
    'restangular',
    'angularMoment',
    'uuid4',
    'ng.deviceDetector',
    'op.dynamicDirective',
    'ngTagsInput',
    'mgcrea.ngStrap.modal',

    'linagora.esn.unifiedinbox',
    'linagora.esn.graceperiod',

    'esn.router',
    'esn.box-overlay',
    'esn.jmap-client-wrapper',
    'esn.notification',
    'esn.file',
    'esn.profile',
    'esn.summernote-wrapper',
    'esn.attendee',
    'esn.scroll',
    'esn.header',
    'esn.offline-wrapper',
    'esn.lodash-wrapper',
    'esn.desktop-utils',
    'esn.form.helper',
    'esn.background',
    'esn.configuration',
    'esn.core',
    'esn.escape-html',
    'esn.async-action',
    'esn.user',
    'esn.session',
    'esn.escape-html',
    'esn.registry',
    'esn.module-registry',
    'esn.user-configuration',
    'esn.datetime',
    'esn.i18n',
    'esn.http',
    'esn.promise'
  ]);

})(angular);
