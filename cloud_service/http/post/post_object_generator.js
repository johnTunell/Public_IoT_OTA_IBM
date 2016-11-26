/*eslint-env node*/

"use strict";

const constants = require('./../../constants.json');

exports.generatePostObj = (cmd, deviceArray, downloadUrl, version, verifier, authUsername, authPassword, authToken) => {
    let action = cmd === constants.FIRMWARE_DOWNLOAD ? 'firmware/download' : 'firmware/update';
    const postObject = {
        url: `${constants.IOTF_REST_API_URL}/mgmt/requests/?deviceManagementInitiationRequest`,
        body: {
            action,
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
            "devices": deviceArray
        },
        authorization: {
            isAuth: true,
            username: authUsername,
            password: authPassword
        },
        cmd
    }
    return postObject;
}