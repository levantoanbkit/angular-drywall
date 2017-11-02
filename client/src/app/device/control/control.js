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
    
    $scope.deviceId = $route.current.params.id;
    $scope.deviceName = "$Q3CCLCT";
    $scope.isConnect = 1;
    $scope.temperature = 50;
    $scope.humidity = 70;
    $scope.site = 'Dự án Tây Hồ Chí Minh';
    $scope.modeBox = 1;
    $scope.modeBtn = 0;
    $scope.simMode = 0;
    $scope.functions = 'Chống úng cấp 1';
    $scope.errorCode = 23;

    $scope.device1 = { control: 1, status: 1, sensor1: 0, sensor2: 0, sensor3: 18, sensor4: 6};
    $scope.device2 = { control: 1, status: 1, sensor1: 0, sensor2: 0, sensor3: 18, sensor4: 6};
    $scope.device3 = { control: 1, status: 1, sensor1: 0, sensor2: 0, sensor3: 18, sensor4: 6};
    $scope.device4 = { control: 1, status: 1, sensor1: 0, sensor2: 0, sensor3: 18, sensor4: 6};

    $scope.changeModeBox = function(mode) {
      console.log('isConnect changeModeBox: ', socketIO.socketObject);
      socketIO.emit('change:modebox', {
        modeBox: mode,
        deviceId: $scope.deviceId,
        deviceName: $scope.deviceName
      });
    };

    $scope.controlDevice = function(deviceIndex, mode) {
      console.log('isConnect controlDevice: ', socketIO.socketObject);
      socketIO.emit('control:device', {
        sttDevice: deviceIndex,
        valueControl: mode,
        deviceId: $scope.deviceId,
        deviceName: $scope.deviceName
      });
    };

    var askDeviceInfo = function(deviceIndex) {
      console.log('isConnect askDeviceInfo: ', socketIO.socketObject);
      socketIO.emit('ask:deviceinfo', {
        sttDevice: deviceIndex,
        deviceId: $scope.deviceId,
        deviceName: $scope.deviceName
      });
    };

    var handleTLCommand = function(data) {
      console.log('toanlv1');
      if (data.sttDevice == 255) {
        console.log('toanlv2');
        $scope.modeBox = data.currentActiveModeBox;
        $scope.modeBtn = data.statusModeBtnOnBox;
        $scope.simMode = data.statusModeSIMonBox;
        $scope.errorCode = data.errorCode;
        $scope.temperature = data.temperatureBox;
        $scope.humidity = data.humidityBox;
      } else {
        console.log('toanlv3: ',data.sttDevice);
        switch(data.sttDevice) {
          case '1':
            $scope.device1.status = data.statusDevice;
            $scope.device1.sensor1 = data.sensorValue1;
            $scope.device1.sensor2 = data.sensorValue2;
            $scope.device1.sensor3 = data.sensorValue3;
            $scope.device1.sensor4 = data.sensorValue4;
            console.log('toanlv4');
            break;
          case '2':
            $scope.device2.status = data.statusDevice;
            $scope.device2.sensor1 = data.sensorValue1;
            $scope.device2.sensor2 = data.sensorValue2;
            $scope.device2.sensor3 = data.sensorValue3;
            $scope.device2.sensor4 = data.sensorValue4;
            break;
          case '3':
            $scope.device3.status = data.statusDevice;
            $scope.device3.sensor1 = data.sensorValue1;
            $scope.device3.sensor2 = data.sensorValue2;
            $scope.device3.sensor3 = data.sensorValue3;
            $scope.device3.sensor4 = data.sensorValue4;
            break;
          case '4':
            $scope.device4.status = data.statusDevice;
            $scope.device4.sensor1 = data.sensorValue1;
            $scope.device4.sensor2 = data.sensorValue2;
            $scope.device4.sensor3 = data.sensorValue3;
            $scope.device4.sensor4 = data.sensorValue4;
            break;
          default:
            console.log('toanlv5');
            break;
        }
      }
    };

    var handleDKCommand = function(data) {

    };

    var handleMODECommand = function(data) {

    };

    var handleLICommand = function(data) {

    };

    var handleXOCommand = function(data) {

    };

    socketIO.on('answer_from_devices', function(data) {
      console.log('answer_from_devices : ', data);
      switch(data.cmdName) {
        case 'TL':
          console.log('hihi');
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

    askDeviceInfo(255);
    askDeviceInfo(1);
    askDeviceInfo(2);
    askDeviceInfo(3);
    askDeviceInfo(4);

  }]);
