'use strict';

var net     = require('net');
var config  = require('../config');
var _ = require('lodash');

var connections = {};

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
    var parseDataObject = parseDataToObject(connection, data);
    var isAuthenDevice = checkAuthenDevice(connection, parseDataObject);
    if (isAuthenDevice) {
      saveConnectionInfo(connection, parseDataObject);
      serverAnswerClient(connection, data);
      // just demo for call remoteControlCommand
      // makeRemoteControlCommand(parseDataObject.deviceName, 'MODE', {});
    } else {
      forceEndConnection(connection, parseDataObject);
    }
  }

  function onConnClose() {
    console.log('connection from %s closed', remoteAddress);
    removeConnectionInList(connection);
    connection.destroy();
  }

  function onConnError(err) {
    console.log('Connection %s error: %s', remoteAddress, err.message);
    removeConnectionInList(connection);
    connection.destroy();
  }
}

function checkAuthenDevice(connection, parseDataObject) {
  var deviceName  = parseDataObject.deviceName;
  var cmdName     = parseDataObject.cmdName;
  if (!deviceName || !cmdName || parseDataObject.isWrongSyntax) return false;
  if ((connection.deviceName == deviceName) ||  cmdName == 'LOGIN') {
    return true;
  }
  return false;
}

function saveConnectionInfo(connection, parseDataObject) {
  connection.deviceName = parseDataObject.deviceName;
  if (!connections[connection.deviceName]) {
    _.assignIn(connections, { [connection.deviceName] : connection });
  }
  console.log('connections: ', connections);
}

function serverAnswerClient(connection, data) {
  connection.write(data);
  connection.pipe(connection);
}

function forceEndConnection(connection, parseDataObject) {
  removeConnectionInList(connection);
  var deviceName = connection.deviceName ? connection.deviceName : parseDataObject.deviceName;
  connection.end(deviceName + ',INACTIVED\r\n', 'utf8');
}

function removeConnectionInList(connection) {
  var tempConn = connections[connection.deviceName];
  if (tempConn) {
    connections = _.omit(connections, connection.deviceName);
  }
}

function parseDataToObject(connection, data) {
  var parseDataObject = {};
  var parseData = data.replace(/(?:\\[rn]|[\r\n]+)+/g, "").split(",");
  if (parseData.length < 2) {
    if (connection.deviceName) {
      removeConnectionInList(connection);
      connection.end(connection.deviceName + ',INACTIVED\r\n', 'utf8');
    } else {
      connection.destroy();
    }
  }
  parseDataObject.deviceName  = parseData[0];
  parseDataObject.cmdName     = parseData[1];
  switch(parseDataObject.cmdName) {
    case 'LOGIN':
      parseDataObject.isWrongSyntax = false;
      break;
    case 'LI':
      parseDataObject.isWrongSyntax = false;
      break;
    case 'MODE':
      parseDataObject.isWrongSyntax = false;
      parseDataObject.modeBox    = parseData[2];
      break;
    case 'TL':
      parseDataObject.isWrongSyntax = false;
      parseDataObject.sttDevice     = parseData[2];
      if (parseDataObject.sttDevice == 255) {
        parseDataObject.statusDevice  = parseData[3];
        parseDataObject.sensorValue1  = parseData[4];
        parseDataObject.sensorValue2  = parseData[5];
        parseDataObject.sensorValue3  = parseData[6];
        parseDataObject.sensorValue4  = parseData[7];
      } else {
        parseDataObject.currentActiveModeBox = parseData[3];
        parseDataObject.statusModeBtnOnBox   = parseData[4];
        parseDataObject.statusModeSIMonBox   = parseData[5];
        parseDataObject.errorCode            = parseData[6];
        parseDataObject.temperatureBox       = parseData[7];
        parseDataObject.humidityBox          = parseData[8];
      }
      break;
    case 'DK':
      parseDataObject.isWrongSyntax = false;
      parseDataObject.sttDevice     = parseData[2];
      parseDataObject.valueControl  = parseData[3];
      break;
    case 'XO':
      parseDataObject.isWrongSyntax = false;
      parseDataObject.sttDevice     = parseData[2];
      break;
    default:
      parseDataObject.isWrongSyntax = true;
      break;
  }
  return parseDataObject;
}

function buildControlCommand(deviceName, cmdName, params) {
  var command = deviceName + ',' + cmdName;
  var isValidCommand = false;
  var passOfBox = 'dkb2017hcm';
  switch(cmdName) {
    case 'KT':
      if (params.sttDevice > 0) {
        command += ',' + params.sttDevice + '\r\n';
        isValidCommand = true;
      }
      break;
    case 'MODE':
      if (params.modeBox == 0 || params.modeBox == 1) {
        command += ',' + params.modeBox + '\r\n';
        isValidCommand = true;
      }
      break;
    case 'DK':
      if (params.sttDevice > 0 && (params.valueControl == 0 || params.valueControl == 1)) {
        command += ',' + params.sttDevice + ',' + params.valueControl + '\r\n';
        isValidCommand = true;
      }
      break;
    case 'XO':
      if (params.sttDevice) {
        command += ',' + params.sttDevice + '\r\n';
        isValidCommand = true;
      }
      break;
    case 'ID':
      if (params.newDeviceName && params.passOfBox == passOfBox) {
        command += ',' + params.newDeviceName + ',' + params.passOfBox + '\r\n';
        isValidCommand = true;
      }
      break;
    case 'IPS':
      if (params.newIPServer && params.passOfBox == passOfBox) {
        command += ',' + params.newIPServer + ',' + params.passOfBox + '\r\n';
        isValidCommand = true;
      }
      break;
    case 'PORTS':
      if (params.newPortServer && params.passOfBox == passOfBox) {
        command += ',' + params.newPortServer + ',' + params.passOfBox + '\r\n';
        isValidCommand = true;
      }
      break;
    case 'RSTPW':
      if (params.passOfBox == passOfBox) {
        command += ',' + params.passOfBox + '\r\n';
        isValidCommand = true;
      }
      break;
  }
  return isValidCommand ? command : '';
}

function makeRemoteControlCommand(deviceName, cmdName, params) {
  // Get current tcpsocket connection of device has name is deviceName
  var connection = connections[deviceName];
  var commandString = buildControlCommand(deviceName, cmdName, params);
  if (connection && commandString) {
    serverAnswerClient(connection, commandString);
  } else {
    console.log('Connection of deviceName %s is not exist or command is not valid', deviceName);
  }
}

function callSocketIoBroadcastUserFunction(parseDataObject) {
  // Implemet Socket.io in here to broadcast control data of devices to User WebApp
}

tcpSocketServer.on('error', function(error) {
  console.log("tcpSocketServer got problems!", error.message);
});
