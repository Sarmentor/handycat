// the segment area is the area of the UI representing a single translation unit
// this is a source + target pair
angular.module('controllers')
.controller('SegmentAreaCtrl', [
  '$rootScope', '$scope', 'TranslationMemory', 'Wikipedia',
  'Glossary', '$log', 'ruleMap', 'copyPunctuation', 'editSession',
  'Logger', 'Projects', 'XliffParser', 'graphTMUrl', 'hotkeys', 'editSession', '$http',
  function($rootScope, $scope, TranslationMemory, Wikipedia,
           Glossary, $log, ruleMap, copyPunctuation, Session,
           Logger, Projects, XliffParser, graphTMUrl, hotkeys, editSession, $http) {

    // this object tells us which translation widgets are available to the user
    $scope.widgets = {
      activeComponent: 'lmAutocomplete',
      translationSelector: false,
      AceEditor: true,
      defaultComponent: 'lmAutocomplete'
    }

    // these hotkeys are only available when the segment is active
    // they get deleted when the segment is not active
    var hotkeyConfigs = [{
      combo      : 'ctrl+enter',
      description: 'Finish a segment and move to the next one',
      allowIn    : ['INPUT', 'SELECT', 'TEXTAREA'],
      callback   : function () {
        if ($scope.isActive.active) {
          $log.log('hotkey callback');
          $log.log('index: ' + $scope.id.index);
          $scope.segmentFinished($scope.id.index);
        }
      }
    }];

    $scope.$watch(
      function() {
        return $scope.widgets.activeComponent
      },
      function(val) {
        $log.log($scope.widgets.activeComponent);
    });

    // WORKING - dynamically populate the translation options for each segment
    // user must click to populate
    // Also look at how to log which options the user selects
    // WORKING -- for any configuration, we have a set of translation providers
    // if the APIs of the translation providers are the same, we can query them all at once
    // querying the set of translation providers should be done on the backend, because we will
    // also want to get the quality estimate of each candidate from a separate module
    $scope.$watch(
      function() {
        return $scope.isActive.active;
      },
      function(isActive) {
        if (isActive) {
          // call the backend to get results from the user's translation resources
          // check the (local) cache to see if we've already queried for this segment
          // query the user's translation resources for the translations for this segment
          var d = new Date().toString();
          $scope.translationOptions = [
            {'segment': d + ' gibt es geheime Schwarzmarktgruppen im Internet, die große Mühe geben, von Strafverfolgung versteckt zu bleiben',
              'created': 'January 26, 2014',
              'quality': 0.95,
              'provider': 'Chris Hokamp'
            },
            {'segment': 'Zweifellos gibt es geheimere Schwarzmarkt-Gruppen im Internet, die große Mühe geben, Strafverfolgung verborgen bleiben.',
              'created': 'August 26, 2013',
              'quality': 0.8,
              'provider': 'Microsoft Translator'
            },
            {'segment': 'Zweifellos gibt es geheimnisSchwarzMarktGruppen im Internet, die große Mühe geben, bleiben von Strafverfolgungs versteckt.',
              'created': 'October 5, 2013',
              'quality': 0.6,
              'provider': 'Google Translate'
            },
          ];
        }
      }
    )

    // WORKING - this should be part of the 'translationSelector' component
    // create buttons for the user's translation resources -- we know what resources they have from $scope.currentUser
    // buttons appear when the translation is ready, onClick the value gets put into the editor or translation component
    // response API: {provider: <provider name>, target: <target text>}
    // databind the insertText event in the editor directive
    // this obj holds the result of querying the user's various translation resources
    $scope.translationResources = [
      //{'provider': 'HandyCAT', 'target': 'test translation'}
      {'provider': 'HandyCAT', 'target': 'test translation'}
    ];


    // TODO: call this with smart caching when the segment gets activated
    $scope.testQuery = function(sourceQuery) {
      $scope.translationsPending = true;
      var transProm = $http({
        url: 'http://localhost:5001/translate/google/de',
        method: "GET",
        params: {query: sourceQuery}
      });
      transProm.then(
        function (res) {
          $log.log('promise resolved:');
          $log.log(res);
          $scope.translationResources.push({'provider': 'HandyCAT', 'target': res.data.target})
          $scope.translationsPending = false;
        }, function (err) {
          $log.log('Error retrieving translation');
          $scope.translationsPending = false;
        })
    }

    // when the translation promise resolves, add the result to the translation options, which are also rendered to the user
    // a HandyCAT resource obj has name + url -- {'name': 'google-translate', url: '/users/:userId/tm/'}
    // TODO: the url field shouldn't actually be necessary - the server looks up resources by name
    // TODO: as a proxy to named lookup, just always call the same url from client -- i.e. /users/:userId/tm/
    // the server should look up the required user credentials for the particular resource
    $scope.queryResource = function(query, resourceObj) {
      var queryObj = { userId: $scope.currentUser._id, sourceLang: 'en-US', targetLang: 'fr-FR', query: query};

      // this is the general-purpose interface to translation components and providers
      TranslationMemory.get(queryObj, function(tmResponse) {
        $log.log('SegmentControl: Translation Memory responded');
        // TODO: ensure that the TM objects conform to the HandyCAT provenance specification
        // response API: {provider: <provider name>, target: <target text>}
        $scope.translationResources.push(tmResponse);

      });
    }


    // this function lets children update the segment model value
    // TODO: a problem with this approach is that the user cannot go back to the previous value in the editor (cannot undo)
    // TODO: to fix the undo issue, maintain an undo stack of the previous values of the target segment
    $scope.setTargetValue = function(newValue) {
      $scope.segment.target = newValue;
      // assume the user wants to go back to the default component
      $scope.widgets.activeComponent = $scope.widgets.defaultComponent;
    }

    // the id gets reset in the template
    $scope.id = {};
    // this is used to manage showing and hiding components
    $scope.isActive = { active: false };

    // possible states: ['initial', 'translated', 'reviewed', 'final']
    // use $scope.getSegmentState from the template
    $scope.getSegmentState = function(id) {
      if (typeof(id) === 'number') {
        return $scope.segments[$scope.id.index]['state'];
      }
      // segmentState may be an empty obj if the segment hasn't been initialized in the template
      return 'initial';
    }

    $scope.setSegmentState = function(state) {
      if (typeof(state) === 'string') {
        $scope.segments[$scope.id.index]['state'] = state;
      } else {
        throw 'The state name must be a string';
      }
    }

  $scope.clearEditor = function() {
   $log.log('clear editor fired on the segment control');
   $scope.$broadcast('clear-editor');
  };

  $scope.segmentFinished = function(segId) {
    segId = Number(segId);
    $log.log("SEGMENT FINISHED - segId is: " + segId);
    $scope.setSegmentState('translated');
    $scope.isActive.active = false;

    // del the keyboard shortcuts on this segment
    hotkeyConfigs.forEach(
      function(hotkeyConfig) {
        hotkeys.del(hotkeyConfig.combo);
      }
    );

    // EXPERIMENT: log the segment's original value, and its new value, along with any other relevant data
    var timestamp = new Date().getTime();
    var logData = {
      'time': timestamp,
      'user': {
        '_id': $scope.currentUser.userId,
        'name': $scope.currentUser.username
      },
      'project': {
        'name': $scope.projectResource.name,
        '_id' : $scope.projectResource._id
      },
      'action': 'segment-complete',
      'data': {
        'segmentId': segId,
        'previousValue': $scope.segment.targetDOM.textContent,
        'newValue': $scope.segment.target
      }
    }
    editSession.updateStat(logData);

    // Update the current segment in the XLIFF DOM
    // Note: the application critically relies on the targetDOM being a link into the DOM object of the XLIFF
    // Right now, we depend on $scope.segment.targetDOM.textContent and $scope.segment.target being manually synced
    $scope.segment.targetDOM.textContent = $scope.segment.target;

    // TODO: the rest of this function should be on the EditAreaCtrl because it is not specific to this segment
    // pass in the current segment as the argument -- let the segmentOrder service do the logic to determine what the next segment should be
    // - this line is CRITICAL - tells the UI to move to the next segment
    Session.focusNextSegment(segId, $scope.segments);

    // Update the project on the server by syncing with the document model
    $scope.projectResource.content = XliffParser.getDOMString($scope.document.DOM);
    $scope.projectResource.$update(function() {
      $log.log('Project updated');
    });

    // update the user's translation resources (update the TM)
    // what is the data model for a TM object { sourceLang: <sourceLang>, targetLang: <targetLang>, source: <source>, target: <target>, createdBy: <creator>, date: <date> }
    // a new TM object is (at least) two nodes, the source segment and the target segment, both containing fields for creator, date created
    // TODO: commented because there was an error proxying to the TM
    //var newTMNodes = [
    //    {'lang': $scope.document.sourceLang, 'segment': $scope.segment.source },
    //    {'lang': $scope.document.targetLang, 'segment': $scope.segment.target },
    //  ];
    //
    //var transProm = $http({
    //  url: graphTMUrl,
    //  method: "POST",
    //  data: {
    //    'nodes': newTMNodes
    //  }
    //});
    //transProm.then(
    //  function (res) {
    //    $log.log('translation memory updated, the new nodes: ');
    //    $log.log(res);
    //  }, function (err) {
    //    $log.error('Error updating the translation memory');
    //  })

  }; // end segmentFinished

  // this is called when the user clicks anywhere in the segment area
  $scope.activate = function($index) {
    // if the segment isn't already active
    if (!$scope.isActive.active) {
      $log.log('activate: ' + $index);
      $scope.reopen($index);

      // log the activation
      // EXPERIMENT: log the segment's original value, and its new value, along with any other relevant data
      var timestamp = new Date().getTime();
      var logData = {
        'time': timestamp,
        'user': {
          '_id': $scope.currentUser.userId,
          'name': $scope.currentUser.username
        },
        'project': {
          'name': $scope.projectResource.name,
          '_id' : $scope.projectResource._id
        },
        'action': 'segment-complete',
        'data': {
          'segmentId': $index,
          'currentValue': $scope.segment.target
        }
      }
      editSession.updateStat(logData);

    }
  };

  // Re-opens a finished segment. Undoes what segmentFinished() did
  // TODO: we should only show the 'SAVE' (checkmark) button once the user has actually edited something (they shouldn't need to click 'check' again)
  $scope.reopen = function(idx) {
    $log.log('REOPEN');
    Session.setSegment(idx);
  };

  // when the changeSegment event fires, each SegmentAreaCtrl scope responds
  // the change segment event is fired from changeSegment in the editSession service
  // this event is fired by editSession service
  $scope.$on('changeSegment', function(e,data) {
    // if this is the segment we activated
    if (data.currentSegment === $scope.id.index) {
      $log.log('segment: ' + $scope.id.index + ' --- heard changeSegment');

      // tell the staticTarget directive to create the editing components
      $scope.$broadcast('activate');

      // make sure the segment state is reverted to 'initial'
      $scope.setSegmentState('initial');

      // set this flag to true for the view
      $scope.isActive = {active: true};
      // configure the keyboard shortcuts for the active segment
      // You can pass it an object.  This hotkey will not be unbound unless manually removed
      // using the hotkeys.del() method
      hotkeyConfigs.forEach(function (hotkeyConfig) {
        hotkeys.add(hotkeyConfig);
      });
    } else if ($scope.isActive.active) {
      // make sure this segment is deactivated
      $scope.isActive = {active: false};

      hotkeyConfigs.forEach(
        function(hotkeyConfig) {
          hotkeys.del(hotkeyConfig.combo);
        }
      );
    }
  });

    // working - utils for autocompletion
    // TODO: use the autocompleters service to resolve the autocompleters for the user
    // GET /autocompleters --
    // params that let us know what autocompleters the user has:
    // source lang
    // target lang
    // domain
    // TODO: there should be a selection dialog where the user can choose which autocompleters they want to use
    // a user's autocompleters grow over time
    // as they select segments, we log: { source: source-text, target_prefix: target-text, completion: <selected unit from autocomplete> }
}]);
