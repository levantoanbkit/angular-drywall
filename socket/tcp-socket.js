'use strict';

var net     = require('net');
var config  = require('../config');
var tcpSocketService  = require('./tcp-socket.service');

exports = module.exports = function(app) {

  app.tcpSocketServer = net.createServer();
  app.tcpSocketServer.on('connection', onConnection);

  app.tcpSocketServer.listen(config.tcpSocketPort, function() {
    console.log('Server listening tcp socket to %j', app.tcpSocketServer.address());
  });

  app.tcpSocketServer.on('error', function(error) {
    console.log("app.tcpSocketServer got problems!", error.message);
  });

  function onConnection(connection) {
    var remoteAddress = connection.remoteAddress + ':' + connection.remotePort;
    console.log('new device connection from %s', remoteAddress);

    connection.setEncoding('utf8');
    connection.setNoDelay(true);
    connection.on('data', onConnData);
    connection.once('close', onConnClose);
    connection.on('error', onConnError);

    function onConnData(data) {
      console.log('connection data from %s: %j', remoteAddress, data);
      var parseDataObject = tcpSocketService.parseDataToObject(app, connection, data);
      var isAuthenDevice = tcpSocketService.checkAuthenDevice(app, connection, parseDataObject);
      if (isAuthenDevice) {
        tcpSocketService.saveConnectionInfo(app, connection, parseDataObject);
        if (parseDataObject.cmdName == 'LI') {
          connection.write(data);
        }
      } else {
        tcpSocketService.forceEndConnection(app, connection, parseDataObject);
      }
    };

    function onConnClose() {
      console.log('connection from %s closed', remoteAddress);
      tcpSocketService.removeConnectionInList(app, connection);
      connection.destroy();
    };

    function onConnError(err) {
      console.log('Connection %s error: %s', remoteAddress, err.message);
      tcpSocketService.removeConnectionInList(app, connection);
      connection.destroy();
    };
  };
};
