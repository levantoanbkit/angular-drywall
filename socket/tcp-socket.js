'use strict';

var net     = require('net');
var config  = require('../config');

var connections = [];

var tcpSocketServer = net.createServer();

tcpSocketServer.on('connection', handleConnection);

tcpSocketServer.listen(config.tcpSocketPort, function() {
  console.log('Server listening tcp socket to %j', tcpSocketServer.address());
});

function handleConnection(connection) {  
  var remoteAddress = connection.remoteAddress + ':' + connection.remotePort;
  console.log('new client connection from %s', remoteAddress);

  connection.setEncoding('utf8');

  connection.on('data', onConnData);
  connection.once('close', onConnClose);
  connection.on('error', onConnError);

  function onConnData(data) {
    console.log('connection data from %s: %j', remoteAddress, data);
    //Authentication client info step
    var isValidClient = checkAuthenticationClient(connection, data);
    if (isValidClient) {
      saveConnection(connection, data);
      serverAnswerClient(connection, data);
    } else {
      handleFailureAuthentication(connection);
    }
  }

  function onConnClose() {
    console.log('connection from %s closed', remoteAddress);
    if (connections.length > 0) {
      connections.splice(connections.indexOf(connection), 1);
    }
    connection.destroy();
  }

  function onConnError(err) {
    console.log('Connection %s error: %s', remoteAddress, err.message);
    if (connections.length > 0) {
      connections.splice(connections.indexOf(connection), 1);
    }
    connection.destroy();
  }
}

function checkAuthenticationClient(connection, data) {
  // Need to implement the logic of authentication embedded client
  return true;
}

function saveConnection(connection, data) {
  // Set more info to connection
  connection.clientId = connection.remoteAddress + ':' + connection.remotePort;
  // save connection to connection list
  if (connections.indexOf(connection) === -1) {
    connections.push(connection);
  }
}

function serverAnswerClient(connection, data) {
  connection.write(data);
  connection.pipe(connection);
}

function handleFailureAuthentication(connection) {
  if (connections.length > 0) {
    connections.splice(connections.indexOf(connection), 1);
  }
  connection.end('login failure', 'utf8');
}

tcpSocketServer.on('error', function(error) {
  console.log("tcpSocketServer got problems!", error.message);
});
