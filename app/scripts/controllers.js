angular.module('controllers', []);
//angular.module('editorComponentsApp.controllers', []);

angular.module('controllers')
.controller('StatsController', ['$scope', 'session', function($scope, session) {

  $scope.log = session.log;
  $scope.stats = session.stats;

}]);

angular.module('controllers').controller('ReplaceCtrl', [ '$scope', '$rootScope', '$modalInstance', '$log',
  function($scope, $rootScope, $modalInstance, $log) {
  // TODO log the opening of the modal
  $scope.data = {original:'', change:''};

  $scope.apply = function() {
    var edit = {
      operation:'find-and-replace',
      original:$scope.data.original,
      change:$scope.data.change
    };
    // TODO log
    $rootScope.$broadcast('propagate-action', edit);
    $modalInstance.close();
  };

  $scope.cancel = function () {
    // TODO log
    $modalInstance.dismiss('cancel');
  };


}]);