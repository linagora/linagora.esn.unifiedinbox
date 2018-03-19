(function() {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxSidebarUserQuotaController', inboxSidebarUserQuotaController);

  function inboxSidebarUserQuotaController($scope, $q, _, inboxUserQuotaService, bytesFilter) {
    var self = this;

    self.$onInit = $onInit;
    self.getUserQuotaLabel = getUserQuotaLabel;

    /////

    function $onInit() {
      getUserQuotaLabel().then(function(quotaInfoLabel) {
        self.quotaInfoLabel = quotaInfoLabel;
      });
    }

    function _buildLabelFromQuotaInfo(quotaInfo) {
      return bytesFilter(quotaInfo.usedStorage) + (quotaInfo.maxStorage ?
        ' / ' + bytesFilter(quotaInfo.maxStorage) + ' (' + Number(quotaInfo.storageRatio).toFixed(1) + '%)' :
        '');
    }

    function getUserQuotaLabel() {
      return inboxUserQuotaService.getUserQuotaInfo()
        .then(function(storageQuotaInfo) {
          return storageQuotaInfo && !_.isEmpty(storageQuotaInfo) ? $q.when(_buildLabelFromQuotaInfo(storageQuotaInfo)) : $q.reject(new Error('No quota info found'));
        });
    }

  }
})();
