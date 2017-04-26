var Client = require('../').Client;
var ResultCode = require('../').ResultCode;

var clientInst = new Client('localhost', 9000);
clientInst.connect('baontp', {});

setTimeout(function () {
    clientInst.findRoom();
}, 2000);

clientInst.onEvent('response', {
    onConnectionDone: function (result, msg) {
        console.log(result + ' : ' + msg);
    },

    onFindRoomDone: function (room, result) {
        if(!!room){
            clientInst.joinRoom(room.id);
        }
    },

    onJoinRoomDone:function (room, result) {
        if(result == ResultCode.SUCCESS) {
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

clientInst.onEvent('user-action', {});

var browser = require('detect-browser');

console.log(browser.name);
console.log(browser.version);