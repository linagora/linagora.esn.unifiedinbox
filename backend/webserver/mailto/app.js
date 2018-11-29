const path = require('path');

const FRONTEND_JS_PATH = path.join(__dirname, '../../../frontend/app/');

const mailtoCoreAngularModules = [
  'esn.jmap-client-wrapper',
  'esn.notification',
  'esn.file',
  'esn.box-overlay',
  'esn.profile',
  'esn.summernote-wrapper',
  'esn.attendee',
  'esn.scroll',
  'esn.offline-wrapper',
  'esn.lodash-wrapper',
  'esn.desktop-utils',
  'esn.form.helper',
  'esn.url',
  'esn.background',
  'esn.configuration',
  'esn.core',
  'esn.async-action',
  'esn.user',
  'esn.session',
  'esn.registry',
  'esn.module-registry',
  'esn.user-configuration',
  'esn.datetime',
  'esn.i18n',
  'esn.http',
  'esn.promise',
  'esn.object-type',
  'esn.domain',
  'esn.feature-registry',
  'esn.email-addresses-wrapper',
  'esn.escape-html',
  'esn.chips'
];

const mailtoAngularJsFiles = [
  'constants.js',
  'services.js',
  'controllers.js',
  'directives/main.js'
];

const mailtoInboxAngularAppFiles = [
  'mailto/mailto.js',
  'mailto/mailto.mocks.js',
  'mailto/mailto.constants.js',
  'mailto/mailto.config.js',
  'mailto/mailto.run.js',
  'services/config/config.js',
  'services/new-composer/new-composer.js',
  'services/jmap-helper/jmap-helper.js',
  'services/email-body/email-body.js',
  'services/with-jmap-client/with-jmap-client.js',
  'services/jmap-client-provider/jmap-client-provider.js',
  'services/generate-jwt-token/generate-jwt-token.js',
  'services/identities/identities-service.js',
  'services/mailboxes/mailboxes-service.js',
  'services/mailboxes/shared-mailboxes.js',
  'services/mailboxes/shared-mailboxes.constants.js',
  'services/mailboxes/special-mailboxes.js',
  'services/mailto-parser/mailto-parser.js',
  'services/user-quota/user-quota-service.js',
  'services/user-quota/user-quota-service.constants.js',
  'services/hook/email-sending-hook.service.js',
  'services/attachment-upload/inbox-attachment-upload.service.js',
  'services/attachment-provider-registry/attachment-provider-registry.service.js',
  'services/attachment-jmap/attachment-jmap.service.js',
  'services/attachment-jmap/attachment-jmap.constants.js',
  'services/attachment-jmap/attachment-jmap.run.js',
  'services/request-receipts/request-receipts.constants.js',
  'services/request-receipts/request-receipts-service.js',
  'services/draft/draft.js',
  'components/attachment-alternative-uploader/attachment-alternative-uploader-modal.service.js',
  'components/attachment-alternative-uploader/attachment-alternative-uploader-modal.controller.js',
  'components/composer/body-editor/html/composer-body-editor-html.js',
  'components/composer/body-editor/html/composer-body-editor-html.controller.js',
  'components/composer/body-editor/text/composer-body-editor-text.js',
  'components/composer/body-editor/text/composer-body-editor-text.controller.js',
  'components/composer/composer.js',
  'components/composer/composer.controller.js',
  'components/composer/attachments/composer-attachments.js',
  'components/composer/attachments/composer-attachments.controller.js',
  'components/composer/boxed/composer-boxed.js',
  'components/composer/mobile/composer-mobile.js',
  'components/composer/mobile/composer-mobile.controller.js',
  'components/composer/identity-selector/composer-identity-selector.js',
  'components/composer/identity-selector/composer-identity-selector.controller.js',
  'components/composer/attachments-selector/composer-attachments-selector.js',
  'components/composer/attachments-selector/composer-attachments-selector.controller.js',
  'components/inbox-configuration/read-receipt/read-receipt.component.js',
  'components/inbox-configuration/read-receipt/read-receipt.controller.js',
  'components/banner/vacation-banner/vacation-banner.component.js',
  'components/banner/vacation-banner/vacation-banner.controller.js',
  'components/banner/quota-banner/quota-banner.component.js',
  'components/banner/quota-banner/quota-banner.controller.js'
];

module.exports = dependencies => {
  const webserverWrapper = dependencies('webserver-wrapper');

  const files = mailtoInboxAngularAppFiles.concat(mailtoAngularJsFiles);

  webserverWrapper.requestCoreFrontendInjections('mailto', mailtoCoreAngularModules);
  webserverWrapper.injectAngularAppModules('unifiedinbox', files, 'linagora.esn.unifiedinbox.mailto', ['mailto'], {
    localJsFiles: files.map(file => path.join(FRONTEND_JS_PATH, file))
  });
};
