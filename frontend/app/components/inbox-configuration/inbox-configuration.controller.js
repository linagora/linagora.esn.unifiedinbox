(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox')
    .controller('inboxConfigurationController', inboxConfigurationController);

  function inboxConfigurationController($scope, touchscreenDetectorService, inboxConfig) {
    var self = this;

    inboxConfig('forwarding', false).then(function(forwarding) {
      self.isForwardingEnabled = forwarding;
    });
    $scope.hasTouchscreen = touchscreenDetectorService.hasTouchscreen();
  }
})(angular);
