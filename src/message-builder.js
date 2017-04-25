'use strict';

var MessageBuilder = {};
module.exports = MessageBuilder;

MessageBuilder.buildAuthRequest = function (recovery, user, authData) {
    var json = {};
    json.version = "JS_1.0";
    json.user = user;
    json.authData = authData;
    json.keepalive = 60;
    json.recoverytime = recovery;

    return JSON.stringify(json);
};

MessageBuilder.buildActionRequest = function (action, args) {
    var json = {
        action: action,
        params: args
    };
    return JSON.stringify(json);
};

MessageBuilder.buildRequest = function (sessionId, requestType, payload, isText, reserved) {
    if (typeof reserved === "undefined") {
        reserved = 0;
    }
    var index = 0;
    var byteArray = new Uint8Array(7 + payload.length);
    byteArray[index++] = 0;
    byteArray[index++] = requestType;
    byteArray[index++] = 0;

    var payloadSize = payload.length;
    byteArray[index++] = payloadSize >>> 24;
    byteArray[index++] = payloadSize >>> 16;
    byteArray[index++] = payloadSize >>> 8;
    byteArray[index++] = payloadSize;

    var i = 0;
    if (isText == false) {
        for (; i < payloadSize; ++i) {
            byteArray[index++] = payload[i];
        }
    } else {
        for (; i < payloadSize; ++i) {
            byteArray[index++] = payload.charCodeAt(i);
        }
    }
    return byteArray;
};