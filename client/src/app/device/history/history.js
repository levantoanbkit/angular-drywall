angular.module('device.history.index', ['ngRoute', 'security.authorization', 'services.controlLogResource']);
angular.module('device.history.index').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider
    .when('/device/history/:id', {
      templateUrl: 'device/history/history.tpl.html',
      controller: 'DeviceHistoryCtrl',
      title: 'Lịch sử điều khiển',
      resolve: {
        authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser,
      }
    });
}]);
angular.module('device.history.index').controller('DeviceHistoryCtrl', [ '$scope', '$route', '$location', '$log', 'controlLogResource',
  function($scope, $route, $location, $log, controlLogResource){

    $scope.deviceId = $route.current.params.id;

    $scope.filters = {
      device: $route.current.params.id
    };

    var deserializeData = function(data) {
      $scope.items = data.items;
      $scope.pages = data.pages;
      $scope.filters = data.filters;
      $scope.histories = data.data;
    };

    var fetchControlLogs = function(){
      controlLogResource.findControlLogs($scope.filters).then(function(data){
        console.log('data fetchControlLogs: ', data);
        deserializeData(data);

      }, function(e){
        $log.error(e);
      });
    };

    $scope.prev = function(){
      $scope.filters.page = $scope.pages.prev;
      fetchControlLogs();
    };
    $scope.next = function(){
      $scope.filters.page = $scope.pages.next;
      fetchControlLogs();
    };
    fetchControlLogs();
  }]);
