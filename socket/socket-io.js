'use strict';

exports = module.exports = function(app, io, passportSocketIo, socketIOService) {

    io.on('connection', onConnectSocket);

    function onConnectSocket(socket) {
        var user = socket.request.user;

        socketIOService.updateUserSocket(app, socket, user);

        socket.on('data', onReceiveData);
        socket.on('disconnect', onSocketDisconnect);

        function onReceiveData(data) {
            console.log('onReceiveData on socketId=%s:',socket.id);
            console.log('onReceiveData data=:',data);
            socket.emit('data', 'hello client');
        };

        function onSocketDisconnect() {
            console.log('onSocketDisconnect: ', socket.id);
            socketIOService.removeSocket(app, socket, user);
        };

    }

};

