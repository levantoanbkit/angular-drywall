'use strict';

var tcpSocketService  = require('./tcp-socket.service');
var _ = require('lodash');

exports = module.exports = function(app, passportSocketIo, socketIOService) {

    app.io.on('connection', onConnectSocket);

    var interval = setInterval(function() {
        _.forEach(app.tcpConnections, function(tcpConnection) {
            console.log("hello interval...: ",tcpConnection.deviceName);
            tcpSocketService.makeRemoteControlCommand(app, tcpConnection, tcpConnection.deviceName, 'ALL', {});
        });
    }, 4000);

    function onConnectSocket(socket) {
        var user = socket.request.user;

        socketIOService.updateUserSocket(app, socket, user);

        socket.on('change:modebox', onChangeModeBox);
        socket.on('control:device', onControlDevice);
        socket.on('ask:deviceinfo', onAskSerialDeviceInfo);
        socket.on('ask:allinfo', onAskAllInfo);
        socket.on('xo:resetSensor', onResetSensor);
        socket.on('set:mobileNumber', onSetMobileNumber);
        socket.on('get:allMobileNumbers', onGetAllMobileNumbers);

        socket.on('set:newBoxName', onSetNewBoxName);
        socket.on('set:newIP', onSetNewIP);
        socket.on('set:newPort', onSetNewPort);
        socket.on('reset:box', onResetBox);

        socket.on('disconnect', onSocketDisconnect);

        function onChangeModeBox(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'MODE', { modeBox: data.modeBox });
            } else {
                console.log('onChangeModeBox: tcpConnection is disconnected...');
            }
        };

        function onControlDevice(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'DK', { sttDevice: data.sttDevice, valueControl: data.valueControl });
            } else {
                console.log('onControlDevice: tcpConnection is disconnected...');
            }
        };

        function onAskSerialDeviceInfo(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'KT', { sttDevice: data.sttDevice });
            } else {
                console.log('onAskDeviceInfo: tcpConnection is disconnected...');
            }
        };

        function onAskAllInfo(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'ALL', {});
            } else {
                console.log('onAskAllInfo: tcpConnection is disconnected...');
            }
        };

        function onResetSensor(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'XO', { sttDevice: data.sttDevice });
            } else {
                console.log('onResetSensor: tcpConnection is disconnected...');
            }
        };

        function onSetMobileNumber(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'SETTEL', { stt: data.stt, mobileNumber: data.mobileNumber });
            } else {
                console.log('onSetMobileNumber: tcpConnection is disconnected...');
            }
        };

        function onGetAllMobileNumbers(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'GETTEL', {});
            } else {
                console.log('onGetAllMobileNumbers: tcpConnection is disconnected...');
            }
        };

        function onSetNewBoxName(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'ID', { newBoxName: data.newBoxName, passOfBox: 'dkb2017hcm' });
            } else {
                console.log('onSetNewBoxName: tcpConnection is disconnected...');
            }
        };

        function onSetNewIP(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'IPS', { newIP: data.newIP, passOfBox: 'dkb2017hcm' });
            } else {
                console.log('onSetNewIP: tcpConnection is disconnected...');
            }
        };

        function onSetNewPort(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'PORTS', { newPort: data.newPort, passOfBox: 'dkb2017hcm' });
            } else {
                console.log('onSetNewPort: tcpConnection is disconnected...');
            }
        };

        function onResetBox(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'RSTPW', { passOfBox: 'dkb2017hcm' });
            } else {
                console.log('onResetBox: tcpConnection is disconnected...');
            }
        };

        function onSocketDisconnect() {
            console.log('onSocketDisconnect: ', socket.id);
            socketIOService.removeSocket(app, socket, user);
        };

    }

};

