let user;
let room;
let key;
let chat;

const DEFAULT_IV = CryptoJS.lib.WordArray.create("r6Dolxzt2G/c7yEQlgRXy+FbvEy9IzsElLTpkvHnDns=");

const onBtnSendMessageClick = function() {
    const e = encrypt($("#txtMessage").val().trim());
    if (!e) {
        // empty message
        return;
    }
    const msg = e.ciphertext.toString(CryptoJS.enc.Base64);
    chat.server.send(msg, e.iv);
    $("#txtMessage").val("").focus();
};

const onBtnJoinClick = function() {
    let p = $("#txtPassword").val();
    let r = $("#txtRoom").val().trim();
    let u = $("#txtUsername").val().trim();

    startKeyGeneration(p, r);

    // hash inputs
    p = CryptoJS.SHA3(p, { outputLength: 512 }).toString(CryptoJS.enc.Hex);
    r = CryptoJS.SHA3(r, { outputLength: 512 }).toString(CryptoJS.enc.Hex);

    u = encrypt(u, DEFAULT_IV);
    r = encrypt(p + r, DEFAULT_IV); // room identification is based on password and room

    user = u.ciphertext.toString(CryptoJS.enc.Base64);
    room = r.ciphertext.toString(CryptoJS.enc.Base64);

    chat.server.init(user, room);
};

const initialize = function() {
    $("#btnSendMessage").click(onBtnSendMessageClick);
    $("#btnJoin").click(onBtnJoinClick);
};

$(function() {
    // startup
    chat = $.connection.cryptoChatHub;

    chat.client.getMessage = handleGetMessage;
    chat.client.error = handleError;
    chat.client.userJoined = handleUserJoined;
    chat.client.userLeft = handleUserLeft;
    chat.client.initRequest = handleInitRequest;
    chat.client.userRenamed = handleUserRenamed;

    $.connection.hub.stateChanged(handleConnectionStateChanged);
    $.connection.hub.start({ waitForPageLoad: true }).done(initialize);
});