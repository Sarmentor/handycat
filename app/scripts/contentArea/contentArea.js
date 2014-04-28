// Holds all of the translation pairs and handles the interface with the Document service
angular.module('controllers').controller('ContentAreaCtrl', ['$scope', 'Document', 'project', '$location', '$anchorScroll', '$state', '$log', function($scope, Document, project, $location, $anchorScroll, $state, $log) {
  if (Document.segments.length === 0) {
    $state.go('project');
  }
  $scope.numSegments = Document.segments.length;
  $scope.segments = Document.segments;

  // watch the flag on the Documents service
  $scope.$watch(function() {
      if (!Document.loaded)
        return false;
      else
        return Document.revision;
    },
    function() {
      $log.log("ContentAreaCtrl: Number of segments in document: " + Document.segments.length);

      // segments is a list of [source, target] pairs
      //$scope.segments = Document.segments;
      $scope.segments = Document.segments;

      $scope.xliff_content = new XMLSerializer().serializeToString( Document.DOM );
    }
  );

  // fire an event when a translation completes
  // get the next active segment from the event data, and highlight it with this controller
  // use ng-anchorscroll / ng-class?
  // we want to focus the target edit area when the segment becomes active
  $scope.$on('segmentComplete', function(e, data) {
    $log.log("segmentComplete data: ");
    $log.log(data);
    $log.log("contentArea heard segmentComplete for seg: " + data.segmentId);
    var nextSegment = project.getNextSegment(data.segmentId);
    // set the next segment on the project service
    var newSegment = 'segment-' + project.setSegment(nextSegment);

    // TODO: this causes a reload of the ng-repeat
    $location.hash(newSegment);
    $anchorScroll();

    //setFocus($("#ace_editor-" + nextSegment));
  });


  // focus the edit area -- edit areas call the translation memory onFocus
  // start by focusing project.currentSegment

}]);
