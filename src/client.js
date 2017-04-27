/**
 * Created by baonguyen on 4/24/2017.
 */
var browser = require('detect-browser');
var ee = require('events');
var MessageBuilder = require('./message-builder');
var Response = require('./response');
var Notify = require('./notify');
var UpdatePeer = require('./update-peer');
var Room = require('./room');
var util = require('./util');
var HashMap = require('hashmap');
var constants = require('./constants');
var ServiceType = constants.ServiceType;
var MessageType = constants.MessageType;
var PayloadType = constants.PayloadType;
var ResultCode = constants.ResultCode;
var RoomType = constants.RoomType;
var RequestType = constants.RequestType;
var NotifyType = constants.NotifyType;
var Event = constants.Event;

var client = (function () {
    function Client(hostname, port) {
        this._socket = null;
        this._hostname = hostname;
        this._port = port;
        this._eventHandlers = {};
        this._userActionHandler = {};
        this._updatePeerHandlers = {};
        this._sessionId = 0;
        this._recovering = false;
    }

    if (browser.name == 'node') {
        var WebSocket = require('ws');
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
            this._socket.on('open', function () {
                util.log('socket opened');
                client._isConnected = true;
                var payload = MessageBuilder.buildAuthRequest(0, userName, authData);
                var data = MessageBuilder.buildRequest(0, RequestType.AUTHENTICATE_USER, payload);
                client.send(data.buffer);
            });

            this._socket.on('close', function () {
                util.log('socket closed');
                client._isConnected = false;
            });

            this._socket.on('message', function (data) {
                client.onMessage(data);
            });
        };
    } else {
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
            this._socket.binaryType = 'arraybuffer';
            this._socket.onOpen = function () {
                util.log('socket opened');
                client._isConnected = true;
                var payload = MessageBuilder.buildAuthRequest(0, userName, authData);
                var data = MessageBuilder.buildRequest(0, RequestType.AUTHENTICATE_USER, payload);
                client.send(data.buffer);
            };

            this._socket.onClose = function () {
                util.log('socket closed');
                client._isConnected = false;
            };

            this._socket.on('message', function (msg) {
                client.onMessage(new Uint8Array(msg.data));
            });
        };
    }

    Client.prototype.onEvent = function (key, handler) {
        this._eventHandlers[key] = handler;
    };

    Client.prototype.onUserAction = function (handler) {
        this._userActionHandler = handler;
    };

    Client.prototype.onUpdatePeer = function (updateType, handler) {
        this._updatePeerHandlers[updateType] = handler;
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
            } else if (data[numDecoded] == MessageType.NOTIFY) {
                var notify = new Notify(data, numDecoded);
                numDecoded += this.handleNotify(notify);
            } else if (data[numDecoded] == MessageType.UPDATE) {
                var updatePeer = new UpdatePeer(data, numDecoded);
                numDecoded += this.handleUpdatePeer(updatePeer);
            }
        }
    };

    Client.prototype.handleResponse = function (message) {
        var requestType = message.getRequestType();
        var resultCode = message.getResultCode();
        var payload = JSON.parse(message.getPayloadString());
        switch (requestType) {
            case RequestType.AUTHENTICATE_USER: {
                if (resultCode == ResultCode.SUCCESS) {
                    this._sessionId = payload.sessionId;
                    this._isConnected = false;
                    if (this._recovering == true) {
                        resultCode = ResultCode.SUCCESS_RECOVERED;
                        this._recovering = false;
                    }
                } else {
                    this._isConnected = false;
                }

                this.emitResponse(Event.onConnectionDone, resultCode, payload.message);
                break;
            }
            case RequestType.USER_ACTION: {
                this.emitResponse(Event.onUserActionDone, resultCode, payload.a, payload.m);
                break;
            }
            case RequestType.JOIN_ROOM:
            case RequestType.CREATE_ROOM:
            case RequestType.LEAVE_ROOM:
            case RequestType.FIND_ROOM: {
                var room = new Room(payload);
                this.emitResponse(requestType, room, resultCode);
                break;
            }
        }
    };

    Client.prototype.handleNotify = function (message) {
        var notifyType = message.getNotifyType();
        var payload = JSON.parse(message.getPayloadString());
        var room;
        switch (notifyType) {
            case NotifyType.USER_ACTION: {
                this.emitUserAction(payload.a, payload.p);
                break;
            }
            case NotifyType.USER_JOINED_ROOM: {
                room = new Room(payload);
                this.emitNotify(Event.onUserJoinedRoom, room);
                break;
            }
            case NotifyType.USER_LEFT_ROOM: {
                room = new Room(payload);
                this.emitNotify(Event.onUserLeftRoom, room);
                break;
            }
        }
    };

    Client.prototype.handleUpdatePeer = function (message) {
        if(message.getPayloadType() == PayloadType.JSON) {
            this.emitUpdatePeer(message.getUpdateType(), message.getPayloadString());
        } else {
            this.emitUpdatePeer(message.getUpdateType(), message.getPayload());
        }
    };

    Client.prototype.sendAction = function (action) {
        var args = [];
        for (var i = 1; i < arguments.length; ++i) {
            args[i - 1] = arguments[i];
        }
        var payload = MessageBuilder.buildActionRequest(action, args);
        var data = MessageBuilder.buildRequest(this._sessionId, RequestType.USER_ACTION, payload);
        this.send(data.buffer);
    };

    Client.prototype.emitResponse = function (event) {
        var args = [];
        for (var i = 1; i < arguments.length; ++i) {
            args[i - 1] = arguments[i];
        }
        var eventHandler = this._eventHandlers['response'];
        if (eventHandler[Event[event]]) {
            eventHandler[Event[event]].apply(this, args);
        } else {
            util.log('>>    Response Event ', Event[event], 'is not handled');
        }
    };

    Client.prototype.emitNotify = function (eventType) {
        var args = [];
        for (var i = 1; i < arguments.length; ++i) {
            args[i - 1] = arguments[i];
        }
        var eventHandler = this._eventHandlers['notify'];
        if (eventHandler[Event[eventType]]) {
            eventHandler[Event[eventType]].apply(this, args);
        } else {
            util.log('>>    Notify Event ', Event[eventType], 'is not handled');
        }
    };

    Client.prototype.emitUserAction = function (action, params) {
        if (this._userActionHandler[action]) {
            this._userActionHandler[action].apply(this, params);
        } else {
            util.log('user action', action, 'is not handled');
        }
    };

    Client.prototype.emitUpdatePeer = function (updateType, payload) {
        if (this._updatePeerHandlers[updateType]) {
            this._updatePeerHandlers[updateType].call(this, payload);
        } else {
            util.log('update type', updateType, ' is not handled');
        }
    };

    Client.prototype.findRoom = function () {
        var data = MessageBuilder.buildRequest(this._sessionId, RequestType.FIND_ROOM);
        this.send(data.buffer);
    };

    Client.prototype.joinRoom = function (roomId) {
        var data = MessageBuilder.buildRequest(this._sessionId, RequestType.JOIN_ROOM, JSON.stringify({id: roomId}));
        this.send(data.buffer);
    };

    return Client;
})();

exports.recoveryAllowance = 0;
exports.logEnabled = true;

module.exports = client;