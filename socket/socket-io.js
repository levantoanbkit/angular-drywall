'use strict';

var sockets = {};
exports = module.exports = function(io) {

    io.on('connection', handleSocketConnection);

    function handleSocketConnection(socket) {
        
    }

};

