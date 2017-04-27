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
        this.messageType = responseBytes[startIndex++];
        this.notifyType = responseBytes[startIndex++];
        this.payLoadType = responseBytes[startIndex++];
        this.payLoadSize = util.bytesToInteger(responseBytes, startIndex); startIndex += 4;
        this.payLoad = new Uint8Array(this.payLoadSize);
        for (var i = 0; i < this.payLoadSize; i++) {
            this.payLoad[i] = responseBytes[startIndex + i];
        }
    }

    Notify.prototype.getMessageType = function () {
        return this.messageType;
    };

    Notify.prototype.getNotifyType = function () {
        return this.notifyType;
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
        util.log("notifyType  : " + UpdateType[this.getUpdateType()]);
        util.log("payLoadType : " + PayloadType[this.getPayloadType()]);
        util.log("payLoadSize : " + this.getPayloadSize());
        util.log("payLoad     : " + this.getPayloadString());
    };

    return Notify;
})();

module.exports = Notify;