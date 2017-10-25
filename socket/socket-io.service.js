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
    

};
module.exports = socketIOService;