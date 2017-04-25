/**
 * Created by baonguyen on 4/24/2017.
 */
var util = require('./util');
var constants = require('./constants');
var MessageType = constants.MessageType;
var PayloadType = constants.PayloadType;
var RequestType = constants.RequestType;

var Response = (function () {
    function Response(responseBytes, startIndex) {
        this.messageType = responseBytes[startIndex++];
        this.requestType = responseBytes[startIndex++];
        this.resultCode = responseBytes[startIndex++];
        this.payLoadType = responseBytes[startIndex++];
        this.payLoadSize = util.bytesToInteger(responseBytes, startIndex); startIndex += 4;
        this.payLoad = new Uint8Array(this.payLoadSize);
        for (var i = 0; i < this.payLoadSize; i++) {
            this.payLoad[i] = responseBytes[startIndex + i];
        }
    }

    Response.prototype.getMessageType = function () {
        return this.messageType;
    };

    Response.prototype.getRequestType = function () {
        return this.requestType;
    };

    Response.prototype.getResultCode = function () {
        return this.resultCode;
    };

    Response.prototype.getPayloadType = function () {
        return this.payLoadType;
    };

    Response.prototype.getPayloadSize = function () {
        return this.payLoadSize;
    };

    Response.prototype.getPayload = function () {
        return this.payLoad;
    };

    Response.prototype.getPayloadString = function () {
        return util.bin2String(this.payLoad);
    };

    Response.prototype.debug = function () {
        util.log("========Response========");
        util.log("messageType : " + MessageType[this.getMessageType()]);
        util.log("requestType : " + RequestType[this.getRequestType()]);
        util.log("resultCode  : " + this.getResultCode());
        util.log("payLoadType : " + PayloadType[this.getPayloadType()]);
        util.log("payLoadSize : " + this.getPayloadSize());
        util.log("payLoad     : " + this.getPayloadString());
    };

    return Response;
})();

module.exports = Response;