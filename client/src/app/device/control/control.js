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
angular.module('device.control.index').controller('DeviceControlCtrl', [ '$rootScope', '$scope', '$route', '$window', '$http', '$interval', 'socketIO',
  function($rootScope, $scope, $route, $window, $http, $interval, socketIO) {
    var deviceName = '$' + $route.current.params.id;
    $http.get('/data/mockup.json').then(function(result) {
      $scope.deviceId = $route.current.params.id;
      $scope.data = result.data[$scope.deviceId];
      console.log('data: ', $scope.data);
      askAllInfo();
      var intervalPromise = $interval(function() {
        console.log('interval call askAllInfo...');
        askAllInfo();
      }, 2000);
    });

    $scope.changeModeBox = function(mode) {
      console.log('isConnect changeModeBox: ', socketIO.socketObject);
      socketIO.emit('change:modebox', {
        modeBox: mode,
        deviceId: $scope.data.deviceId,
        deviceName: deviceName
      });
    };

    $scope.controlDevice = function(deviceIndex, mode) {
      console.log('isConnect controlDevice: ', socketIO.socketObject);
      socketIO.emit('control:device', {
        sttDevice: deviceIndex,
        valueControl: mode,
        deviceId: $scope.data.deviceId,
        deviceName: deviceName
      });
    };

    var askDeviceInfo = function(deviceIndex) {
      console.log('isConnect askDeviceInfo: ', socketIO.socketObject);
      socketIO.emit('ask:deviceinfo', {
        sttDevice: deviceIndex,
        deviceId: $scope.data.deviceId,
        deviceName: deviceName
      });
    };

    var askAllInfo = function() {
      console.log('isConnect askAllInfo: ', socketIO.socketObject);
      socketIO.emit('ask:allinfo', {
        deviceId: $scope.data.deviceId,
        deviceName: deviceName
      });
    };

    var handleTLCommand = function(data) {
      if (data.sttDevice == 255) {
        $scope.data.modeBox = data.currentActiveModeBox;
        $scope.data.modeBtn = data.statusModeBtnOnBox;
        $scope.data.simMode = data.statusModeSIMonBox;
        $scope.data.errorCode = data.errorCode;
        $scope.data.temperature = data.temperatureBox;
        $scope.data.humidity = data.humidityBox;
      } else {

        switch(data.sttDevice) {
          case '1':
            if ($scope.data.device1.control < 0) {
              $scope.data.device1.control = data.statusDevice;
            }
            $scope.data.device1.control = data.statusDevice;
            $scope.data.device1.status = data.statusDevice;
            $scope.data.device1.sensor1 = data.sensorValue1;
            $scope.data.device1.sensor2 = data.sensorValue2;
            $scope.data.device1.sensor3 = data.sensorValue3;
            $scope.data.device1.sensor4 = data.sensorValue4;
            break;
          case '2':
            if ($scope.data.device2.control < 0) {
              $scope.data.device2.control = data.statusDevice;
            }
            $scope.data.device2.status = data.statusDevice;
            $scope.data.device2.sensor1 = data.sensorValue1;
            $scope.data.device2.sensor2 = data.sensorValue2;
            $scope.data.device2.sensor3 = data.sensorValue3;
            $scope.data.device2.sensor4 = data.sensorValue4;
            break;
          case '3':
            if ($scope.data.device3.control < 0) {
              $scope.data.device3.control = data.statusDevice;
            }
            $scope.data.device3.status = data.statusDevice;
            $scope.data.device3.sensor1 = data.sensorValue1;
            $scope.data.device3.sensor2 = data.sensorValue2;
            $scope.data.device3.sensor3 = data.sensorValue3;
            $scope.data.device3.sensor4 = data.sensorValue4;
            break;
          case '4':
            if ($scope.data.device4.control < 0) {
              $scope.data.device4.control = data.statusDevice;
            }
            $scope.data.device4.status = data.statusDevice;
            $scope.data.device4.sensor1 = data.sensorValue1;
            $scope.data.device4.sensor2 = data.sensorValue2;
            $scope.data.device4.sensor3 = data.sensorValue3;
            $scope.data.device4.sensor4 = data.sensorValue4;
            break;
          default:
            break;
        }
      }
    };

    var handleDKCommand = function(data) {
      if (data.sttDevice == 255) {
        $scope.data.modeBox = data.valueControl;
      } else {
        switch (data.sttDevice) {
          case '1':
            $scope.data.device1.control = data.valueControl;
            $scope.data.device1.status = data.valueControl;
            break;
          case '2':
            $scope.data.device2.control = data.valueControl;
            $scope.data.device2.status = data.valueControl;
            break;
          case '3':
            $scope.data.device3.control = data.valueControl;
            $scope.data.device3.status = data.valueControl;
            break;
          case '4':
            $scope.data.device4.control = data.valueControl;
            $scope.data.device4.status = data.valueControl;
            break;
          default:
            break;
        }
      }
    };

    var handleMODECommand = function(data) {
      $scope.data.modeBox = data.modeBox;
    };

    var handleLICommand = function(data) {
      $scope.data.isConnect = 1;
    };

    var handleXOCommand = function(data) {

    };

    socketIO.on('answer_from_devices', function(data) {
      console.log('answer_from_devices : ', data);
      if (data.deviceName != deviceName) {
        return true;
      }
      $scope.data.isConnect = 1;
      switch(data.cmdName) {
        case 'TL':
          handleTLCommand(data);
          break;
        case 'DK':
          handleDKCommand(data);
          break;
        case 'MODE':
          handleMODECommand(data);
          break;
        case 'LI':
          handleLICommand(data);
          break;
        case 'XO':
          handleXOCommand(data);
          break;
        default:
          break;
      }
    });

    socketIO.on('result:deviceinfo', function(data) {
      console.log('result:deviceinfo : ', data);
    });

  }]);
