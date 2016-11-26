exports.runDevice = () => {
    const localMqtt = require('./mqtt_local_device');
    localMqtt.connectMqtt();
}