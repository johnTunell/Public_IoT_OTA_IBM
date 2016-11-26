/*eslint-env node*/

"use strict";

const request = require('request');

exports.getAuthToken = (objStorage, callback) => {
    const requestOptions = {
        url: 'https://identity.open.softlayer.com/v3/auth/tokens',
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            "auth": {
                "identity": {
                    "methods": [
                        "password"
                    ],
                    "password": {
                        "user": {
                            "id": objStorage.userId,
                            "password": objStorage.password
                        }
                    }
                },
                "scope": {
                    "project": {
                        "id": objStorage.projectId
                    }
                }
            }
        })
    }

    request.post(requestOptions)
        .on('response', (response, body) => {

            const authToken = response.headers['x-subject-token'];
            // const url = response.body.token.catalog[7].endpoints[2].url;
            callback(authToken);
        });
}

