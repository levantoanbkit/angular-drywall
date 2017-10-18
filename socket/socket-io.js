'use strict';

var sockets = [];
exports = module.exports = function(io) {

    io.on('connection', handleSocketConnection);

    function handleSocketConnection(socket) {
        console.log('handleSocketConnection...', Math.random(10));
        socket.emit('webappclient', {message : 'Hello WebApp Client', socketId: socket.id});
    }

};

