angular.module('device.control.index', ['ngRoute', 'security.authorization', 'services.controlLogResource', 'security.service', 'timer']);
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
    
    $scope.deviceName = '$' + $route.current.params.id;

    $scope.socketIOBoxName = 'answer_from_devices' + $scope.deviceName;

    $http.get('/data/mockup.json').then(function(result) {
      $scope.deviceId = $route.current.params.id;
      $scope.data = result.data[$scope.deviceId];
      $scope.undefineData = result.data[$scope.deviceId];
    });

    $scope.baseKeyTimer = 'device' + $scope.deviceName + '_running_timer_key';
    // $scope.startDate1 = $window.sessionStorage.getItem($scope.baseKeyTimer + '1');
    // $scope.startDate2 = $window.sessionStorage.getItem($scope.baseKeyTimer + '2');
    // $scope.startDate3 = $window.sessionStorage.getItem($scope.baseKeyTimer + '3');
    // $scope.startDate4 = $window.sessionStorage.getItem($scope.baseKeyTimer + '4');

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
      socketIO.emit('change:modebox', {
        modeBox: mode,
        deviceId: $scope.data.deviceId,
        deviceName: $scope.deviceName
      });
      $scope.contentModeBox = mappingCommandToContent('MODE', { modeBox: mode });
      saveControlLog($scope.contentModeBox);
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
      $scope.contentControlDevice = mappingCommandToContent('DK', { sttDevice: deviceIndex, status: mode });
      checkEmptyWaterDevice(deviceIndex, mode);
    };

    $scope.resetSensor = function(sttDevice) {
      console.log('isConnect resetSensor: ', socketIO.socketObject);
      if (!$scope.isAdmin) {
        console.log('Tài khoản này không phải là Admin | controlDevice');
        openWarningAdminDialog();
        return false;
      }
      if ($scope.data.isConnect != 1) {
        openWarningConnectionDialog();
        return false;
      }
      openResetSensorDialog(sttDevice);
    };

    $scope.goToHistory = function() {
      $location.path('/device/history/'+ $route.current.params.id);
    };

    var saveControlLog = function(content) {
      var deviceId = $route.current.params.id;
      var username = $scope.currentUser.username;
      controlLogResource.addUControlLog(deviceId, username, content).then(function(data) {
        console.log('saveControlLog: ', data);
      });
    };

    var mappingCommandToContent = function(cmdName, data) {
      var content = "";
      switch (cmdName) {
        case 'MODE':
          if (data.modeBox == 1) {
            content = "Set Mode tự động";
          }
          if (data.modeBox == 0) {
            content = "Set Mode bằng tay";
          }
          break;
        case 'DK':
          if (data.status == 1) {
            content = "Bật bơm "+ data.sttDevice;
          }
          if (data.status == 0) {
            content = "Tắt bơm " + data.sttDevice;
          }
          break;
        case 'XO':
          if (data.sttDevice == 255) {
            content = "Reset cảm biến tủ điện";
          }
          if (data.sttDevice >=1 && data.sttDevice <=4) {
            content = "Reset cảm biến bơm " + data.sttDevice;
          }
          break;
        case 'IPS':
          content = "Đổi IP =" + data.newIP;
          break;
        case 'PORTS':
          content = "Đổi Port =" + data.newPort;
          break;
        case 'ID':
          content = "Đổi tên tủ điện thành: " + data.newBoxName;
          break;
        case 'RSTPW':
          content = "Reset tủ điều khiển";
          break;
        case 'SETTEL':
          content = "Ghi SĐT " + data.mobileNumber + " vào vị trí " + data.stt;
          break;
        case 'GETTEL_ALL':
          content = "Xem danh sách SĐT điều khiển";
          break;
        default:
          break;
      }
      return content;
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
        socketIO.emit('control:device', {
          sttDevice: deviceIndex,
          valueControl: mode,
          deviceId: $scope.data.deviceId,
          deviceName: $scope.deviceName
        });
        saveControlLog($scope.contentControlDevice);
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
          socketIO.emit('control:device', {
            sttDevice: deviceIndex,
            valueControl: mode,
            deviceId: $scope.data.deviceId,
            deviceName: $scope.deviceName
          });
          saveControlLog($scope.contentControlDevice);
        } else {
          return false;
        }
      });
    };

    var openResetSensorDialog = function(sttDevice) {
      var templateHtml = '';
      if (sttDevice == 255) {
        templateHtml = '<p style="color: red;"><i class="fa fa-warning"></i> Cảnh báo</p>\
                  <p style="font-weight: bold;">Bạn có chắc chắn reset cảm biến của Tủ điện không?</p>\
                  <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">Không</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="closeThisDialog(2)">Có</button>\
                  </div>';
      } else if (sttDevice >= 1 && sttDevice <=4) {
        templateHtml = '<p style="color: red;"><i class="fa fa-warning"></i> Cảnh báo</p>\
                  <p style="font-weight: bold;">Bạn có chắc chắn reset cảm biến của Bơm '+ sttDevice +'?</p>\
                  <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">Không</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="closeThisDialog(2)">Có</button>\
                  </div>';
      }
      if (templateHtml) {
        var dialog = ngDialog.open({
          template: templateHtml,
          plain: true,
          height: 150
        });
        dialog.closePromise.then(function (data) {
          if (data.value == 2) {
            socketIO.emit('xo:resetSensor', {
              sttDevice: sttDevice,
              deviceId: $scope.data.deviceId,
              deviceName: $scope.deviceName
            });
            $scope.contentXO = mappingCommandToContent('XO', { sttDevice: sttDevice });
            saveControlLog($scope.contentXO);
          } else {
            return false;
          }
        });
      }
      
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
        deviceName: $scope.deviceName
      });
    };

    var askAllInfo = function() {
      console.log('isConnect askAllInfo: ', socketIO.socketObject);
      socketIO.emit('ask:allinfo', {
        deviceId: $scope.data.deviceId,
        deviceName: $scope.deviceName
      });
    };

    // var handleTimer = function(newStatusDevice, oldStatusDevice, sttDevice) {
    //   var currentDateTime = new Date();
    //   var deviceStorageTimer = $window.sessionStorage.getItem($scope.baseKeyTimer + '' + sttDevice);
    //   if (newStatusDevice == 1 && !deviceStorageTimer) {
    //     $window.sessionStorage.setItem($scope.baseKeyTimer + '' + sttDevice, currentDateTime);
    //     return currentDateTime;
    //   } else if (newStatusDevice == 1 && deviceStorageTimer) {
    //     return deviceStorageTimer;
    //   } else if (newStatusDevice == 0) {
    //     $window.sessionStorage.removeItem($scope.baseKeyTimer + '' + sttDevice);
    //     return undefined;
    //   }
    // };

    var handleTLCommand = function(data) {
      if (data.sttDevice == 255) {
        $scope.data.modeBox = data.currentActiveModeBox;
        $scope.data.modeBtn = data.statusModeBtnOnBox;
        $scope.data.simMode = data.statusModeSIMonBox;
        $scope.data.temperature = data.temperatureBox;
        $scope.data.humidity = data.humidityBox;
        if (data.errorCode) {
          mappingErrorCodeToText(data.errorCode);
        }
      } else {
        var offset = Date.now() - data.timerDevice - 4000;
        var defaultOffsetTimer = offset >= 16000 ? 16000 : (offset >= 10000 ? 10000 : 8000);
        if (data.isNewTimer) {
          $window.sessionStorage.setItem($scope.baseKeyTimer + '' + data.sttDevice, offset);
        }
        var offsetTimer = parseInt($window.sessionStorage.getItem($scope.baseKeyTimer + '' + data.sttDevice)) || defaultOffsetTimer;
        console.log("defaultOffsetTimer : ", defaultOffsetTimer);
        console.log("offsetTimer : ", offsetTimer);
        switch(data.sttDevice) {
          case '1':
            // $scope.startDate1 = handleTimer(data.statusDevice, $scope.data.device1.status, data.sttDevice);
            $scope.data.device1.status = data.statusDevice;
            $scope.data.device1.sensor1 = data.sensorValue1;
            $scope.data.device1.sensor2 = data.sensorValue2;
            $scope.data.device1.sensor3 = data.sensorValue3;
            $scope.data.device1.sensor4 = data.sensorValue4;
            $scope.startDate1 = data.timerDevice ? (data.timerDevice + offsetTimer) : undefined;
            break;
          case '2':
            // $scope.startDate2 = handleTimer(data.statusDevice, $scope.data.device2.status, data.sttDevice);
            $scope.data.device2.status = data.statusDevice;
            $scope.data.device2.sensor1 = data.sensorValue1;
            $scope.data.device2.sensor2 = data.sensorValue2;
            $scope.data.device2.sensor3 = data.sensorValue3;
            $scope.data.device2.sensor4 = data.sensorValue4;
            $scope.startDate2 = data.timerDevice ? (data.timerDevice + offsetTimer) : undefined;
            break;
          case '3':
            // $scope.startDate3 = handleTimer(data.statusDevice, $scope.data.device3.status, data.sttDevice);
            $scope.data.device3.status = data.statusDevice;
            $scope.data.device3.sensor1 = data.sensorValue1;
            $scope.data.device3.sensor2 = data.sensorValue2;
            $scope.data.device3.sensor3 = data.sensorValue3;
            $scope.data.device3.sensor4 = data.sensorValue4;
            $scope.startDate3 = data.timerDevice ? (data.timerDevice + offsetTimer) : undefined;
            break;
          case '4':
            // $scope.startDate4 = handleTimer(data.statusDevice, $scope.data.device4.status, data.sttDevice);
            $scope.data.device4.status = data.statusDevice;
            $scope.data.device4.sensor1 = data.sensorValue1;
            $scope.data.device4.sensor2 = data.sensorValue2;
            $scope.data.device4.sensor3 = data.sensorValue3;
            $scope.data.device4.sensor4 = data.sensorValue4;
            $scope.startDate4 = data.timerDevice ? (data.timerDevice + offsetTimer) : undefined;
            break;
          default:
            break;
        }
      }
    };

    var handleTLTELCommand = function(data) {
      console.log('log data handleTLTEL:', data);
      if (data.sttTel == 1) {
        $scope.data.mobileNumber1 = data.mobileNumber;
      } else if (data.sttTel == 2) {
        $scope.data.mobileNumber2 = data.mobileNumber;
      } else if (data.sttTel == 3) {
        $scope.data.mobileNumber3 = data.mobileNumber;
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

    socketIO.on($scope.socketIOBoxName, function(messageData) {
      var data = messageData.data;
      var command = messageData.cmd;
      if (data.deviceName == $scope.deviceName) {
        console.log('answer_from_devices : ', data);
        $interval.cancel($scope.promiseInterval);
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
          case 'TLTEL':
            handleTLTELCommand(data);
            break;
          default:
            break;
        }
      }
      $scope.raisePromiseInterval();
    });

    $scope.raisePromiseInterval = function() {
      $scope.promiseInterval = $interval(function() {
        console.log('promiseIntervals running...');
        $scope.$applyAsync(function() {
          $scope.data.isConnect = 0;
          $http.get('/data/mockup.json').then(function(result) {
            $scope.data = result.data[$scope.deviceId];
          }).catch(function (error) {
            console.log('error load mockup: ', error);
            console.log('scope.undefineData: ', $scope.undefineData);
            $scope.data = $scope.undefineData;
          });
        });
      }, 10000);
    };

    var mappingErrorCodeToText = function(errorCode) {
      $http.get('/data/error-code.json').then(function(result) {
        $scope.data.errorCode = result.data[errorCode];
      });
    };

    $scope.raisePromiseInterval();

    $scope.saveMobileNumber = function(sttNumber, mobileNumber) {
      console.log('isConnect saveMobileNumber: ', socketIO.socketObject);
      socketIO.emit('set:mobileNumber', {
        stt: sttNumber,
        mobileNumber: mobileNumber,
        deviceId: $scope.data.deviceId,
        deviceName: $scope.deviceName
      });
      $scope.contentMobileNumber = mappingCommandToContent('SETTEL', { stt: sttNumber, mobileNumber: mobileNumber });
      saveControlLog($scope.contentMobileNumber);
    };

    var openMobileNumberDialog = function() {
      var dialog = ngDialog.open({
        template: '<p style="color: red;"><i class="fa fa-warning"></i> Cảnh báo</p>\
                  <p>Bạn có chắc chắn lưu SĐT vừa nhập ?</p>\
                  <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">Không</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="closeThisDialog(2)">Có</button>\
                  </div>',
        plain: true,
        height: 150
      });
      dialog.closePromise.then(function (data) {
        if (data.value == 2) {
          if ($scope.mobileNumbers[0]) {
            $scope.saveMobileNumber(1, $scope.mobileNumbers[0]);
          }
          if ($scope.mobileNumbers[1]) {
            $scope.saveMobileNumber(2, $scope.mobileNumbers[1]);
          }
          if ($scope.mobileNumbers[2]) {
            $scope.saveMobileNumber(3, $scope.mobileNumbers[2]);
          }
          return true;
        } else {
          return false;
        }
      });
    };

    $scope.setMobileNumber = function() {
      if (!$scope.isAdmin) {
        console.log('Tài khoản này không phải là Admin | setMobileNumber');
        openWarningAdminDialog();
        return false;
      }

      if ($scope.data.isConnect != 1) {
        openWarningConnectionDialog();
        return false;
      }
      $scope.mobileNumbers = $scope.data.mobileNumberStr.split(",");
      openMobileNumberDialog();
    };

    $scope.viewMobileNumbers = function() {
      console.log('isConnect viewMobileNumbers: ', socketIO.socketObject);
      if (!$scope.isAdmin) {
        console.log('Tài khoản này không phải là Admin | viewMobileNumbers');
        openWarningAdminDialog();
        return false;
      }

      if ($scope.data.isConnect != 1) {
        openWarningConnectionDialog();
        return false;
      }
      socketIO.emit('get:allMobileNumbers', {
        deviceId: $scope.data.deviceId,
        deviceName: $scope.deviceName
      });
      $scope.contentGetMobileNumber = mappingCommandToContent('GETTEL_ALL', {});
      saveControlLog($scope.contentGetMobileNumber);
    };

    $scope.setNewBoxName = function() {
      console.log("newBoxName: ", $scope.data.newBoxName);
      if (!$scope.data.newBoxName) {
        return false;
      }
      if (!$scope.isAdmin) {
        console.log('Tài khoản này không phải là Admin | setMobileNumber');
        openWarningAdminDialog();
        return false;
      }

      if ($scope.data.isConnect != 1) {
        openWarningConnectionDialog();
        return false;
      }
      socketIO.emit('set:newBoxName', {
        newBoxName: $scope.data.newBoxName,
        deviceId: $scope.data.deviceId,
        deviceName: $scope.deviceName
      });
      $scope.contentNewBoxName = mappingCommandToContent('ID', { newBoxName: $scope.data.newBoxName });
      saveControlLog($scope.contentNewBoxName);
    };

    $scope.setNewIP = function() {
      console.log("newIP: ", $scope.data.newIP);
      if (!$scope.data.newIP) {
        return false;
      }
      if (!$scope.isAdmin) {
        console.log('Tài khoản này không phải là Admin | setMobileNumber');
        openWarningAdminDialog();
        return false;
      }

      if ($scope.data.isConnect != 1) {
        openWarningConnectionDialog();
        return false;
      }
      socketIO.emit('set:newIP', {
        newIP: $scope.data.newIP,
        deviceId: $scope.data.deviceId,
        deviceName: $scope.deviceName
      });
      $scope.contentNewIP = mappingCommandToContent('IPS', { newIP: $scope.data.newIP });
      saveControlLog($scope.contentNewIP);
    };

    $scope.setNewPort = function() {
      console.log("newPort: ", $scope.data.newPort);
      if (parseInt($scope.data.newPort) <= 0 || !$scope.data.newPort) {
        return false;
      }
      if (!$scope.isAdmin) {
        console.log('Tài khoản này không phải là Admin | setMobileNumber');
        openWarningAdminDialog();
        return false;
      }

      if ($scope.data.isConnect != 1) {
        openWarningConnectionDialog();
        return false;
      }
      socketIO.emit('set:newPort', {
        newPort: $scope.data.newPort,
        deviceId: $scope.data.deviceId,
        deviceName: $scope.deviceName
      });
      $scope.contentNewPort = mappingCommandToContent('PORTS', { newPort: $scope.data.newPort });
      saveControlLog($scope.contentNewPort);
    };
    
    $scope.resetBox = function() {
      console.log("resetBox");
      if (!$scope.isAdmin) {
        console.log('Tài khoản này không phải là Admin | setMobileNumber');
        openWarningAdminDialog();
        return false;
      }

      if ($scope.data.isConnect != 1) {
        openWarningConnectionDialog();
        return false;
      }
      socketIO.emit('reset:box', {
        deviceId: $scope.data.deviceId,
        deviceName: $scope.deviceName
      });
      $scope.contentResetBox = mappingCommandToContent('RSTPW', {});
      saveControlLog($scope.contentResetBox);
    };

  }]);
