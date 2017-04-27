var Client = require('../').Client;
var ResultCode = require('../').ResultCode;

var clientInst = new Client('localhost', 9000);
clientInst.connect('baontp', {});

setTimeout(function () {
    console.log("findRoom");
    clientInst.findRoom();
}, 2000);

clientInst.onEvent('response', {
    onConnectionDone: function (result, msg) {
        console.log(result + ' : ' + msg);
    },

    onUserActionDone: function (result, action) {
        console.log('perform action ' + action + ' with result ' + ResultCode[result]);
    },

    onFindRoomDone: function (room, result) {
        if (result == ResultCode.SUCCESS) {
            clientInst.joinRoom(room.id);
        }
    },

    onJoinRoomDone: function (room, result) {
        if (result == ResultCode.SUCCESS) {
            setTimeout(function () {
                clientInst.sendAction('chat', 1, 'hello', 'bao2');
                // clientInst.sendAction('buyTicket', [0, 1, 2, 3, 4, 5]);
            }, 1000);
        }
    }

});


clientInst.onEvent('notify', {
    onUserJoinRoom: function (room, user) {

    }
});

clientInst.onUserAction({
    chat: function (sender, message, isPrivate) {
        if (isPrivate) {
            console.log('on private chat', sender,": ", message);
        } else {
            console.log('on Chat', sender,": ", message);
        }
    }
});