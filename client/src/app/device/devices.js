angular.module('device.index', ['ngRoute', 'security.authorization', 'security.service']);
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
angular.module('device.index').controller('DevicesCtrl', ['$rootScope', '$scope', '$location', '$window', 'socketIO', 'security',
  function($rootScope, $scope, $location, $window, socketIO, security){
    console.log('socketIO ID:', socketIO.socketObject);
    $scope.isAdmin = security.isAdmin();
    $scope.openPage = function(page, deviceId) {
      var redirectUrl = '';
      switch (page) {
        case 'control':
          redirectUrl = '/device/control/'+ deviceId;
          if (socketIO.socketObject.connected) {
            $location.path(redirectUrl);
          } else {
            $window.location.href = redirectUrl;
          }
          break;
        case 'history':
          redirectUrl = '/device/history/'+ deviceId;
          $location.path(redirectUrl);
          break;
      }
    };

  }]);
