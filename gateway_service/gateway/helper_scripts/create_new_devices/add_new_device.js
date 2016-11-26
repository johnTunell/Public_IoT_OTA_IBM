const postGenerator = require('./../helper_methods/http_post_generator');
const postObjGenerator = require('./../helper_methods/http_post_object_generator');

const DEVICE_TYPE = 'E103',
    DEVICE_ID = Math.floor(Math.random(10000)*10000),
    AUTH_USERNAME = '',
    AUTH_PASSWORD = '';

const POST_OBJECT = postObjGenerator.addDevice(DEVICE_TYPE, DEVICE_ID, AUTH_USERNAME, AUTH_PASSWORD);

postGenerator.httpPost(POST_OBJECT);
