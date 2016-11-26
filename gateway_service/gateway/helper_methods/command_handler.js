const mkdirp = require('mkdirp');
const fs = require('fs');
const request = require('request');
const mqttClient = require('./../mqtt/mqtt_local_gateway');
const constants = require('./../constants.json');

function createFolder(cmd, deviceType, version) {
    return new Promise( (resolve, reject) => {
        mkdirp(`./../gateway/${cmd}/${deviceType}`, function (err) {
            let dest;
            if (err) {
                console.error(err);
                dest = 'error';
            } else {
                console.log('Created folder');
                dest = `./../gateway/${cmd}/${deviceType}/${version}`;
            }
            console.log('resolved promise');
            return resolve(dest);
        });
    });
}

function downloadFileFromCloud (url, authToken, dest) {
    return new Promise( (resolve, reject) => {
        const options = {
            url,
            headers: {
                'X-Auth-Token': authToken
            }
        }

        console.log('now piping data');
        const file = fs.createWriteStream(dest);
        request.get(options).pipe(file);
        file.once('finish', () => {
            console.log('file finished writing!');
            return resolve('');
        });
    });
}

exports.handleCommand = (payload, cmd) => {
    const AUTH_CREDENTIALS = payload.name;
    console.log(AUTH_CREDENTIALS);
    console.log(cmd);
    console.log(constants.IMAGE_DOWNLOAD);
    let folderName = cmd ===  constants.IMAGE_DOWNLOAD ? constants.IMAGE_DOWNLOAD : constants.FIRMWARE_DOWNLOAD;
    createFolder(folderName, payload.type, payload.version).then((dest) => {
        console.log('succesfully created folder');
        console.log('dest: ' + dest);
        downloadFileFromCloud(payload.uri, AUTH_CREDENTIALS, dest).then(() => {
            console.log('succesfully downloaded file');
            mqttClient.getToDevice(cmd, payload.type, payload.id, payload.verifier, payload.version);
        });
    });
}



























/*

exports.handleCommand = (cmd, url, authToken, deviceType, deviceId, version, verifier) => {
    mkdirp(`./../gateway/${cmd}/${deviceType}`, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log('Created folder');
            const dest = `./../gateway/${cmd}/${deviceType}/${version}`;
            const file = fs.createWriteStream(dest);

            const options = {
                url,
                headers: {
                    'X-Auth-Token': authToken
                }
            }

            request.get(options).pipe(file);
            file.once('finish', () => {

                /!* Send a MQTT message to the device and ask it to do a get req for the firmware file *!/

                const cmd_topic = cmd === "firmware" ? "fw_download" : "img_download";
                mqttClient.getToDevice(cmd_topic, deviceType, deviceId, verifier, version);
            });
        }
    });
};

*/
