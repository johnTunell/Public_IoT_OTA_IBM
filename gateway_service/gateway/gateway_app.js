const express = require('express');
const app = express();
const server = require('http').createServer(app);

const localMqttGateway = require('./mqtt/mqtt_local_gateway');
const managedGateway = require('./iotf_managed_gateway/managed_gateway');
const constants = require('./constants.json');
const config = require('./config_gateway.json');

const device = require('../devices/device_app');
device.runDevice();
managedGateway.startManagedGateway(() => {
    localMqttGateway.connectMqtt();
});

app.use(express.static(__dirname + '/'));

app.get('/cmd/:cmd/type/:type/version/:version', function(req, res) {
    const deviceType = req.params.type;
    const version = req.params.version;
    const cmd = req.params.cmd;
    const folderName = cmd === constants.IMAGE_DOWNLOAD ? constants.IMAGE_DOWNLOAD : constants.FIRMWARE_DOWNLOAD;

    const options = { root: __dirname + '/' + folderName +'/' + deviceType }

    res.sendFile(version, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log(`Get request received on gateway. Sent file: ${version} to device!`);
        }
    });
});

server.listen(process.env.PORT || 5000);
console.log("server is running on 5000...");
