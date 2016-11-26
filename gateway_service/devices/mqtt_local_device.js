exports.connectMqtt = () => {
    let mqtt = require('mqtt');
    const fs = require('fs');
    const http = require('http');
    let client = mqtt.connect('mqtt://localhost:1883');
    let config = require('./device.json');

    client.on('connect', function() {
        client.subscribe(`iot-2/type/+/id/+/cmd/fw_download/fmt/json`);
        client.subscribe(`iot-2/type/+/id/+/cmd/img_download/fmt/json`);
    });

    client.on('message', function(topic, message) {
        message = JSON.parse(message.toString());
        console.log(message);
        const deviceType = message.typeId,
            deviceId = message.deviceId,
            url = message.url,
            version = message.version;

        let dest = '';
        for(let i = 0; i < config.length; i++) {
            if(config[i].id === deviceId && config[i].type === deviceType) {
                
                dest = './../devices/device' + (i+1) +'/' + version;
            }
        }

        var file = fs.createWriteStream(dest);
        var request = http.get(url, function(response) {
            response.pipe(file);
            file.once('finish', () => {
                let json = {
                    deviceId,
                    state: 'succesful'
                }
                if(topic === `iot-2/type/${deviceType}/id/${deviceId}/cmd/fw_download/fmt/json`) {
                    client.publish(`iot-2/type/${deviceType}/id/${deviceId}/evt/fmwdownload/fmt/json`, JSON.stringify(json));
                }
            });
        });
    });
}

