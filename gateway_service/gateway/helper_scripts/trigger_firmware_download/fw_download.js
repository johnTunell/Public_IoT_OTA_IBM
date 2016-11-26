const postObjGenerator = require('./../helper_methods/http_post_object_generator');
const postGenerator = require('./../helper_methods/http_post_generator');
let device = require('././device.json');

const deviceType = device[0].type,
    deviceId = device[0].id,
    version = 'test.txt';
const AUTH_USERNAME = 'a-2fmkev-kruskbpvtv"',
    AUTH_PASSWORD = 'H4Beh(n3-Jx6lb3!Vq',
    DOWNLOAD_URL = `http://localhost:8080/firmware/type/${deviceType}/version/${version}`,
    VERIFIER = '0xabc';

const postObject = postObjGenerator.fwDownload(deviceType, deviceId, DOWNLOAD_URL, version, VERIFIER, AUTH_USERNAME, AUTH_PASSWORD);

postGenerator.httpPost(postObject);

