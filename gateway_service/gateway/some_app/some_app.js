const iotf = require('ibmiotf');

let appClient;

exports.iotAppSetup = () => {

    const appClientConfig = require('./config');

    appClient = new iotf.IotfApplication(appClientConfig);
    appClient.connect();

    appClient.on('connect', function() {
        console.log('Application connected!');
        appClient.subscribeToDeviceEvents();    // Subscribe to all events on all devices!!
    });


    appClient.on('deviceEvent', function(deviceType, deviceId, eventType, format, payload) {

        console.log(deviceType);
        console.log(payload);
        console.log("Device Event from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);

    });

// Error handling application

    appClient.on('error', function (err) {
        console.log('Error : ' + err);
    });

}

