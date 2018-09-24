(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxSidebarSocialNetworksController', inboxSidebarSocialNetworksController);

  function inboxSidebarSocialNetworksController(dynamicDirectiveService) {
    var self = this;

    self.$onInit = $onInit;
    self.hasSidebarSocialNetworksGotInjections = hasSidebarSocialNetworksGotInjections;

    /////

    function $onInit() {
      self.hasSidebarSocialNetworks = self.hasSidebarSocialNetworksGotInjections();
    }

    function hasSidebarSocialNetworksGotInjections() {
      return dynamicDirectiveService.getInjections('inbox-sidebar', {}).length > 0;
    }
  }
})(angular);
