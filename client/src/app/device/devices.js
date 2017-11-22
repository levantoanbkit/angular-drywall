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
angular.module('device.index').controller('DevicesCtrl', ['$rootScope', '$scope', '$location', '$window', '$http', 'socketIO', 'security',
  function($rootScope, $scope, $location, $window, $http, socketIO, security){
    console.log('socketIO ID:', socketIO.socketObject);
    $scope.isAdmin = security.isAdmin();
    $http.get('/data/site.json').then(function(result) {
      $scope.data = result.data;
      $scope.originData = result.data;;
    });
    $scope.selectedSite = "";
    $scope.sites = [
      {label: "Tất cả dự án", value: ""}, 
      {label: "Dự án Hồ Chí Minh", value: "1"}, 
      {label: "Dự án Hà Nội", value: "2"},
      {label: "Dự án Phú Yên", value: "3"},
      {label: "Dự án Bình Định", value: "4"},
      {label: "Dự án Khánh Hoà", value: "5"},
      {label: "Dự án Đà Nẵng", value: "6"}
    ];
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

    $scope.selectSite = function() {
      if ($scope.selectedSite == "") {
        $scope.data = $scope.originData;
      } else {
        $scope.data = [];
        $scope.originData.forEach(function(device) {
          if (device.siteId == $scope.selectedSite) {
            $scope.data.push(device);
          }
        });
      }
    };
  }]);
