'use strict';

exports = module.exports = function(app, io, passportSocketIo, socketIOService) {

    io.on('connection', onConnectSocket);

    function onConnectSocket(socket) {
        // console.log('socket ...:', socket.request.user);
        var isValid = checkAuthenticationSocket();

        socket.on('data', onReceiveData);
        socket.on('disconnect', onSocketDisconnect);

        function onReceiveData(data) {
            console.log('onReceiveData on socketId=%s:',socket.id);
            console.log('onReceiveData data=:',data);
            socket.emit('data', 'hello client');
        };

        function onSocketDisconnect() {
            console.log('onSocketDisconnect: ', socket.id);
        };

        function checkAuthenticationSocket() {
            console.log('checkAuthenticationSocket socketId:',socket.id);

        };

    }

};

