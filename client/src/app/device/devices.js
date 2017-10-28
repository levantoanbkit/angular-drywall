angular.module('device.index', ['ngRoute', 'security.authorization']);
angular.module('device.index').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider
    .when('/devices', {
      templateUrl: 'device/devices.tpl.html',
      controller: 'DevicesCtrl',
      title: 'Danh sách thiết bị',
      resolve: {
        authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
      }
    });
}]);
angular.module('device.index').controller('DevicesCtrl', [ '$scope', '$location',
  function($scope, $location){
    $scope.openPage = function(page, deviceId) {
      var redirectUrl = '';
      switch (page) {
        case 'control':
          redirectUrl = '/device/control/'+ deviceId;
          $location.path(redirectUrl);
          break;
        case 'history':
          redirectUrl = '/device/history/'+ deviceId;
          $location.path(redirectUrl);
          break;
      }
    };

  }]);
