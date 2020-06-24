(function(angular) {
  angular.module('linagora.esn.unifiedinbox')
    .directive('dateToMoment', dateToMoment);

  function dateToMoment(moment) {
    var directive = {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$parsers.unshift(ensureModelHasMoment);

        function ensureModelHasMoment(value) {
          var result = moment(value);

          return result.isValid() ? result : undefined;
        }
      }
    };

    return directive;
  }
})(angular);
