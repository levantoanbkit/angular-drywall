angular.module('device.history.index', ['ngRoute', 'security.authorization']);
angular.module('device.history.index').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider
    .when('/device/history/:id', {
      templateUrl: 'device/history/history.tpl.html',
      controller: 'DeviceHistoryCtrl',
      title: 'Lịch sử điều khiển',
      resolve: {
        authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
      }
    });
}]);
angular.module('device.history.index').controller('DeviceHistoryCtrl', [ '$scope', '$route',
  function($scope, $route){
    $scope.deviceId = $route.current.params.id;
    $scope.histories = [
      {
        time: "20/10/2017 12:00:30",
        username: "levantoanbkit@gmail.com",
        content: "$Q3CCLCT,TL,1,0,0,1,1234,3232<CR><LF>"
      },
    ];
  }]);
