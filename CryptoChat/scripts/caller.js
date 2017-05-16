const Caller = {
    sendMessage: function(msg, iv) {
        chat.server.send(msg, iv);
    },

    init: function(user, room) {
        chat.server.init(user, room);
    },

    requestUsersInRoom: function() {
        chat.server.requestUsers();
    }
}