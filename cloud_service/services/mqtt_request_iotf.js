/*eslint-env node*/

"use strict";

const appClient = require('./../mqtt_application/mqtt_application');
const constants = require('./../constants.json');

exports.sendMqttRequestIOTF = (postObject) => {

    const payload = {
        version: postObject.body.parameters[0].value,
        uri: postObject.body.parameters[1].value,
        verifier: postObject.body.parameters[2].value,
        name: postObject.body.parameters[3].value
    }

    for(let device of postObject.body.devices) {
        appClient.appClient.publishDeviceCommand(device.typeId, device.deviceId, constants.IMAGE_DOWNLOAD, "json", JSON.stringify(payload));
    }

    console.log('sending image...');
}