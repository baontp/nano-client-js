var Client = require('../').Client;
var Util = require('../').Util;
var ResultCode = require('../').ResultCode;

var clientInst = new Client('localhost', 9000);
clientInst.connect('baontp', {});

var UpdateType = {
    CHAT_LIST: 0,
};

setTimeout(function () {
    console.log("findRoom");
    clientInst.findRoom();
}, 2000);

clientInst.onEvent('response', {
    onConnectionDone: function (result, msg) {
        console.log(result + ' : ' + msg);
    },

    onUserActionDone: function (result, action, desc) {
        if(action == 'buyTicket' && result == ResultCode.SUCCESS) {

        }
        console.log('perform action', action, 'with result', ResultCode[result], 'with desc', desc);
    },

    onFindRoomDone: function (room, result) {
        if (result == ResultCode.SUCCESS) {
            console.log('join room', room.id);
            clientInst.joinRoom(room.id);
        }
    },

    onJoinRoomDone: function (room, result) {
        if (result == ResultCode.SUCCESS) {
            setTimeout(function () {
                console.log('join chat');
                clientInst.sendAction('joinChat');
                // clientInst.sendAction('buyTicket', [0, 1, 2, 3, 4, 5]);
            }, 1000);
        }
    }

});

clientInst.onEvent('notify', {
    onUserJoinRoom: function (room, user) {
        console.log('new user', user.name, 'join room');
    },

    onUserLeftRoom: function (room, user) {
        console.log('user', user.name, 'left room');
    }
});

clientInst.onUserAction({
    chat: function (sender, message, isPrivate) {
        if (isPrivate) {
            console.log('on private chat', sender, ": ", message);
        } else {
            console.log('on Chat', sender, ": ", message);
        }

        setTimeout(function () {
            clientInst.sendAction('leaveChat');
        }, 1000);
    },

    joinChat: function (userName) {
        console.log(userName, 'join chat room');

        clientInst.sendAction('chat', 'hello', 'vinhnt');
    },

    leaveChat: function (userName) {
        console.log(userName, 'leave chat room');
    }
});

var updatePeerHandler = {};

updatePeerHandler[UpdateType.CHAT_LIST] = function (payload) {

};
clientInst.onUpdatePeer(UpdateType.CHAT_LIST, function (payload) {
    var users = JSON.parse(payload);
    console.log('user list', users);
});