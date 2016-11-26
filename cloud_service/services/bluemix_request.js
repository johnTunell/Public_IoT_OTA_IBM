/*eslint-env node*/

"use strict";

const postGenerator = require('./../http/post/post_generator');

exports.sendPostBluemix = (appClient, cmd, postObject, DOWNLOAD_URL, X_AUTH_TOKEN, version, VERIFIER) => {
        console.log('sending post to bluemix...');
        if(cmd === 'firmware') {
            console.log('sending firmware...');
            postGenerator.httpPost(postObject);
        } else {
            const payload = {
                uri: DOWNLOAD_URL,
                name: X_AUTH_TOKEN,
                version,
                verifier: VERIFIER
            }
            console.log('sending image...');
            appClient.appClient.publishDeviceCommand(deviceType, deviceId, "image", "json", JSON.stringify(payload));
        }
}
