const handleGetMessage = function(usr, msg, msgIv) {
    const u = decrypt(usr, DEFAULT_IV);
    const m = decrypt(msg, msgIv);
    usr = u.toString(CryptoJS.enc.Utf8);
    msg = m.toString(CryptoJS.enc.Utf8);
    insertNewMessage(usr, msg);
};
const insertNewMessage = function(user, message) {
    message = filterXSS(message,
        {
            whiteList: [], // empty, means filter out all tags
            stripIgnoreTag: true, // filter out all HTML not in the whilelist
            stripIgnoreTagBody: ["script"] // the script tag is a special case, we need
            // to filter out its content
        });

    const entry = $("<li>");
    entry.addClass("list-group-item");
    entry.append(`[${new Date().toLocaleTimeString()}] `); // date
    const u = $("<strong>");
    u.text(user);
    entry.append(u);
    entry.append(" : ");
    entry.append(message);
    $("#chat").append(entry);
};
const handleError = function(message) {
    alert(message);
};

const handleUserJoined = function(user) {
    user = decrypt(user, DEFAULT_IV).toString(CryptoJS.enc.Utf8);
    insertNewMessage("System", `User '${user}' joined the room`);
    Caller.requestUsersInRoom();
};
const handleUserLeft = function(user) {
    user = decrypt(user, DEFAULT_IV).toString(CryptoJS.enc.Utf8);
    insertNewMessage("System", `User '${user}' left the room`);
    Caller.requestUsersInRoom();
};
const handleInitRequest = function() {
    Caller.init(user, room);
};
const handleUserRenamed = function(before, after) {
    before = decrypt(before, DEFAULT_IV).toString(CryptoJS.enc.Utf8);
    after = decrypt(after, DEFAULT_IV).toString(CryptoJS.enc.Utf8);
    insertNewMessage("System", `User '${before}' changed name to '${after}'`);
    Caller.requestUsersInRoom();
};
const handleConnectionStateChanged = function(state) {
    switch (state.newState) {
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
};
const handleConnected = function() {
    hide("divReconnecting");
};
const handleConnecting = function() {
    show("divReconnecting");
};
const handleReconnecting = function() {
    show("divReconnecting");
};
const handleDisconnected = function() {
    show("divReconnecting");
    $.connection.hub.start();
};
const handleGetUsersInRoom = function(data) {
    const list = $("#users");
    list.empty();

    data.forEach(x => {
        const entry = $("<li>");
        entry.addClass("list-group-item");
        entry.text(decrypt(x, DEFAULT_IV).toString(CryptoJS.enc.Utf8));
        list.append(entry);
    });
};
const handleInitSuccess = function() {
    hide("divKeyGeneration");
    hide("divJoin");
    show("divConversationControls");
};
const handleInitFailed = function(error) {
    hide("divKeyGeneration");
    show("divJoin");
    alert(error);
};