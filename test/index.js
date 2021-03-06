var Client = require('../').Client;
var Util = require('../').Util;
var ResultCode = require('../').ResultCode;

var clientInst = new Client();
clientInst.init('localhost', 9000);
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
                clientInst.sendAction('joinChat');;
            }, 1000);
        }
    }
});

clientInst.onEvent('notify', {
    onUserJoinedRoom: function (room, user) {
        console.log('new user', user, 'join room');
    },

    onUserLeftRoom: function (room, user) {
        console.log('user', user, 'left room');
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

        clientInst.sendAction('chat', 'userName');
    },

    leaveChat: function (userName) {
        console.log(userName, 'leave chat room');
    }
});

var updatePeerHandler = {};

updatePeerHandler[UpdateType.CHAT_LIST] = function (payload) {

};
clientInst.onUpdatePeer(UpdateType.CHAT_LIST, function (users) {
    console.log('user list', users);
});