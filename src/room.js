/**
 * Created by baonguyen on 4/26/2017.
 */
var room = (function () {
    function Room(payload) {
        this._id = payload.i;
        this._owner = payload.o;
        this._name = payload.n;
        this._maxUser = payload.m;
    }

    return Room;
})();

module.exports = room;