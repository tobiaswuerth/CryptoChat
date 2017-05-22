$(function() {
    // startup
    chat = $.connection.cryptoChatHub;

    chat.client.getMessage = handleGetMessage;
    chat.client.error = handleError;
    chat.client.userJoined = handleUserJoined;
    chat.client.userLeft = handleUserLeft;
    chat.client.initRequest = handleInitRequest;
    chat.client.userRenamed = handleUserRenamed;
    chat.client.getUsersInRoom = handleGetUsersInRoom;
    chat.client.initSuccess = handleInitSuccess;
    chat.client.initFailed = handleInitFailed;

    $.connection.hub.stateChanged(handleConnectionStateChanged);
    $.connection.hub.start({ waitForPageLoad: true }).done(UserInterface.initialize);
});