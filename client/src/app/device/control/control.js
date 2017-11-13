angular.module('device.control.index', ['ngRoute', 'security.authorization', 'services.controlLogResource', 'security.service']);
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
angular.module('device.control.index').controller('DeviceControlCtrl', [ '$rootScope', '$scope', '$route', '$window', '$http', '$interval', '$location', 'security', 'socketIO', 'ngDialog', 'controlLogResource',
  function($rootScope, $scope, $route, $window, $http, $interval, $location, security, socketIO, ngDialog, controlLogResource) {

    $scope.isAdmin = security.isAdmin();
    $scope.currentUser = security.currentUser;
    
    var deviceName = '$' + $route.current.params.id;

    $http.get('/data/mockup.json').then(function(result) {
      $scope.deviceId = $route.current.params.id;
      $scope.data = result.data[$scope.deviceId];
      console.log('data: ', $scope.data);
      askAllInfo();
    });

    $scope.changeModeBox = function(mode) {
      console.log('isConnect changeModeBox: ', socketIO.socketObject);
      if (!$scope.isAdmin) {
        console.log('Tài khoản này không phải là Admin | changeModeBox');
        openWarningAdminDialog();
        return false;
      }

      if ($scope.data.isConnect != 1) {
        openWarningConnectionDialog();
        return false;
      }
      $scope.commandChangeModeBox = deviceName + ",MODE," + mode + "\r\n";
      socketIO.emit('change:modebox', {
        modeBox: mode,
        deviceId: $scope.data.deviceId,
        deviceName: deviceName
      });
      saveControlLog($scope.commandChangeModeBox);
    };

    $scope.controlDevice = function(deviceIndex, mode) {
      console.log('isConnect controlDevice: ', socketIO.socketObject);
      if (!$scope.isAdmin) {
        console.log('Tài khoản này không phải là Admin | controlDevice');
        openWarningAdminDialog();
        return false;
      }
      if ($scope.data.isConnect != 1) {
        openWarningConnectionDialog();
        return false;
      }
      $scope.commandControlDevice = deviceName + ",DK," + deviceIndex + ","+ mode + "\r\n";
      checkEmptyWaterDevice(deviceIndex, mode);
    };

    $scope.goToHistory = function() {
      $location.path('/device/history/'+ $route.current.params.id);
    };

    var saveControlLog = function(command) {
      var deviceId = $route.current.params.id;
      var username = $scope.currentUser.username;
      controlLogResource.addUControlLog(deviceId, username, command).then(function(data) {
        console.log('saveControlLog: ', data);
      });
    };

    var checkEmptyWaterDevice = function(deviceIndex, mode) {
      switch (deviceIndex) {
        case 1:
          handleEmptyWater($scope.data.device1, deviceIndex, mode);
          break;
        case 2:
          handleEmptyWater($scope.data.device2, deviceIndex, mode);
          break;
        case 3:
          handleEmptyWater($scope.data.device3, deviceIndex, mode);
          break;
        case 4:
          handleEmptyWater($scope.data.device4, deviceIndex, mode);
          break;
        default:
          break;
      }
    };

    var handleEmptyWater = function(deviceData, deviceIndex, mode) {
      var sensor1 = deviceData.sensor1;
      var sensor2 = deviceData.sensor2;
      if (sensor1 == sensor2 && sensor1 == 0 && mode == 1) {
        openWarningEmptyWaterDialog(deviceIndex, mode);
      } else {
        console.log('emit DK Device...');
        socketIO.emit('control:device', {
          sttDevice: deviceIndex,
          valueControl: mode,
          deviceId: $scope.data.deviceId,
          deviceName: deviceName
        });
        saveControlLog($scope.commandControlDevice);
      }
    };

    var openWarningEmptyWaterDialog = function(deviceIndex, mode) {
      var dialog = ngDialog.open({
        template: '<p style="color: red;"><i class="fa fa-warning"></i> Cảnh báo</p>\
                  <p>Hiện tại không còn nước để bơm!</p>\
                  <p style="font-weight: bold;">Bạn có muốn bật không?</p>\
                  <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">Không</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="closeThisDialog(2)">Có</button>\
                  </div>',
        plain: true,
        height: 150
      });
      dialog.closePromise.then(function (data) {
        console.log('dialog data: ', data);
        if (data.value == 2) {
          console.log('emit DK Device dialog...');
          socketIO.emit('control:device', {
            sttDevice: deviceIndex,
            valueControl: mode,
            deviceId: $scope.data.deviceId,
            deviceName: deviceName
          });
          saveControlLog($scope.commandControlDevice);
        } else {
          return false;
        }
      });
    };

    var openWarningAdminDialog = function() {
      ngDialog.open({
        template: '<p style="color: red;"><i class="fa fa-warning"></i> Cảnh báo</p><p style="font-weight: bold;">Bạn không phải là Admin, do vậy không thể thực hiện thao tác điều khiển này !</p>',
        plain: true,
        height: 100
      });
    };

    var openWarningConnectionDialog = function() {
      ngDialog.open({
        template: '<p style="color: red;"><i class="fa fa-warning"></i> Cảnh báo</p><p style="font-weight: bold;">Hiện tại kết nối bị ngắt!</p>',
        plain: true,
        height: 100
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
            $scope.data.device1.status = data.statusDevice;
            $scope.data.device1.sensor1 = data.sensorValue1;
            $scope.data.device1.sensor2 = data.sensorValue2;
            $scope.data.device1.sensor3 = data.sensorValue3;
            $scope.data.device1.sensor4 = data.sensorValue4;
            break;
          case '2':
            $scope.data.device2.status = data.statusDevice;
            $scope.data.device2.sensor1 = data.sensorValue1;
            $scope.data.device2.sensor2 = data.sensorValue2;
            $scope.data.device2.sensor3 = data.sensorValue3;
            $scope.data.device2.sensor4 = data.sensorValue4;
            break;
          case '3':
            $scope.data.device3.status = data.statusDevice;
            $scope.data.device3.sensor1 = data.sensorValue1;
            $scope.data.device3.sensor2 = data.sensorValue2;
            $scope.data.device3.sensor3 = data.sensorValue3;
            $scope.data.device3.sensor4 = data.sensorValue4;
            break;
          case '4':
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
    };

    var handleMODECommand = function(data) {
    };

    var handleLICommand = function(data) {
    };

    var handleXOCommand = function(data) {
    };

    socketIO.on('answer_from_devices', function(messageData) {
      var data = messageData.data;
      var command = messageData.cmd;
      if (data.deviceName != deviceName) {
        return true;
      }
      console.log('answer_from_devices : ', data);
      $scope.data.isConnect = 1;
      switch(data.cmdName) {
        case 'TL':
          handleTLCommand(data);
          break;
        case 'DK':
          handleDKCommand(data);
          // saveControlLog(command);
          break;
        case 'MODE':
          handleMODECommand(data);
          // saveControlLog(command);
          break;
        case 'LI':
          handleLICommand(data);
          break;
        case 'XO':
          handleXOCommand(data);
          // saveControlLog(command);
          break;
        default:
          break;
      }
    });

    socketIO.on('result:deviceinfo', function(data) {
      console.log('result:deviceinfo : ', data);
    });

  }]);
