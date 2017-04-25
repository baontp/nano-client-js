/**
 * Created by baonguyen on 4/24/2017.
 */
var util = require('./util');
var constants = require('./constants');
var MessageType = constants.MessageType;
var PayloadType = constants.PayloadType;
var UpdateType = constants.UpdateType;

var Notify = (function () {
    function Notify(responseBytes, startIndex) {
        this.messageType = responseBytes[startIndex + 0];
        this.updateType = responseBytes[startIndex + 1];
        this.reserved = responseBytes[startIndex + 2];
        this.payLoadType = responseBytes[startIndex + 3];
        this.payLoadSize = util.bytesToInteger(responseBytes, startIndex + 4);
        this.payLoad = new Uint8Array(this.payLoadSize);
        for (var i = 0; i < this.payLoadSize; i++) {
            this.payLoad[i] = responseBytes[8 + startIndex + i];
        }
    }

    Notify.prototype.getMessageType = function () {
        return this.messageType;
    };

    Notify.prototype.getUpdateType = function () {
        return this.updateType;
    };

    Notify.prototype.getPayloadType = function () {
        return this.payLoadType;
    };

    Notify.prototype.getPayloadSize = function () {
        return this.payLoadSize;
    };

    Notify.prototype.getPayload = function () {
        return this.payLoad;
    };

    Notify.prototype.getPayloadString = function () {
        return util.bin2String(this.payLoad);
    };

    Notify.prototype.debug = function () {
        util.log("=========Notify=========");
        util.log("messageType : " + MessageType[this.getMessageType()]);
        util.log("updateType  : " + UpdateType[this.getUpdateType()]);
        util.log("payLoadType : " + PayloadType[this.getPayloadType()]);
        util.log("payLoadSize : " + this.getPayloadSize());
        util.log("payLoad     : " + this.getPayloadString());
    };

    return Notify;
})();

module.exports = Notify;