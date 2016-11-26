const iotf = require("ibmiotf");
const fs = require('fs');
const request = require('request');
const http = require('http');
const mkdirp = require('mkdirp');
const config = require("./../config_gateway.json");
const cmdHandler = require('./../helper_methods/command_handler');
const htmlParser = require('./../helper_methods/html_parser');
const mqttClient = require('./../mqtt/mqtt_local_gateway');
const constants = require('./../constants.json');

exports.gatewayClient;

function runManaged(startLocalMqtt) {
    gatewayClient = new iotf.IotfManagedGateway(config.GATEWAY_DEVICE_CREDENTIALS);

    gatewayClient.log.setLevel('debug');

    gatewayClient.connect();

    gatewayClient.on('connect', function(){
         gatewayClient.manageGateway(4000);

        let devices = [
            {
                id : 'd08c7b150016',
                type : 'fullsens'
            }
        ];

        gatewayClient.subscribeToDeviceCommand(devices[0].type, devices[0].id);

        gatewayClient.publishDeviceEvent("E103", 2, "json", '{"d" : { "cpu" : 60, "mem" : 50 }}', 0);
        startLocalMqtt();

            console.log(devices);
            for(let device of devices) {
                let deviceId = device.id.replace(/:/g, "");
                gatewayClient.manageDevice(device.type, deviceId, 4000, true, true);
            }
    });

    gatewayClient.on('firmwareDownload', function(payload, deviceInfo) {
        console.log(payload);
        gatewayClient.changeState(payload.type, payload.id, gatewayClient.FIRMWARESTATE.DOWNLOADING);
        cmdHandler.handleCommand(payload, constants.FIRMWARE_DOWNLOAD);
    });

    gatewayClient.on('firmwareUpdate', function(payload, deviceInfo) {
        gatewayClient.changeUpdateState(payload.type, payload.id, gatewayClient.FIRMWAREUPDATESTATE.IN_PROGRESS);
        cmdHandler.handleCommand(payload, constants.FIRMWARE_UPDATE);
    });

    gatewayClient.on('command', function(type, id, commandName, commandFormat, payload, topic){
        console.log("Command received");
        console.log("Type: %s  ID: %s  \nCommand Name : %s Format: %s",type, id, commandName, commandFormat);
        console.log("Payload : %s",payload);
        payload = JSON.parse(payload);
        payload.id = id;
        payload.type = type;
        cmdHandler.handleCommand(payload, constants.IMAGE_DOWNLOAD);
    });

    gatewayClient.on('disconnect', function(){
        console.log('Disconnected from IoTF');
    });

    gatewayClient.on('error', function (argument) {
        console.log(argument);
        process.exit(1);
    });
}

exports.deviceActionResponse = (payload) => {
    if (payload.state === constants.SUCCESS) {
        if (payload.cmd === constants.FIRMWARE_UPDATE) {
            setTimeout(function () {
                gatewayClient.changeUpdateState(payload.type, payload.id, gatewayClient.FIRMWAREUPDATESTATE.SUCCESS);
                gatewayClient.changeState(payload.type, payload.id, gatewayClient.FIRMWARESTATE.IDLE);

                const url = `https://xxx.internetofthings.ibmcloud.com/api/v0002/device/types/${payload.type}/devices/${payload.id}`;
                const body = {
                    "deviceInfo": {
                        "fwVersion": payload.version
                    }
                };
                const auth = `Basic ${new Buffer((`${constants.IOTF_AUTH_USERNAME}:${constants.IOTF_AUTH_PASSWORD}`)).toString('base64')}`;

                request.put(
                    {
                        url : url,
                        headers : {
                            "content-type"  : 'application/json',
                            "Authorization" : auth
                        },
                        body : JSON.stringify(body)
                    },
                    (error, response, body2) => {
                        console.log('here');
                    }
                );

                console.log('sent firmwarestate uploaded!');
            }, 3000);
        } else if(payload.cmd === constants.FIRMWARE_DOWNLOAD) {
            setTimeout(function () {
                gatewayClient.changeState(payload.type, payload.id, gatewayClient.FIRMWARESTATE.DOWNLOADED);
                console.log('sent firmwarestate downloaded!');
            }, 3000);
        } else if(payload.cmd === constants.IMAGE_DOWNLOAD) {
            console.log('got image downloaded from device!');

        }
    } else {
        console.log(`payload got back from device, but state is not: ${constants.SUCCESS}
        
        State is: ${payload.state};
        `);
    }
}

exports.publishSensorReading = (type, id, payload) => {
    console.log(payload);
    gatewayClient.publishDeviceEvent(type, id, constants.DEVICE_SENSOR_READING_TOPIC, "json", JSON.stringify(payload), 0);
}

exports.connectDevice = (type, id) => {
    gatewayClient.manageDevice(type, id, 4000, true, true);
    gatewayClient.upwisDeviceConnected(type, id);
    gatewayClient.subscribeToDeviceCommand(type, id);
}

exports.disconnectDevice = (type, id) => {

    gatewayClient.disconnectDevice(type, id);
    gatewayClient.unmanageDevice(type, id);
    gatewayClient.unsubscribeToDeviceCommand(type, id);
}



exports.startManagedGateway = (callback) => runManaged(callback);
exports.firmwareDownloadResponse = (payload) => firmwareDownloadResponse(payload);