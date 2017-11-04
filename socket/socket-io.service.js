'use strict';
var _ = require('lodash');

var socketIOService = {
    onAuthorizeSuccess: function(data, accept){
        console.log('successful connection to socket.io');
        accept();
    },
     
    onAuthorizeFail: function(data, message, error, accept){
        if(error)  throw new Error(message);
        console.log('failed connection to socket.io:', message);
        return accept(new Error(message));
    },

    updateUserSocket: function(app, socket, user) {
        var userSocket = app.socketIOConnections[user.username];
        if (!userSocket) {
            _.assignIn(app.socketIOConnections, { [user.username] : {id : socket.id , socket : socket} });
        } else if (userSocket.id != socket.id) {
            app.socketIOConnections[user.username] = socket;
        }
        // console.log('app.socketIOConnections: ', app.socketIOConnections);
    },

    removeSocket: function(app, socket, user) {
        if (app.socketIOConnections[user.username]) {
            app.socketIOConnections = _.omit(app.socketIOConnections, user.username);
        }
        // console.log('app.socketIOConnections after disconnect: ', app.socketIOConnections);
    }

};
module.exports = socketIOService;