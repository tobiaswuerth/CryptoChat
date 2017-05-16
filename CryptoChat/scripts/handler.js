const handleGetMessage = function(usr, msg, msgIv) {
    const u = decrypt(usr, DEFAULT_IV);
    const m = decrypt(msg, msgIv);
    usr = u.toString(CryptoJS.enc.Utf8);
    msg = m.toString(CryptoJS.enc.Utf8);
    insertNewMessage(usr, msg);
};
const insertNewMessage = function(user, message) {
    const d = new Date();
    message = filterXSS(message,
        {
            whiteList: [], // empty, means filter out all tags
            stripIgnoreTag: true, // filter out all HTML not in the whilelist
            stripIgnoreTagBody: ["script"] // the script tag is a special case, we need
            // to filter out its content
        });
    $("#discussion").append(`<li>[${d.toLocaleTimeString()}] <strong>${user}</strong> : ${message}</li>`);
};
const handleError = function(message) {
    alert(message);
};

const handleUserJoined = function(user) {
    user = decrypt(user, DEFAULT_IV).toString(CryptoJS.enc.Utf8);
    insertNewMessage("System", `User '${user}' joined the room`);
};
const handleUserLeft = function(user) {
    user = decrypt(user, DEFAULT_IV).toString(CryptoJS.enc.Utf8);
    insertNewMessage("System", `User '${user}' left the room`);
};
const handleInitRequest = function() {
    chat.server.init(user, room);
};
const handleUserRenamed = function(before, after) {
    before = decrypt(before, DEFAULT_IV).toString(CryptoJS.enc.Utf8);
    after = decrypt(after, DEFAULT_IV).toString(CryptoJS.enc.Utf8);
    insertNewMessage("System", `User '${before}' changed name to '${after}'`);
};
const handleConnectionStateChanged = function (state) {
    switch(state.newState) {
        case 0:
            handleConnecting();
            break;
        case 1:
            handleConnected();
            break;
        case 2:
            handleReconnecting();
            break;
        case 4:
            handleDisconnected();
            break;
    }
}
const handleConnected = function() {
    console.log("State changed to connected");
}
const handleConnecting = function () {
    console.log("State changed to connecting...");
}
const handleReconnecting = function () {
    console.log("State changed to reconnecting...");
}
const handleDisconnected = function () {
    console.log("State changed to disconnected");
}