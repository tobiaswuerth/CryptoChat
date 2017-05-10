$(function() {
    var chat = $.connection.cryptoChatHub;

    var user;
    var room;
    var password;

    chat.client.getMessage = function(time, user, message) {
        var u = decrypt(user);
        var m = decrypt(message);
        $("#discussion").append("<li>[" + time + "] <strong>" + u + "</strong> : " + m + "</li>");
    };
    chat.client.error = function (message) {
        alert(message);
    };

    $.connection.hub.start().done(function() {
        $("#btnSendMessage").click(function() {
            var m = encrypt($("#txtMessage").val());
            chat.server.send(m);
            $("#txtMessage").val("").focus();
        });
        $("#btnJoin").click(function() {
            // todo validate inputs
            user = encrypt($("#txtUsername").val());
            room = encrypt($("#txtRoom").val());
            password = encrypt($("#txtPassword").val());

            chat.server.init(user, room);
        });
    });
});

var encrypt = function(data) {
    // todo
    return data;
};
var decrypt = function(data) {
    // todo
    return data;
};