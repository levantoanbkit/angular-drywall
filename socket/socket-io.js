'use strict';

var tcpSocketService  = require('./tcp-socket.service');

exports = module.exports = function(app, io, passportSocketIo, socketIOService) {

    io.on('connection', onConnectSocket);

    function onConnectSocket(socket) {
        var user = socket.request.user;

        socketIOService.updateUserSocket(app, socket, user);

        socket.on('change:modebox', onChangeModeBox);
        socket.on('disconnect', onSocketDisconnect);

        function onChangeModeBox(data) {
            var tcpConnection = app.tcpConnections[data.deviceName];
            if (tcpConnection) {
                tcpConnection.socketIOs = tcpConnection.socketIOs ? tcpConnection.socketIOs : [];
                tcpSocketService.makeRemoteControlCommand(tcpConnection, data.deviceName, 'MODE', { modeBox: data.modeBox }, socket);
            }
        };

        function onSocketDisconnect() {
            console.log('onSocketDisconnect: ', socket.id);
            socketIOService.removeSocket(app, socket, user);
        };

    }

};

