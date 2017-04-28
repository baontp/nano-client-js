'use strict';

var PayloadType = require('./constants').PayloadType;

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
    if(!!args){
        return JSON.stringify({a: action, p: args});
    } else {
        return JSON.stringify({a: action});
    }
};

MessageBuilder.buildRequest = function (sessionId, requestType, payload, payloadType) {
    var _payload = !!payload ? payload : '';
    var _payloadType = !!payloadType ? payloadType : PayloadType.JSON;

    var index = 0;
    var byteArray = new Uint8Array(7 + _payload.length);
    byteArray[index++] = 0;
    byteArray[index++] = requestType;
    byteArray[index++] = 0;

    var _payloadSize = _payload.length;
    byteArray[index++] = _payloadSize >>> 24;
    byteArray[index++] = _payloadSize >>> 16;
    byteArray[index++] = _payloadSize >>> 8;
    byteArray[index++] = _payloadSize;

    var i = 0;
    if (_payloadType == _payloadType.BINARY) {
        for (; i < _payloadSize; ++i) {
            byteArray[index++] = _payload[i];
        }
    } else {
        for (; i < _payloadSize; ++i) {
            byteArray[index++] = _payload.charCodeAt(i);
        }
    }
    return byteArray;
};