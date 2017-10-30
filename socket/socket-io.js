'use strict';

var tcpSocketService  = require('./tcp-socket.service');

exports = module.exports = function(app, io, passportSocketIo, socketIOService) {

    io.on('connection', onConnectSocket);

    function onConnectSocket(socket) {
        var user = socket.request.user;

        socketIOService.updateUserSocket(app, socket, user);

        socket.on('change:modebox', onChangeAllModeBox);
        socket.on('disconnect', onSocketDisconnect);

        function onChangeAllModeBox(data) {
            console.log('onChangeAllModeBox on socketId=%s:',socket.id);
            console.log('onChangeAllModeBox data=:',data);
            socket.emit('result', data);
            var deviceName = data.deviceName;
            var cmdName = 'MODE';
            var params = { modeBox: data.modeBox };
            tcpSocketService.makeRemoteControlCommand(app, deviceName, cmdName, params, socket);
        };

        function onSocketDisconnect() {
            console.log('onSocketDisconnect: ', socket.id);
            socketIOService.removeSocket(app, socket, user);
        };

    }

};

