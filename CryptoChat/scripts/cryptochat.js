let user;
let room;
let key;

const UNIQUE_APPLICATION_CODE = "69b2af88e0c9de7333ca4526cd0557822916bff1733e7acdbfd9829f69eae22e6ff8ffd377cd6850a68c049061557c422adc72175db612ad623d2a728c5d4091";

const handleGetMessage = function(time, user, message) {
    const u = decrypt(user);
    const m = decrypt(message);
    $("#discussion").append(`<li>[${time}] <strong>${u}</strong> : ${m}</li>`);
};
const handleError = function(message) {
    alert(message);
};
const onBtnSendMessageClick = function() {
    const m = encrypt($("#txtMessage").val());
    chat.server.send(m);
    $("#txtMessage").val("").focus();
};
const onBtnJoinClick = function() {
    // todo validate inputs
    user = encrypt($("#txtUsername").val());
    room = encrypt($("#txtRoom").val());
    password = encrypt($("#txtPassword").val());

    chat.server.init(user, room);
};
const initialize = function() {
    $("#btnSendMessage").click(onBtnSendMessageClick);
    $("#btnJoin").click(onBtnJoinClick);
};

// startup
$(function() {
    const chat = $.connection.cryptoChatHub;

    chat.client.getMessage = handleGetMessage;
    chat.client.error = handleError;

    $.connection.hub.start().done(initialize);
});

const encrypt = function(data) {
    if (null == key) {
        throw "IllegalStateException";
    }
    return CryptoJS.AES.encrypt(data, key, { mode: CryptoJS.mode.CTR, iv : CryptoJS.enc.Hex.parse(UNIQUE_APPLICATION_CODE) }).toString(CryptoJS.enc.Base64);
};
const decrypt = function(data) {
    if (null == key) {
        throw "IllegalStateException";
    }
    return CryptoJS.AES.decrypt(data, key, { mode: CryptoJS.mode.CTR, iv : CryptoJS.enc.Hex.parse(UNIQUE_APPLICATION_CODE) }).toString(CryptoJS.enc.Utf8);
};
const keyGenerationStatusCallback = function(percentDone) {
    console.log(`Computed ${percentDone}%/100%`);
};

const startKeyGeneration = function(pass, room) {
    // calcualte iterations based on password hash
    const hashPass = CryptoJS.SHA3(pass, { outputLength: 512 }).toString(CryptoJS.enc.Hex);
    let iterations = stringToInt(hashPass);
    iterations = Math.abs(iterations);
    iterations = iterations % 2000 + 2000; // between 2k and 4k iterations, based on password

    // generate inputs for key derivation
    const keySalt = CryptoJS.SHA3(room, { outputLength: 512 }).toString(CryptoJS.enc.Hex);
    const keyPassword = CryptoJS.SHA3(hashPass + keySalt, { outputLength: 512 }).toString(CryptoJS.enc.Hex);

    // start key generation
    key = CryptoJS.PBKDF2(keyPassword,
        keySalt,
        { keySize: 256 / 32, iterations: iterations, hasher: CryptoJS.algo.SHA3 },
        keyGenerationStatusCallback);
    console.log(key.toString(CryptoJS.enc.Hex));
};