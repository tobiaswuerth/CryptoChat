const UserInterface = {
    initialize: function () {
        $.connection.hub.stateChanged(handleConnectionStateChanged);
        $("[data-toggle='tooltip']").tooltip({
            placement: function () { return $(window).width() < 975 ? "top" : "right"; }
        });
        $("[data-toggle='popover']").popover({
            placement: function () { return $(window).width() < 975 ? "top" : "right"; }
        });

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

        const txtPass = $("#txtPassword");
        const txtRoom = $("#txtRoom");
        const txtUsername = $("#txtUsername");

        txtPass.keyup(UserInterface.onTxtPasswordKeyUp);
        txtPass.blur(UserInterface.onTxtPasswordKeyUp);

        txtRoom.keyup(UserInterface.onTxtRoomKeyUp);
        txtRoom.blur(UserInterface.onTxtRoomKeyUp);

        txtUsername.keyup(UserInterface.onTxtUsernameKeyUp);
        txtUsername.blur(UserInterface.onTxtUsernameKeyUp);

        const rowPass = $("#rowPassword");
        const rowRoom = $("#rowRoom");
        const rowUser = $("#rowUsername");

        removeTooltip(rowPass);
        removeTooltip(rowRoom);
        removeTooltip(rowUser);

        rowPass.tooltip({
            title: "Input cannot be empty",
            placement: function () { return $(window).width() < 975 ? "top" : "right"; },
            trigger: "manual",
            html: false,
            animation: true
        });
        rowRoom.tooltip({
            title: "Input cannot be empty",
            placement: function () { return $(window).width() < 975 ? "top" : "right"; },
            trigger: "manual",
            html: false,
            animation: true
        });
        rowUser.tooltip({
            title: "Input cannot be empty",
            placement: function () { return $(window).width() < 975 ? "top" : "right"; },
            trigger: "manual",
            html: false,
            animation: true
        });
    },
    activeKeys: [],
    onTxtMessageKeyUp: function(event) {
        UserInterface.activeKeys[event.keyCode] = false;
        UserInterface.activeKeys.forEach(function (i, idx) {
            console.log(idx + " " + i);
        });
    },
    onTxtMessageKeyDown: function (event) {
        UserInterface.activeKeys[event.keyCode] = true;
        UserInterface.activeKeys.forEach(function (i, idx) {
            console.log(idx + " " + i);
        });
    },
    onTxtMessageBlur: function() {
        UserInterface.activeKeys.forEach(function(i) {
            activeKeys[i] = false;
        });
        UserInterface.activeKeys.forEach(function (i, idx) {
            console.log(idx + " " + i);
        });
    },
    onBtnSettingsClicked: function () {
        hide("rowPassword");
        hide("rowPasswordStrength");
        hide("rowRoom");
        const btnApply = $("#btnApplySettings");
        btnApply.text("Apply Changes");
        btnApply.click(UserInterface.onBtnApplyClicked);
        show("rowCancelSettings");
        setTimeout(function () {
            show("divSettings");
        }, 200);
    },
    onBtnApplyClicked: function () {

    },
    onBtnErrorOkClicked: function () {
        hide("divError");
    },
    onBtnCancelSettingsClicked: function () {
        hide("divSettings");
        setTimeout(function () {
            show("rowPassword");
            show("rowPasswordStrength");
            show("rowRoom");
            const btnApply = $("#btnApplySettings");
            btnApply.text("Join");
            btnApply.click(UserInterface.onBtnJoinClick);
            hide("rowCancelSettings");
        }, 200);
    },
    onBtnLeaveRoomClicked: function () {
        show("divLeaveRoom");
    },
    onBtnLeaveRoomApprovedClicked: function () {
        Caller.init(null, null);
        hide("divLeaveRoom");
        hide("divConversationControls");
        show("divSettings");
        $("#chat").empty();
        window.user = null;
        window.key = null;
        window.room = null;
    },
    onBtnLeaveRoomDeniedClicked: function () {
        hide("divLeaveRoom");
    },
    onTxtPasswordKeyUp: function (event) {
        UserInterface.updatePasswordField();
        UserInterface.updateInputField("Password");

        if (null != event && 13 === event.keyCode) {
            // enter
            UserInterface.onBtnJoinClick();
        }
    },
    onBtnGeneratePasswordClick: function () {
        const r1 = Math.random().toString(36).slice(2);
        const r2 = Math.random().toString(36).slice(2);
        const pw = r1 + r2;
        $("#txtPassword").val(pw);
        UserInterface.onTxtPasswordKeyUp(null);
    },
    onBtnShowHidePasswordClick: function () {
        const obj = $("#txtPassword");
        if (obj.attr("type") === "text") {
            obj.attr("type", "password");
            replaceClass("icoShowHide", "fa-eye-slash", "fa-eye");
        } else {
            obj.attr("type", "text");
            replaceClass("icoShowHide", "fa-eye", "fa-eye-slash");
        }
    },
    updatePasswordFieldTimeout: null,
    updatePasswordField: function () {
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
        } else {
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
        let body = $("<div>");

        const close = $("<a>");
        close.addClass("close");
        close.html("&times;");
        $(document).on("click",
            close,
            function () {
                removePopover(pwRow);
            });
        body.append(close);

        if (pwCheckResult.feedback.warning !== "") {
            // build warning
            let warningDiv = $("<div>");
            warningDiv.addClass("alert alert-warning");
            body.append(warningDiv);

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
        suggestionDiv.addClass("alert alert-info no-margin");
        body.append(suggestionDiv);

        let stitle = $("<b>");
        stitle.text("Suggestions");
        suggestionDiv.append(stitle);

        suggestionDiv.append($("<br>"));

        pwCheckResult.feedback.suggestions.forEach(function (i) {
            const li = $("<span>");
            li.text(`• ${i}`);
            suggestionDiv.append(li);
        });

        removePopover(pwRow);
        pwRow.popover({
            animation: true,
            html: true,
            content: body.html(),
            placement: function () { return $(window).width() < 975 ? "bottom" : "right"; }
        });
        clearTimeout(UserInterface.updatePasswordFieldTimeout);
        pwRow.popover("show");
        UserInterface.updatePasswordFieldTimeout = setTimeout(function () {
            removePopover(pwRow);
        },
            3000);
    },
    onTxtRoomKeyUp: function (event) {
        UserInterface.updateInputField("Room");

        if (null != event && 13 === event.keyCode) {
            // enter
            $("#txtPassword").focus();
        }
    },
    onTxtUsernameKeyUp: function (event) {
        UserInterface.updateInputField("Username");
        if (null != event && 13 === event.keyCode) {
            // enter
            $("#txtRoom").focus();
        }
    },
    updateInputField: function (identifier) {
        showTooltipIf(`txt${identifier}`, `row${identifier}`, isValueEmpty);
        inputfieldToFailedStateIf(`txt${identifier}`, `row${identifier}`, isValueEmpty);
        UserInterface.updateJoinButtonState();
    },
    updateJoinButtonState: function () {
        const obj = $("#btnApplySettings");
        if ($("#txtPassword").val() === "" || $("#txtRoom").val() === "" || $("#txtUsername").val() === "") {
            obj.addClass("disabled");
            return false;
        } else {
            obj.removeClass("disabled");
            return true;
        }
    },
    onBtnSendMessageClick: function () {
        const e = encrypt($("#txtMessage").val().trim());
        if (!e) {
            // empty message
            return;
        }
        const msg = e.ciphertext.toString(CryptoJS.enc.Base64);
        Caller.sendMessage(msg, e.iv);
        $("#txtMessage").val("").focus();
    },
    onBtnJoinClick: function () {
        if (!UserInterface.updateJoinButtonState()) {
            return;
        }
        removePopover($("#divPwStrengthWrapper"));
        show("divKeyGeneration");

        $("#txtKeyGenerationAction").text("Generating Key...");

        let p = $("#txtPassword").val();
        let r = $("#txtRoom").val().trim();
        let u = $("#txtUsername").val().trim();

        const worker = new Worker("js/worker/keyworker.js");
        worker.onmessage = function (d) {
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
    updateProgressbar: function (percent) {
        const $ppc = $(".progress-pie-chart");
        const deg = 360 * percent / 100;
        if (percent > 50) {
            $ppc.addClass("gt-50");
        }
        $(".ppc-progress-fill").css("transform", `rotate(${deg}deg)`);
        $(".ppc-percents span").html(percent + "%");
    },
    onBtnShowHideUserListClick: function () {
        if ($("#divUserList").is(":visible")) {
            hide("divUserList");
            setTimeout(function () {
                replaceClass("divConversation", "col-xl-9", "col-xl-12");
                replaceClass("divConversation", "col-lg-9", "col-lg-12");
                replaceClass("divConversation", "col-md-9", "col-md-12");
            },
                200);
        } else {
            show("divUserList");
            replaceClass("divConversation", "col-xl-12", "col-xl-9");
            replaceClass("divConversation", "col-lg-12", "col-lg-9");
            replaceClass("divConversation", "col-md-12", "col-md-9");
        }
    }
}