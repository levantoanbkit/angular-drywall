'use strict';
var _ = require('lodash');

var tcpSocketService = {
    parseDataToObject: function(app, connection, data) {
        var parseDataObject = {};
        var parseData = data.split(",");
        if (parseData.length < 2) {
            if (connection.deviceName) {
                tcpSocketService.removeConnectionInList(app, connection);
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
                if (parseDataObject.sttDevice != 255) {
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
    },
    checkAuthenDevice: function(app, connection, parseDataObject) {
        var deviceName  = parseDataObject.deviceName;
        var cmdName     = parseDataObject.cmdName;
        if (!deviceName || !cmdName || parseDataObject.isWrongSyntax) return false;
        if ((connection.deviceName == deviceName) ||  cmdName == 'LOGIN') {
            return true;
        }
        return false;
    },

    saveConnectionInfo: function(app, connection, parseDataObject) {
        connection.deviceName = parseDataObject.deviceName;
        _.assignIn(app.tcpConnections, { [connection.deviceName] : connection });
        // console.log('app.tcpConnections: ', app.tcpConnections);
    },

    forceEndConnection: function(app, connection, parseDataObject) {
        tcpSocketService.removeConnectionInList(app, connection);
        var deviceName = connection.deviceName ? connection.deviceName : parseDataObject.deviceName;
        connection.end(deviceName + ',INACTIVED\r\n', 'utf8');
    },

    removeConnectionInList: function(app, connection) {
        app.tcpConnections = _.omit(app.tcpConnections, connection.deviceName);
    },

    buildControlCommand: function(deviceName, cmdName, params) {
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
            case 'ALL':
                command += '\r\n';
                isValidCommand = true;
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
    },

    replyToDevice: function(app, connection, data, parseDataObject) {
        if (parseDataObject.cmdName == 'LI' || parseDataObject.cmdName == 'LOGIN') {
          connection.write(data+'\r\n');
        }
    },

    processAnswerOfClient: function(app, connection, data, parseDataObject) {
        if (parseDataObject.cmdName == 'TL' || parseDataObject.cmdName == 'DK' ||
            parseDataObject.cmdName == 'MODE' || parseDataObject.cmdName == 'LI' ||
            parseDataObject.cmdName == 'XO') {
            app.io.sockets.emit('answer_from_devices', { data: parseDataObject, cmd: data });
        }
    },

    makeRemoteControlCommand: function(app, connection, deviceName, cmdName, params) {
        // Get current tcpsocket connection of device has name is deviceName
        // connection.socketIOs.push(socket);
        var commandString = tcpSocketService.buildControlCommand(deviceName, cmdName, params);
        if (connection && commandString) {
            console.log('commandString: ', commandString);
            // console.log('connection command: ', connection);
            connection.write(commandString);
        } else {
            console.log('Connection of deviceName %s is not exist or command is not valid', deviceName);
        }
        return true;
    },

    callSocketIoBroadcastUserFunction: function(app, parseDataObject) {
        // Implemet Socket.io in here to broadcast control data of devices to User WebApp
    }

};
module.exports = tcpSocketService;