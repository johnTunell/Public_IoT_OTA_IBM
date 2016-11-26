/*eslint-env node*/

"use strict";

const constants = require('./../../constants.json');

exports.clearStateFirmwareDownload = (requestId, authUsername, authPassword) => {
    const deleteObject = {
        url: `${constants.IOTF_REST_API_URL}/mgmt/requests/${requestId}`,
        authorization: {
            isAuth: true,
            username: authUsername,
            password: authPassword
        }
    }
    return deleteObject;
}
