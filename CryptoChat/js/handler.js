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
            stripIgnoreTagBody: ["script"], // the script tag is a special case, we need to filter out its content
            onTag: function(t, h, o) {
                return " **sanitized** ";
            }
        });

    message = message.replace(/\n/g, "<br />");

    const b = $("<div>");
    b.css("min-width", "100%");
    b.css("display", "flex");
    b.css("margin-top", "2px");
    b.addClass("flex-sm-column");
    b.addClass("flex-column");
    b.addClass("flex-md-row");

    const d = $("<span>");
    d.addClass("badge");
    d.css("background-color", "rgba(0, 0, 0, .25)");
    d.text(new Date().toLocaleTimeString());
    b.append(d);

    const u = $("<strong>");
    u.addClass("margin-md-left-10");
    u.addClass("margin-md-right-5");
    u.css("word-wrap", "break-word");
    u.css("display", "inline-block");
    u.css("max-width", "100%");
    u.text(`${user}:`);
    b.append(u);

    const m = $("<div>");
    m.css("word-wrap", "break-word");
    m.css("word-break", "break-all");
    m.css("display", "inline-block");
    m.css("max-width", "100%");
    m.html(message);
    b.append(m);

    let color = colors[0];
    const chat = $("#divChat");

    const doScroll = chat.scrollTop() + chat.innerHeight() >= chat[0].scrollHeight;

    if (chat.children().length !== 0) {
        // not first entry
        const prev = chat.children().last();
        if (prev.prop("cc:user") === user) {
            // message from same user
            prev.append(b);
            if (doScroll) {
                UserInterface.scrollChatDown();
            }
            return;
        } else {
            color = prev.prop("cc:color");
        }
    }

    const root = $("<div>");
    root.addClass("alert");
    color = nextColor(color);
    root.css("background-color", color);
    root.css("margin-bottom", "2px");
    root.css("margin-top", "2px");
    root.prop("cc:user", user);
    root.prop("cc:color", color);
    root.css("flex-direction", "column");
    root.append(b);

    chat.append(root);
    if (doScroll) {
        UserInterface.scrollChatDown();
    }
};
const handleError = function(error) {
    $("#txtErrorMessage").text(error);
    UserInterface.updateProgressbar(0);
    show("divError");
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
    const list = $("#divUsers");
    list.empty();

    let color = colors[0];
    data.forEach(x => {
        const row = $("<div>");
        row.addClass("alert");
        color = nextColor(color);
        row.css("background-color", color);
        row.css("margin-bottom", "2px");
        row.css("margin-top", "2px");
        row.addClass("margin-sm-left-5", "2px");
        row.addClass("margin-sm-right-5", "2px");
        row.text(decrypt(x, DEFAULT_IV).toString(CryptoJS.enc.Utf8));
        list.append(row);
    });
};
const handleInitSuccess = function() {
    hide("divKeyGeneration");
    hide("divSettings");
    show("divContent");
    UserInterface.updateProgressbar(0);
    $("#txtMessage").focus();
};
const handleInitFailed = function(error) {
    hide("divKeyGeneration");
    show("divSettings");
    $("#txtErrorMessage").text(error);
    show("divError");
    setTimeout(function() {
            UserInterface.updateProgressbar(0);
        },
        200);
};