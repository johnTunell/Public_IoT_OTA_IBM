/*eslint-env node*/

"use strict";


const request = require('request');
exports.containerExist = (url, token, containerName, callback) => {
    const options = {
        url,
        headers: {
            'X-Auth-Token': token
        }
    }

    request(options, (error, response, body) => {
        console.log(body);
        let containers = body.split("\n");
        let boolean = containers.includes(containerName);
        callback(boolean);
    });
}