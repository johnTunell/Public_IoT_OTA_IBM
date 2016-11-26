/*eslint-env node*/

"use strict";

const request = require('request');

exports.sendDeleteReqIOTF = (url, auth, type, id) => {
    request.get({ url : url, headers : { "content-type"  : 'application/json', "Authorization" : auth}},
        (error, response, body) => {
            if(error || typeof(body) === 'undefined') {
                console.log('delete request came back undefined!!');
            } else {
                var payload = JSON.parse(body);
                console.log('succesfully sent delete request');
                let uncompletedDownloads = payload.results.filter( (requestObj) => { return !requestObj.complete});
                if(uncompletedDownloads.length === 0) { console.log('No uncomplete requests found!!')}
                for(let iotfRequest of uncompletedDownloads) {
                    request.get({ url : url + '/' + iotfRequest.id +'/' + 'deviceStatus', headers : { "content-type"  : 'application/json', "Authorization" : auth}},
                        (error, response, body) => {
                            let matchingDevice = JSON.parse(body).results.filter( deviceStatus => { return deviceStatus.deviceId === id && deviceStatus.typeId === type});
                            console.log(matchingDevice);
                            if(matchingDevice.length !== 0) {
                                request.del({ url : url + '/' + iotfRequest.id +'/', headers : { "content-type"  : 'application/json', "Authorization" : auth}},
                                    (error, response, body) => {
                                        console.log('deleted a request');
                                    });
                            } else {
                                console.log('Did not find match for device!!');
                            }
                        });
                }
            }
        }
    );
};
