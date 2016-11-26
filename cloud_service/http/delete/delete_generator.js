/*eslint-env node*/

"use strict";

const request = require('request');
const fs = require('fs');

exports.httpDelete = (deleteObject) => {

    const url = deleteObject.url;
    const username = deleteObject.authorization.username;
    const password = deleteObject.authorization.password;
    const auth = deleteObject.authorization.isAuth ? `Basic ${new Buffer((`${username}:${password}`)).toString('base64')}` : '';

    request.delete(
        {
            url : url,
            headers : {
                "content-type"  : 'application/json',
                "Authorization" : auth
            }
        },
        (error, response, body) => {
            var payload = JSON.parse(body);
            console.log('succesfully sent delete request');
        }
    );
}







/*eslint-env node*/

"use strict";

exports.addDevice = (type, id, authUsername, authPassword) => {
    const postObject = {
        url: `https://xxx.internetofthings.ibmcloud.com/api/v0002/device/types/${type}/devices`,
        body: {  "deviceId": id,
            "deviceInfo": {
                "serialNumber": "",
                "manufacturer": "",
                "model": "",
                "deviceClass": "",
                "description": "",
                "fwVersion": "",
                "hwVersion": "",
                "descriptiveLocation": ""  },
            "location": {
                "longitude": 0,
                "latitude": 0,
                "elevation": 0,
                "accuracy": 0,
                "measuredDateTime": ""  },
            "metadata": {}
        },
        authorization: {
            isAuth: true,
            username: authUsername,
            password: authPassword
        },
        isAddDevicePost: true
    }
    return postObject;
}

exports.fwDownload = (type, id, downloadUrl, version, verifier, authUsername, authPassword, authToken) => {
    const postObject = {
        url: 'https://xxx.internetofthings.ibmcloud.com/api/v0002/mgmt/requests/?deviceManagementInitiationRequest',
        body: {
            "action": "firmware/download",
            "parameters": [
                {
                    "name": "version",
                    "value": version
                },
                {
                    "name": "uri",
                    "value": downloadUrl
                },
                {
                    "name": "verifier",
                    "value": verifier
                },
                {
                    "name": "name",
                    "value": authToken
                }
            ],
            "devices": [
                {
                    "typeId": type,
                    "deviceId": id
                }
            ]
        },
        authorization: {
            isAuth: true,
            username: authUsername,
            password: authPassword
        },
        isAddDevicePost: false
    }
    return postObject;
}



