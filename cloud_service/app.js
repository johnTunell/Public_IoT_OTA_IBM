/*eslint-env node*/

"use strict";

//------------------------------------------------------------------------------
// node.js application for remote firmware updates Upwiz
//------------------------------------------------------------------------------

const app = require('express')();
const server = require('http').createServer(app);
const request = require('request');
const multer = require('multer');
const fs = require('fs');
const crc = require('crc');
const mkdirp = require('mkdirp');
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const basicAuth = require('basic-auth');

const postObjGenerator = require('./http/post/post_object_generator');
const postGenerator = require('./http/post/post_generator');
const checkContainer = require('./http/get/check_container');
const appClient = require('./mqtt_application/mqtt_application');
const polyfills = require('./polyfills/polyfills');
const getToken = require('./http/get/get_token');
const bluemixRequest = require('./services/bluemix_request');
const constants = require('./constants.json');
const deleteService = require('./services/delete_request_iotf');
const mqttService = require('./services/mqtt_request_iotf');

polyfills.addArrayIncludesPolyfill();
appClient.iotDeviceSetup();

var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
let objStrCredentials;

if (process.env.VCAP_SERVICES === undefined) {
    objStrCredentials = constants.OBJECT_STORAGE_CREDENTIALS;
} else {
    objStrCredentials = services['Object-Storage'][0]['credentials'];
}

var auth = function (req, res, next) {
    console.log('received request');
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        console.log('unauth!');

        return res.sendStatus(401);
    };

    var user = basicAuth(req);

    if (user && objStrCredentials.username === user.name && objStrCredentials.password === user.pass) {
        next();
    } else {
        return unauthorized(res);
    }

}



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let deviceType = req.params.type;
        let cmd = req.params.cmd;
        console.log(__dirname);
        mkdirp(`./${cmd}/${deviceType}`, function (err) {
            cb(null, `./${cmd}/${deviceType}`);
            console.log('created folder');
        });
    },
    filename: function (req, file, cb) {
        console.log('running filename!');
        cb(null, file.originalname);
    }
});

app.get('/', auth, function(req, res) {
    res.sendFile(__dirname + '/html/swagger_doc.html');
});

app.delete('/cmd/request/type/:type/id/:id', auth, function(req,res) {
    console.log('delete received');
    res.send('delete received by server');

    const id = req.params.id,
        type = req.params.type,
        url = constants.IOTF_REST_API_URL,
        auth = `Basic ${new Buffer((`${constants.IOTF_REST_API_AUTH_USERNAME}:${constants.IOTF_REST_API_AUTH_PASSWORD}`)).toString('base64')}`;

    deleteService.sendDeleteReqIOTF(`${url}/mgmt/requests`, auth, type, id);
});

app.post('/cmd/:cmd/type/:type/id/:id', auth, multer({ storage }).single('upl'), function(req, res) {

    var generatedCRC = crc.crc32(fs.readFileSync('./' + req.file.path)).toString(16);
    res.send('POST ' + req.params.cmd + ' received on server. Generated CRC: ' + generatedCRC);

    const deviceType = req.params.type,
        cmd = req.params.cmd,
        deviceId = req.params.id,
        version = req.file.filename,
        containerName = req.params.type + '_' + req.params.cmd;

    const VERIFIER = generatedCRC,
        DOWNLOAD_URL = `${constants.OBJECT_STORAGE_DOWNLOAD_URL}/${containerName}/${version}`,
        CONTAINER_CHECK_URL = constants.OBJECT_STORAGE_CONTAINER_URL,
        auth = `Basic ${new Buffer((`${constants.IOTF_REST_API_AUTH_USERNAME}:${constants.IOTF_REST_API_AUTH_PASSWORD}`)).toString('base64')}`;

    let X_AUTH_TOKEN;

    getToken.getAuthToken(objStrCredentials, (token) => {
        X_AUTH_TOKEN = token;
        const addFileOptions = {
            url: DOWNLOAD_URL,
            headers: {
                'X-Auth-Token': X_AUTH_TOKEN
            }
        }

        const addContainerOptions = {
            url: CONTAINER_CHECK_URL + containerName,
            headers: {
                'X-Auth-Token': X_AUTH_TOKEN
            }
        }
        let deviceArray = [];
        let postObject = '';
        if (deviceId === 'all') {
            request.get({
                    url: `${constants.IOTF_REST_API_URL}/device/types/${deviceType}/devices`,
                    headers: {"content-type": 'application/json', "Authorization": auth}
                }
                , (error, response, body) => {
                    let deviceArray = JSON.parse(body).results;
                    let getRequestArray = [];
                    for (let device of deviceArray) {
                        getRequestArray.push(getDeviceMgmt(device.typeId, device.deviceId, auth));
                    }
                    Promise.all(getRequestArray)
                        .then(values => {
                            let deviceArray = values.filter((deviceId) => {return deviceId != ''});
                            deviceArray = deviceArray.map((device) => { let returnObj = { "typeId": deviceType, "deviceId": device }; return returnObj; });
                            postObject = postObjGenerator.generatePostObj(cmd, deviceArray, DOWNLOAD_URL, version, VERIFIER, constants.IOTF_REST_API_AUTH_USERNAME, constants.IOTF_REST_API_AUTH_PASSWORD, X_AUTH_TOKEN);
                            checkAndSend(CONTAINER_CHECK_URL, X_AUTH_TOKEN, containerName, addFileOptions, addContainerOptions, postObject);
                        });
                });
        } else {
            deviceArray = [{ "typeId": deviceType, "deviceId": deviceId}];
            postObject = postObjGenerator.generatePostObj(cmd, deviceArray, DOWNLOAD_URL, version, VERIFIER, constants.IOTF_REST_API_AUTH_USERNAME, constants.IOTF_REST_API_AUTH_PASSWORD, X_AUTH_TOKEN);
            checkAndSend(CONTAINER_CHECK_URL, X_AUTH_TOKEN, containerName, addFileOptions, addContainerOptions, postObject);
        }
    });


    function sendRequestBluemix(postObject) {
        console.log('sending post to bluemix...');
        if (postObject.cmd === constants.FIRMWARE_DOWNLOAD || postObject.cmd === constants.FIRMWARE_UPDATE) {
            postGenerator.httpPost(postObject);
        } else {
            mqttService.sendMqttRequestIOTF(postObject);
        }
    }

    function checkAndSend(CONTAINER_CHECK_URL, X_AUTH_TOKEN, containerName, addFileOptions, addContainerOptions, postObject) {
        checkContainer.containerExist(CONTAINER_CHECK_URL, X_AUTH_TOKEN, containerName, (containerExist) => {
            if (!containerExist) {
                request.put(addContainerOptions, (error, response, body) => {
                    fs.createReadStream('./' + req.file.path).pipe(request.put(addFileOptions, sendRequestBluemix(postObject)));
                });
            } else {
                fs.createReadStream('./' + req.file.path).pipe(request.put(addFileOptions, sendRequestBluemix(postObject)));
            }
        });
    }
});


function getDeviceMgmt(deviceType, deviceId, auth) {
    return new Promise( (resolve, reject) => {
        request.get({url : `${constants.IOTF_REST_API_URL}/device/types/${deviceType}/devices/${deviceId}/mgmt`, headers : { "content-type"  : 'application/json', "Authorization" : auth} }
            ,(error, response, body) => {
                body = body === '' ? '' : JSON.parse(body);
                if(response.statusCode === 200) {
                    if(body.supports.firmwareActions) {
                        console.log('support firmware!!');
                        resolve(deviceId);
                    }
                } else {
                    resolve('');
                }
            });
    });
}





function downloadIsComplete(requestObject) {
    return requestObject.complete;
}





server.listen(appEnv.port, '0.0.0.0', function() {
    console.log(appEnv.port);
    console.log("server is running on 8080...");
    console.log('testar push');
});

