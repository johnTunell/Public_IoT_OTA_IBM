/*eslint-env node*/

"use strict";

const Client = require('ibmiotf');
let appClient;
const config = require('./application_config.json');

exports.iotDeviceSetup = () => {

    appClient = new Client.IotfApplication(config);
    appClient.connect();

    appClient.on('connect', function() {
        console.log('Application connected!');
    });

    appClient.on("error", function (err) {
        console.log("Error : "+err);
    });

    exports.appClient = appClient;
}
