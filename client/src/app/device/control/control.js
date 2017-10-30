angular.module('device.control.index', ['ngRoute', 'security.authorization']);
angular.module('device.control.index').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider
    .when('/device/control/:id', {
      templateUrl: 'device/control/control.tpl.html',
      controller: 'DeviceControlCtrl',
      title: 'Điều khiển thiết bị',
      resolve: {
        authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
      }
    });
}]);
angular.module('device.control.index').controller('DeviceControlCtrl', [ '$rootScope', '$scope', '$route', '$window', 'socketIO',
  function($rootScope, $scope, $route, $window, socketIO){
    $scope.deviceControl = {
      deviceId: $route.current.params.id,
      isConnect: 1,
      temperature: 50,
      humidity: 70,
      site: 'Dự án Tây Hồ Chí Minh',
      allMode: 1,
      modeBtn: 0,
      simMode: 0,
      functions: 'Chống úng cấp 1',
      errorCode: 23,
      devices: [
        {
          control: 1,
          status: 1,
          sensor1: 0,
          sensor2: 0,
          sensor3: 18,
          sensor4: 6
        },
        {
          control: 1,
          status: 1,
          sensor1: 0,
          sensor2: 1,
          sensor3: 10,
          sensor4: 6
        },
        {
          control: 1,
          status: 0,
          sensor1: 0,
          sensor2: 1,
          sensor3: 20,
          sensor4: 4
        },
        {
          control: 0,
          status: 1,
          sensor1: 0,
          sensor2: 0,
          sensor3: 12,
          sensor4: 6
        },
      ]
    };
  }]);
