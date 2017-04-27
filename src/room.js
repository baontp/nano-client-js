/**
 * Created by baonguyen on 4/26/2017.
 */
var room = (function () {
    function Room(payload) {
            this.id = payload.i;
            this.owner = payload.o;
            this.name = payload.n;
            this.maxUser = payload.m;
            this.desc = payload.d;
    }

    return Room;
})();

module.exports = room;