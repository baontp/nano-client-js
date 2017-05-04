var util = require('./util');
var constants = require('./constants');
var MessageType = constants.MessageType;
var PayloadType = constants.PayloadType;

var UpdatePeer = (function () {
    function UpdatePeer(responseBytes, index) {
        this.messageType = responseBytes[index++];
        this.updateType = responseBytes[index++];
        this.payLoadType = responseBytes[index++];
        this.payLoadSize = util.bytesToInt(responseBytes, index); index += 4;
        if (this.payLoadType == PayloadType.NUMBER) {
            if (this.payLoadSize == 1) {
                this.payLoad = responseBytes[index];
            }
            else {
                this.payLoad = util.bytesToInt(responseBytes, index);
            }
        } else {
            this.payLoad = new Uint8Array(this.payLoadSize);
            for (var i = 0; i < this.payLoadSize; i++) {
                this.payLoad[i] = responseBytes[index + i];
            }
        }
    }

    UpdatePeer.prototype.getMessageType = function () {
        return this.messageType;
    };

    UpdatePeer.prototype.getUpdateType = function () {
        return this.updateType;
    };

    UpdatePeer.prototype.getPayloadType = function () {
        return this.payLoadType;
    };

    UpdatePeer.prototype.getPayloadSize = function () {
        return this.payLoadSize;
    };

    UpdatePeer.prototype.getPayload = function () {
        return this.payLoad;
    };

    UpdatePeer.prototype.getPayloadString = function () {
        return util.bin2String(this.payLoad);
    };

    UpdatePeer.prototype.debug = function () {
        util.log("=========UpdatePeer=========");
        util.log("messageType : " + MessageType[this.getMessageType()]);
        util.log("UpdateType  : " + this.getUpdateType());
        util.log("payLoadType : " + PayloadType[this.getPayloadType()]);
        util.log("payLoadSize : " + this.getPayloadSize());
        util.log("payLoad     : " + this.getPayloadString());
    };

    return UpdatePeer;
})();

module.exports = UpdatePeer;