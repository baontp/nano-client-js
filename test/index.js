var Client = require('../').Client;

var clientInst = new Client('localhost', 9000);
clientInst.connect('baontp', {});

setTimeout(function () {
    clientInst.sendAction('chat', 1, 'hello', 'bao2');
    clientInst.sendAction('buyTicket', [0, 1, 2, 3, 4, 5]);
}, 2000);

clientInst.onEvent('response', {
    onConnectionDone: function (result, msg) {
        console.log(result + ' : ' + msg);
    }
});


clientInst.onEvent('notify', {
    onUserJoinRoom: function (room, user) {

    }
});
