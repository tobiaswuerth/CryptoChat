let user;
let room;
let key;
let chat;

const colors = [
    "#efc4c4", "#efd2c4", "#efe1c4", "#efefc4", "#e1efc4", "#d2efc4", "#c4efc4", "#c4efd2",
    "#c4efe1", "#c4efef", "#c4e1ef", "#c4d2ef", "#c4c4ef", "#d2c4ef", "#e1c4ef", "#efc4ef",
    "#efc4e1", "#efc4d2"
];
const hide = function(id) {
    const obj = $(`#${id}`);
    obj.addClass("display-none");
    obj.removeClass("flex");
};
const show = function(id) {
    const obj = $(`#${id}`);
    obj.removeClass("display-none");
    obj.addClass("flex");
};
const replaceClass = function(id, from, to) {
    const obj = $(`#${id}`);
    obj.removeClass(from);
    obj.addClass(to);
};
const showTooltipIf = function(id, target, func, trimmed) {
    const obj = $(`#${id}`);
    const t = $(`#${target}`);
    if (func(obj, trimmed)) {
        t.tooltip("show");
        setTimeout(function() {
                t.tooltip("hide");
            },
            1000);
    } else {
        t.tooltip("hide");
    }
};
const removeTooltip = function(obj) {
    obj.tooltip("dispose");
};
const removePopover = function(obj) {
    obj.popover("dispose");
};
const inputfieldToFailedStateIf = function(id, target, func, trimmed) {
    if (!func($(`#${id}`), trimmed)) {
        replaceClass(target, "has-danger", "has-success");
        replaceClass(id, "form-control-danger", "form-control-success");
    } else {
        replaceClass(target, "has-success", "has-danger");
        replaceClass(id, "form-control-success", "form-control-danger");
    }
};
const isValueEmpty = function(obj, trimmed = true) {
    if (trimmed) {
        return obj.val().trim() === "";
    }
    return obj.val() === "";
};
const nextColor = function(color) {
    return colors.indexOf(color) + 1 === colors.length ? colors[0] : colors[colors.indexOf(color) + 1];
};
const UserInterface = {
    initialize: function() {
        $.connection.hub.stateChanged(handleConnectionStateChanged);

        $("#txtUsername").focus();

        $("#btnSendMessage").click(UserInterface.onBtnSendMessageClick);
        $("#btnApplySettings").click(UserInterface.onBtnJoinClick);
        $("#btnShowHideUserList").click(UserInterface.onBtnShowHideUserListClick);
        $("#btnRandomPassword").click(UserInterface.onBtnGeneratePasswordClick);
        $("#btnShowHidePassword").click(UserInterface.onBtnShowHidePasswordClick);
        $("#btnLeaveRoom").click(UserInterface.onBtnLeaveRoomClicked);
        $("#btnLeaveRoomApproved").click(UserInterface.onBtnLeaveRoomApprovedClicked);
        $("#btnLeaveRoomDenied").click(UserInterface.onBtnLeaveRoomDeniedClicked);
        $("#btnErrorOk").click(UserInterface.onBtnErrorOkClicked);
        $("#btnSettings").click(UserInterface.onBtnSettingsClicked);
        $("#btnCancelSettings").click(UserInterface.onBtnCancelSettingsClicked);
        $("#txtMessage").keyup(UserInterface.onTxtMessageKeyUp);
        $("#txtMessage").keydown(UserInterface.onTxtMessageKeyDown);
        $("#txtMessage").blur(UserInterface.onTxtMessageBlur);
        $("#divChat").scroll(UserInterface.updateBtnScrollDown);
        $("#btnScrollDown").click(UserInterface.scrollChatDown);

        const txtPass = $("#txtPassword");
        const txtRoom = $("#txtRoom");
        const txtUsername = $("#txtUsername");

        txtPass.keyup(UserInterface.onTxtPasswordKeyUp);
        txtPass.blur(UserInterface.onTxtPasswordKeyUp);

        txtRoom.keyup(UserInterface.onTxtRoomKeyUp);
        txtRoom.blur(UserInterface.onTxtRoomKeyUp);

        txtUsername.keyup(UserInterface.onTxtUsernameKeyUp);
        txtUsername.blur(UserInterface.onTxtUsernameKeyUp);

        const tooltips = new Array(/* [ obj, title, placement if no space right, trigger, delay show (ms) ] */
            [$("#rowPassword"), "Input cannot be empty", "top", "manual", 0],
            [$("#rowRoom"), "Input cannot be empty", "top", "manual", 0],
            [$("#rowUsername"), "Input cannot be empty", "top", "manual", 0],
            [$("#btnRandomPassword"), "Generate a new random password", "left", "hover", 500],
            [$("#btnCopyPassword"), "Copy password to clipboard", "left", "hover", 500],
            [$("#btnShowHidePassword"), "Show/Hide password", "left", "hover", 500],
            [$("#btnShowHideUserList"), "Show/Hide users", "right", "hover", 500],
            [$("#btnLeaveRoom"), "Leave room", "right", "hover", 500],
            [$("#btnSettings"), "Settings", "right", "hover", 500]
        );

        tooltips.forEach(function(i) {
            removeTooltip(i[0]);
            i[0].tooltip({
                title: i[1],
                placement: function() {
                    return $(window).width() < 975 ? i[2] : "right";
                },
                trigger: i[3],
                delay: { show: i[4] }
            });
        });

        const clipboard = new Clipboard("#btnCopyPassword",
            {
                text: function(trigger) {
                    return $("#txtPassword").val();
                }
            });

        hide("divSplashscreen");
    },
    activeKeys: [],

    onTxtMessageKeyUp: function(event) {
        const ak = new Array();
        UserInterface.activeKeys.forEach(function(v, k) {
            if (v) {
                ak.push(k);
            }
        });
        UserInterface.activeKeys[event.keyCode] = false;

        if (ak.length === 1 && ak[0] === 13) {
            // only enter pressed -> send
            UserInterface.onBtnSendMessageClick();
        }
    },
    onTxtMessageKeyDown: function(event) {
        UserInterface.activeKeys[event.keyCode] = true;
    },
    onTxtMessageBlur: function() {
        UserInterface.activeKeys.forEach(function(i, idx) {
            UserInterface.activeKeys[idx] = false;
        });
    },
    onBtnSettingsClicked: function() {
        hide("rowPassword");
        hide("rowPasswordStrength");
        hide("rowRoom");
        const btnApply = $("#btnApplySettings");
        btnApply.text("Apply Changes");
        btnApply.unbind("click");
        btnApply.click(UserInterface.onBtnApplyClicked);
        show("rowCancelSettings");
        setTimeout(function() {
                show("divSettings");
            },
            200);
    },
    scrollChatDown: function() {
        const chat = $("#divChat");
        chat.animate({ scrollTop: chat.prop("scrollHeight") }, 500);

        UserInterface.updateBtnScrollDown();
    },
    updateBtnScrollDown: function() {
        setTimeout(function() {
                const divChat = $("#divChat");
                if (divChat.scrollTop() + divChat.innerHeight() >= divChat[0].scrollHeight) {
                    // div at bottom
                    hide("btnScrollDown");
                } else {
                    show("btnScrollDown");
                }
            },
            500);
    },
    onBtnApplyClicked: function() {
        let u = $("#txtUsername").val().trim();
        u = encrypt(u, DEFAULT_IV);
        user = u.ciphertext.toString(CryptoJS.enc.Base64);
        Caller.init(user, room);
        UserInterface.onBtnCancelSettingsClicked();
    },
    onBtnErrorOkClicked: function() {
        hide("divError");
    },
    onBtnCancelSettingsClicked: function() {
        hide("divSettings");
        setTimeout(function() {
                show("rowPassword");
                show("rowPasswordStrength");
                show("rowRoom");
                const btnApply = $("#btnApplySettings");
                btnApply.text("Join");
                btnApply.unbind("click");
                btnApply.click(UserInterface.onBtnJoinClick);
                hide("rowCancelSettings");
            },
            200);
    },
    onBtnLeaveRoomClicked: function() {
        show("divLeaveRoom");
    },
    onBtnLeaveRoomApprovedClicked: function() {
        Caller.init(null, null);
        hide("divLeaveRoom");
        hide("divContent");
        hide("rowCancelSettings");
        show("divSettings");
        $("#divChat").empty();
        window.user = null;
        window.key = null;
        window.room = null;
    },
    onBtnLeaveRoomDeniedClicked: function() {
        hide("divLeaveRoom");
    },
    onTxtPasswordKeyUp: function(event) {
        UserInterface.updatePasswordField();
        UserInterface.updateInputField("Password", false);

        if (null != event && 13 === event.keyCode) {
            // enter
            UserInterface.onBtnJoinClick();
        }
    },
    onBtnGeneratePasswordClick: function() {
        const r1 = Math.random().toString(36).slice(2);
        const r2 = Math.random().toString(36).slice(2);
        const pw = r1 + r2;
        $("#txtPassword").val(pw);
        UserInterface.onTxtPasswordKeyUp(null);
    },
    onBtnShowHidePasswordClick: function() {
        const obj = $("#txtPassword");
        if (obj.attr("type") === "text") {
            obj.attr("type", "password");
            replaceClass("icoShowHide", "fa-eye-slash", "fa-eye");
        } else {
            obj.attr("type", "text");
            replaceClass("icoShowHide", "fa-eye", "fa-eye-slash");
        }
    },
    onTxtRoomKeyUp: function(event) {
        UserInterface.updateInputField("Room");

        if (null != event && 13 === event.keyCode) {
            // enter
            $("#txtPassword").focus();
        }
    },
    onTxtUsernameKeyUp: function(event) {
        UserInterface.updateInputField("Username");
        if (null != event && 13 === event.keyCode) {
            // enter
            $("#txtRoom").focus();
        }
    },
    onBtnSendMessageClick: function() {
        let msg = $("#txtMessage").val().trim();
        if (!msg) {
            // empty
            return;
        }
        const e = encrypt(msg);
        msg = e.ciphertext.toString(CryptoJS.enc.Base64);
        Caller.sendMessage(msg, e.iv);
        $("#txtMessage").val("").focus();
    },
    onBtnJoinClick: function() {
        if (!UserInterface.updateJoinButtonState()) {
            return;
        }
        removePopover($("#divPwStrengthWrapper"));
        show("divKeyGeneration");

        $("#txtKeyGenerationAction").text("Generating Key...");

        let p = $("#txtPassword").val();
        let r = $("#txtRoom").val().trim();
        let u = $("#txtUsername").val().trim();

        if (p.length > 128 || r.length > 128 || u.length > 24) {
            hide("divKeyGeneration");
            handleError("Invalid input data");
            return;
        }

        const worker = new Worker("js/worker/keyworker.js");
        worker.onmessage = function(d) {
            const data = d.data || {};
            switch (data.type) {
                case "status":
                    UserInterface.updateProgressbar(Math.floor(data.value));
                    break;
                case "done":
                    key = JSON.parse(data.value);

                    $("#txtKeyGenerationAction").text("Encrypting inputs...");

                    // hash inputs
                    p = CryptoJS.SHA3(p, { outputLength: 512 }).toString(CryptoJS.enc.Hex);
                    r = CryptoJS.SHA3(r, { outputLength: 512 }).toString(CryptoJS.enc.Hex);

                    u = encrypt(u, DEFAULT_IV);
                    r = encrypt(p + r, DEFAULT_IV); // room identification is based on password and room

                    user = u.ciphertext.toString(CryptoJS.enc.Base64);
                    room = r.ciphertext.toString(CryptoJS.enc.Base64);

                    $("#txtKeyGenerationAction").text("Initializing...");
                    Caller.init(user, room);
                    break;
            }
        };
        worker.postMessage({ cmd: "startKeyGeneration", param: { pass: p, room: r } });
    },
    onBtnShowHideUserListClick: function() {
        if ($("#divUserList").is(":visible")) {
            hide("divUserList");
            setTimeout(function() {
                    replaceClass("divConversationWrapper", "col-xl-9", "col-xl-12");
                    replaceClass("divConversationWrapper", "col-lg-9", "col-lg-12");
                    replaceClass("divConversationWrapper", "col-md-9", "col-md-12");
                },
                200);
        } else {
            show("divUserList");
            replaceClass("divConversationWrapper", "col-xl-12", "col-xl-9");
            replaceClass("divConversationWrapper", "col-lg-12", "col-lg-9");
            replaceClass("divConversationWrapper", "col-md-12", "col-md-9");
        }
    },

    updatePasswordFieldTimeout: null,
    updatePasswordField: function() {
        const pw = $("#txtPassword").val();
        const pwRow = $("#divPwStrengthWrapper");
        const obj = $("#pbPwStrength");

        obj.removeClass("bg-success");
        obj.removeClass("bg-warning");
        obj.addClass("bg-danger");
        obj.width("1%");

        if (pw === "") {
            removePopover(pwRow);
            return;
        }

        const pwCheckResult = window.zxcvbn(pw);
        let pbPercentage = pwCheckResult.score * 100 / 4; // 4 -> max score -> good pw

        // update percentage
        if (1 < pbPercentage) {
            obj.width(pbPercentage + "%");
        }

        // update color
        if (pbPercentage > 50 && pbPercentage < 76) {
            obj.removeClass("bg-success");
            obj.removeClass("bg-danger");
            obj.addClass("bg-warning");
        } else if (pbPercentage > 75) {
            obj.removeClass("bg-warning");
            obj.removeClass("bg-danger");
            obj.addClass("bg-success");
        }

        // check suggestions
        if (pwCheckResult.feedback.suggestions.length <= 0) {
            removePopover(pwRow);
            return;
        }

        // build popover
        let popb = $("<div>");

        $(document).on("mouseover",
            popb,
            function() {
                removePopover(pwRow);
            });

        if (pwCheckResult.feedback.warning !== "") {
            // build warning
            let warningDiv = $("<div>");
            warningDiv.addClass("alert alert-warning");
            popb.append(warningDiv);

            let wtitle = $("<b>");
            wtitle.text("Warning");
            warningDiv.append(wtitle);

            warningDiv.append($("<br>"));

            let wmsg = $("<span>");
            wmsg.text(pwCheckResult.feedback.warning);
            warningDiv.append(wmsg);
        }

        // build suggestions
        let suggestionDiv = $("<div>");
        suggestionDiv.addClass("alert alert-info no-margin flex flex-column");
        popb.append(suggestionDiv);

        let stitle = $("<b>");
        stitle.text("Suggestions");
        suggestionDiv.append(stitle);

        suggestionDiv.append($("<br>"));

        pwCheckResult.feedback.suggestions.forEach(function(i) {
            const li = $("<span>");
            li.text(`• ${i}`);
            suggestionDiv.append(li);
        });

        removePopover(pwRow);
        pwRow.popover({
            animation: true,
            html: true,
            content: popb.html(),
            placement: function() {
                return $(window).width() < 875 ? "bottom" : "right";
            }
        });
        clearTimeout(UserInterface.updatePasswordFieldTimeout);
        pwRow.popover("show");
        UserInterface.updatePasswordFieldTimeout = setTimeout(function() {
                removePopover(pwRow);
            },
            2000);
    },
    updateInputField: function(identifier, trimmed = true) {
        showTooltipIf(`txt${identifier}`, `row${identifier}`, isValueEmpty, trimmed);
        inputfieldToFailedStateIf(`txt${identifier}`, `row${identifier}`, isValueEmpty, trimmed);
        UserInterface.updateJoinButtonState();
    },
    updateJoinButtonState: function() {
        const obj = $("#btnApplySettings");
        if ($("#txtPassword").val() === "" || $("#txtRoom").val().trim() === "" || $("#txtUsername").val().trim() === "") {
            obj.addClass("disabled");
            return false;
        } else {
            obj.removeClass("disabled");
            return true;
        }
    },
    updateProgressbar: function(percent) {
        const ppc = $(".progress-pie-chart");
        const deg = 360 * percent / 100;
        if (percent > 50) {
            ppc.addClass("gt-50");
        } else {
            ppc.removeClass("gt-50");
        }
        $(".ppc-progress-fill").css("transform", `rotate(${deg}deg)`);
        $(".ppc-percents span").html(percent + "%");
    }
}
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
const DEFAULT_IV = CryptoJS.lib.WordArray.create("r6Dolxzt2G/c7yEQlgRXy+FbvEy9IzsElLTpkvHnDns=");

const encrypt = function(data, iv = null) {
    if (null == key) {
        throw "IllegalStateException";
    }
    if (null == iv) {
        iv = CryptoJS.lib.WordArray.random(256 / 8);
    }
    return CryptoJS.AES.encrypt(data, key, { mode: CryptoJS.mode.CTR, iv: iv });
};
const decrypt = function(data, iv) {
    if (null == key) {
        throw "IllegalStateException";
    }
    return CryptoJS.AES.decrypt(data, key, { mode: CryptoJS.mode.CTR, iv: iv });
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
    chat.client.getUsersInRoom = handleGetUsersInRoom;
    chat.client.initSuccess = handleInitSuccess;
    chat.client.initFailed = handleInitFailed;

    $.connection.hub.start({ waitForPageLoad: true }).done(UserInterface.initialize);
});