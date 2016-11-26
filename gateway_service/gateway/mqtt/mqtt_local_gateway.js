const constants = require('./../constants.json');
const config = require('./../config_gateway.json');
const gatewayClient = require('./../iotf_managed_gateway/managed_gateway');
const mqttPacket = require('mqtt-packet')
const parser = mqttPacket.parser()
let client;


exports.connectMqtt = () => {
    let mqtt = require('mqtt');
    client = mqtt.connect('mqtt://localhost:1883');

    client.on('connect', function() {
        console.log('connected to local mosquitto');
        client.subscribe(`iot-2/type/+/id/+/evt/${constants.DEVICE_MANAGMENT_RESPONSE_TOPIC}/fmt/json`);
        client.subscribe(`iot-2/type/+/id/+/evt/${constants.DEVICE_SENSOR_READING_TOPIC}/fmt/json`);
        client.subscribe(constants.DM_UPWIS_DEVICE_CONNECT_TOPIC);

        console.log('listening on topics..');

    });

    parser.on('packet', function(packet) {
        parser.parse(packet);
        console.log(packet);
    });

    client.on('message', function(topic,message, packet) {
        console.log('got a message!');
        console.log(`Topic: ${topic}`);
        console.log(`Message: ${message}`);
        console.log(packet);
        console.log(packet.retain)
        message = JSON.parse(message.toString());
        if(new RegExp(constants.DEVICE_CONNECTED_RE).exec(topic)) {
            console.log('got connected topic!');
            let match = new RegExp(constants.DEVICE_CONNECTED_RE).exec(topic);
            let type = match[1];
            let id = match[2];
            if(message.d.status === 'online') {
                gatewayClient.connectDevice(type, id);
            } else {
                if(packet.retain === true) {
                    console.log('got disconnected as retained, so do nothing!');
                } else {
                    console.log('got disconnected as not retained, so disconnect!');
                    gatewayClient.disconnectDevice(type, id);
                }
            }
        } else {
            let match = new RegExp(constants.DEVICE_MANAGMENT_RESPONSE_RE).exec(topic) === null ?
                new RegExp(constants.DEVICE_SENSOR_READING_RE).exec(topic) : new RegExp(constants.DEVICE_MANAGMENT_RESPONSE_RE).exec(topic);

            if(match !== null) {

                let topicEvtType = match[3];

                if(topicEvtType === constants.DEVICE_SENSOR_READING_TOPIC) {
                    let type = match[1];
                    let id = match[2];
                    require('./../iotf_managed_gateway/managed_gateway').publishSensorReading(type, id, message);
                } else {
                    message.type = match[0];
                    message.id = match[1];
                    require('./../iotf_managed_gateway/managed_gateway').deviceActionResponse(message);
                }
            } else {
                console.log('could not parse topic. Unknown');
            }
        }


    });
};

exports.getToDevice = (cmd, typeId, deviceId, crc32, version) => {
    let payload = {
        typeId,
        deviceId,
        url: `${constants.LOCAL_URL}/cmd/${cmd}/type/${typeId}/version/${version}`,
        crc32,
        version
    };
    console.log(`iot-2/type/${typeId}/id/${deviceId}/cmd/${cmd}/fmt/json`);
    client.publish(`iot-2/type/${typeId}/id/${deviceId}/cmd/${cmd}/fmt/json`, JSON.stringify(payload));
};

