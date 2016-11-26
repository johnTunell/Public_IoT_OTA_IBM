const postGenerator = require('./../helper_methods/http_post_generator');
const postObjGenerator = require('./../helper_methods/http_post_object_generator');
const fs = require('fs');
const config = require('./../config_gateway.json');

exports.startupRoutine = (finishedStartup) => {
    let macAdress = require('os').networkInterfaces().eth0[0].mac;
    console.log(macAdress);
    macAdress = macAdress.replace(/:/g, "");

    const DEVICE_TYPE = 'managed_gateway_john',
        DEVICE_ID = macAdress;

    const POST_OBJECT = postObjGenerator.addDevice(DEVICE_TYPE, DEVICE_ID, config.AUTH_USERNAME, config.AUTH_PASSWORD);

    postGenerator.httpPost(POST_OBJECT, false, true, (deviceJson) => {
        fs.writeFile('./config_gateway.json', JSON.stringify(deviceJson), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('device json created');
            finishedStartup();
        });
    });
}

