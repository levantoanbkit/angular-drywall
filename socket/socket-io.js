'use strict';

var tcpSocketService  = require('./tcp-socket.service');
var _ = require('lodash');

exports = module.exports = function(app, passportSocketIo, socketIOService) {

    app.io.on('connection', onConnectSocket);

    var interval = setInterval(function() {
        var liveDeviceNames = [];
        _.forEach(app.tcpConnections, function(tcpConnection) {
            console.log("hello interval...: ",tcpConnection.deviceName);
            tcpSocketService.makeRemoteControlCommand(app, tcpConnection, tcpConnection.deviceName, 'ALL', {});
            liveDeviceNames.push(tcpConnection.deviceName);
        });
        app.io.sockets.emit('info:ping_live_devices', { deviceNames: liveDeviceNames });
    }, 4000);

    function onConnectSocket(socket) {
        var user = socket.request.user;

        socketIOService.updateUserSocket(app, socket, user);

        socket.on('change:modebox', onChangeModeBox);
        socket.on('control:device', onControlDevice);
        socket.on('ask:deviceinfo', onAskSerialDeviceInfo);
        socket.on('ask:allinfo', onAskAllInfo);

        socket.on('disconnect', onSocketDisconnect);

        function onChangeModeBox(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                // tcpConnection.socketIOs = tcpConnection.socketIOs ? tcpConnection.socketIOs : [];
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

        function onSocketDisconnect() {
            console.log('onSocketDisconnect: ', socket.id);
            socketIOService.removeSocket(app, socket, user);
        };

    }

};

