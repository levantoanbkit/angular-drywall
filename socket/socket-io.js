'use strict';

var tcpSocketService  = require('./tcp-socket.service');

exports = module.exports = function(app, passportSocketIo, socketIOService) {

    app.io.on('connection', onConnectSocket);

    function onConnectSocket(socket) {
        var user = socket.request.user;

        socketIOService.updateUserSocket(app, socket, user);

        socket.on('change:modebox', onChangeModeBox);
        socket.on('control:device', onControlDevice);
        socket.on('ask:deviceinfo', onAskDeviceInfo);

        socket.on('disconnect', onSocketDisconnect);

        function onChangeModeBox(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                // tcpConnection.socketIOs = tcpConnection.socketIOs ? tcpConnection.socketIOs : [];
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'MODE', { modeBox: data.modeBox }, socket);
            } else {
                console.log('onChangeModeBox: tcpConnection is disconnected...');
            }
        };

        function onControlDevice(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'DK', 
                    { sttDevice: data.sttDevice, valueControl: data.valueControl }, socket);
            } else {
                console.log('onControlDevice: tcpConnection is disconnected...');
            }
        };

        function onAskDeviceInfo(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpSocketService.makeRemoteControlCommand(app, tcpConnection, data.deviceName, 'KT', 
                    { sttDevice: data.sttDevice }, socket);
            } else {
                console.log('onAskDeviceInfo: tcpConnection is disconnected...');
            }
        };

        function onSocketDisconnect() {
            console.log('onSocketDisconnect: ', socket.id);
            socketIOService.removeSocket(app, socket, user);
        };

    }

};

