/*eslint-env node*/

"use strict";

var iotf = require("ibmiotf");
var config = require("../create_new_devices/device.json");
let deviceClient = [];
const mqttClient = require('../mqtt/mqtt_local_gateway');
const fs = require('fs');
const request = require('request');
const http = require('http');
const mkdirp = require('mkdirp');

function runManaged() {

    for(let i = 0; i < config.length; i++) {

        deviceClient[i] = new iotf.IotfManagedDevice(config[i]);

        deviceClient[i].log.setLevel('warn');

        deviceClient[i].connect();

        deviceClient[i].on('connect', function(){
            deviceClient[i].manage(4000,false, true);
            console.log('connected to IOT foundation');
            // console.log("rc ="+rc);
        });
//        deviceClient[i].changeState(deviceClient[i].FIRMWARESTATE.IDLE);

        deviceClient[i].on('firmwareDownload', function(req){
            console.log('Action : ' + JSON.stringify(req));
            deviceClient[i].changeState(deviceClient[i].FIRMWARESTATE.DOWNLOADING);
            const url = req.uri;
            const authToken = req.name;
            const isDevice = true;
            const deviceType = deviceClient[i].typeId;
            const deviceId = deviceClient[i].deviceId;
            const version = req.version;
            let dir = __dirname;
            let filename = __filename;
            const verifier = req.verifier;

            /*  Get the firmware file from cloud */

            mkdirp(`./../gateway/firmware/${deviceType}`, function (err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Created folder');
                    var dest = `./../gateway/firmware/${deviceType}/${version}`;
                    var file = fs.createWriteStream(dest);

                    const options = {
                        url,
                        headers: {
                            'X-Auth-Token': authToken
                        }
                    }

                    request.get(options).pipe(file);
                    file.once('finish', () => {

                        /* Send a MQTT message to the device and ask it to do a get req for the firmware file */

                        mqttClient.getToDevice(deviceType, deviceId, verifier, version);
                    });
                }
            });
        });
    }
}

function firmwareDownloadResponse(device, state) {
    for(let i = 0; i < deviceClient.length; i++) {
        if(deviceClient[i].deviceId === device) {
            if(state === 'succesful') {
                setTimeout(function() {
                    deviceClient[i].changeState(deviceClient[i].FIRMWARESTATE.DOWNLOADED);
                }, 3000);
            }
        }
    }
}


exports.connectIotfMqtt = (callback) => {
    let mqtt = require('mqtt');
    

    const config = require('./config');

    iotfClient = mqtt.connect(config);

    iotfClient.on('connect', function() {
        console.log('connected to IOTF MQTT!');
        iotfClient.subscribe('iotdm-1/response');
        iotfClient.publish('iotdevice-1/mgmt/manage', '{ "d": {"supports": {"exampleDeviceType-actions-v1": true}},"reqId": "f38faafc-53de-47a8-a940-e697552c4124"}');
    });

    iotfClient.on('message', function(topic,message) {
        message = JSON.parse(message.toString());
        console.log(message);
        iotfClient.end(false, callback);
    });
};


exports.startManagedDevice = () => runManaged();
exports.firmwareDownloadResponse = (device, state) => firmwareDownloadResponse(device, state);

runManaged();