angular.module('controllers').controller('UploadCtrl',
  ['$scope', 'fileReader', '$timeout', 'XliffParser', '$state', '$log',
  function($scope, fileReader, $timeout, XliffParser, $state, $log) {
// TODO: remember that different file types will require different parsers
// try to select which parser we want based on the file extension

  // does the browser support drag n drop? - assume yes
  $scope.fileAdded = false;
  $scope.dropSupported = false;
  $scope.selectedFiles = [];

  $scope.$watch(
    function() {
      return $scope.dropSupported;
    },
    function() {
      $log.log('UploadCtrl: dropSupported changed to: ' + $scope.dropSupported);
    }
  );

  // make sure that a file has been uploaded, parse it, and transition to translation
  $scope.startTranslation = function() {
    // use the fileReader service to read the file (via the HTML5 FileAPI)
    // assume there's only a single file in the array for now
    XliffParser.readFile($scope.selectedFiles[0]);
// TODO: only initiate this transition if the file is successfully loaded and parsed
    $state.go('projects.translate');
  };

// TODO: get file type (assume xlf for now)
  $scope.onFileSelect = function ($files) {
    $log.log("inside file select");
    $scope.fileAdded = true;

    // show the user what the selected files are
    // assume this is a single file for now
    $scope.selectedFiles = $files;
    $log.log('SCOPE FILES');
    $log.log($files);

    // parse the file immediately when it is selected
    var xliffPromise = XliffParser.readFile($scope.selectedFiles[0]);
    $log.log('xliffPromise: ');
    $log.log(xliffPromise);
      xliffPromise.then(
      function(documentObj) {
        $log.log('documentObj is: ');
        $log.log(documentObj);
        // TODO: refactor XLIFF parsing functions into browser XML parsing and application data extracti
        // $scope.$parent is createProjectCtrl
        $scope.$parent.pendingDocument = documentObj.DOM;
        $log.log('$scope.$parent');
        $log.log($scope.$parent);
      }
    );
  };

// TODO: implement fileProgress from the xliffParser
  $scope.$on("fileProgress", function(e, progress) {
    $scope.progress = progress.loaded / progress.total;
  });

}]);
