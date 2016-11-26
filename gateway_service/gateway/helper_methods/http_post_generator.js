const request = require('request');
const fs = require('fs');

exports.httpPost = (postObject, isPushDevice, isGateway, callback) => {

    const url = postObject.url;
    const body = postObject.body;
    const username = postObject.authorization.username;
    const password = postObject.authorization.password;
    const auth = postObject.authorization.isAuth ? `Basic ${new Buffer((`${username}:${password}`)).toString('base64')}` : '';

    request.post(
        {
            url : url,
            headers : {
                "content-type"  : 'application/json',
                "Authorization" : auth
            },
            body : JSON.stringify(body)
        },
        (error, response, body) => {
            var payload = JSON.parse(body);
            postObject.isAddDevicePost ? addDevicePost(payload, isPushDevice, isGateway, callback) : console.log(payload);
        }
    );
}

function addDevicePost (payload, isPushDevice, isGateway, callback) {
    console.log(payload);
    let deviceJson = [{
        "org": "",
        "id": payload.deviceId,
        "type": payload.typeId,
        "auth-method": "token",
        "auth-token": payload.authToken
    }];

    if(isPushDevice) {
        let deviceArray = require('./device.json');
        deviceArray.push(deviceJson[0]);
        deviceJson = deviceArray;
    }

    if(isGateway) {
        let configJson = require('./../config_gateway.json');
        configJson.DEVICE_ADDED_IOTF = true;
        configJson.GATEWAY_DEVICE_CREDENTIALS = deviceJson[0];
        deviceJson = configJson;
    }
    
    callback(deviceJson);
}

