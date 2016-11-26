/*eslint-env node*/

"use strict";

const request = require('request');
const fs = require('fs');

exports.httpPost = (postObject) => {

    const url = postObject.url;
    const body = postObject.body;
    const username = postObject.authorization.username;
    const password = postObject.authorization.password;
    const auth = postObject.authorization.isAuth ? `Basic ${new Buffer((`${username}:${password}`)).toString('base64')}` : '';

    request.post(
        {
            url : url,
            headers : {
                "content-type"  : 'application/json',
                "Authorization" : auth
            },
            body : JSON.stringify(body)
        },
        (error, response, body) => {
            var payload = JSON.parse(body);
            console.log(payload);
        }
    );
}
