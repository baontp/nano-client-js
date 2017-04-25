/**
 * Created by baonguyen on 4/24/2017.
 */
var WebSocket = require('ws');
var ee = require('events');
var MessageBuilder = require('./message-builder');
var Response = require('./response');
var Notify = require('./notify');
var HashMap = require('hashmap');

var constants = require('./constants');
var ServiceType = constants.ServiceType;
var MessageType = constants.MessageType;
var PayloadType = constants.PayloadType;
var ResultCode = constants.ResultCode;
var RoomType = constants.RoomType;
var RequestType = constants.RequestType;
var EventType = constants.EventType;

var client = (function () {
    function Client(hostname, port) {
        this._socket = null;
        this._hostname = hostname;
        this._port = port;
        this._eventHandlers = {};
        this._sessionId = 0;
        this._recovering = false;
    }

    /**
     *
     * @param {String} hostname
     * @param {Number} port
     * @param {Object} authData
     */
    Client.prototype.connect = function (userName, authData) {
        if (!userName || !authData) {
            throw new Error('username/authData must have value');
        }

        this._authData = authData;

        var client = this;
        this._socket = new WebSocket('ws://' + this._hostname + ':' + this._port);
        // this._socket.binaryType = "arraybuffer";
        this._socket.on('open', function () {
            client._isConnected = true;
            var payload = MessageBuilder.buildAuthRequest(0, userName, authData);
            var data = MessageBuilder.buildRequest(0, RequestType.AUTHENTICATE_USER, payload, true);
            client.send(data.buffer);
        });

        this._socket.on('close', function () {
            client._isConnected = false;
        });

        this._socket.on('message', function (data) {
            client.onMessage(data);
        });
    };


    Client.prototype.onEvent = function (key, handler) {
        this._eventHandlers[key] = handler;
    };

    Client.prototype.send = function (data) {
        if (!!this._socket) {
            this._socket.send(data);
        }
    };

    Client.prototype.onMessage = function (data) {
        var numRead = data.length;
        var numDecoded = 0;

        while (numDecoded < numRead) {
            if (data[numDecoded] == MessageType.RESPONSE) {
                var res = new Response(data, numDecoded);
                numDecoded += this.handleResponse(res);
            } else if (data[numDecoded] == MessageType.UPDATE) {
                var notify = new Notify(data, numDecoded);
                numDecoded += this.handleNotify(notify);
            }
        }
    };

    Client.prototype.handleResponse = function (message) {
        var requestType = message.getRequestType();
        var resultCode = message.getResultCode();
        var payload = JSON.parse(message.getPayloadString());
        switch (requestType) {
            case RequestType.AUTHENTICATE_USER: {
                if(resultCode == ResultCode.SUCCESS) {
                    this._sessionId = payload.sessionId;
                    this._isConnected = false;
                    if (this._recovering == true) {
                        resultCode = ResultCode.SUCCESS_RECOVERED;
                        this._recovering = false;
                    }
                } else {
                    this._isConnected = false;
                }

                this.emitResponseEvent(EventType.onConnectionDone, resultCode, payload.message);
                break;
            }
            case RequestType.USER_ACTION: {
                break;
            }
        }
    };

    Client.prototype.handleNotify = function (mesage) {

    };

    Client.prototype.sendAction = function (action) {
        var args = [];
        for (var i = 1; i < arguments.length; ++i) {
            args[i - 1] = arguments[i];
        }
        var payload = MessageBuilder.buildActionRequest(action, args);
        var data = MessageBuilder.buildRequest(0, 1, payload, true);
        this.send(data.buffer);
    };

    Client.prototype.emitResponseEvent = function(eventType) {
        var args = [];
        for (var i = 1; i < arguments.length; ++i) {
            args[i - 1] = arguments[i];
        }
        var eventHandler = this._eventHandlers['response'];
        if(eventHandler[EventType[eventType]]) {
            eventHandler[EventType[eventType]].apply(this, args);
        }
    };

    Client.prototype.emitNotifyEvent = function(eventType) {
        var args = [];
        for (var i = 1; i < arguments.length; ++i) {
            args[i - 1] = arguments[i];
        }
        var eventHandler = this._eventHandlers['notify'];
        if(eventHandler[EventType[eventType]]) {
            eventHandler[EventType[eventType]].apply(this, args);
        }
    };

    return Client;
})();

client.recoveryAllowance = 0;

module.exports = client;