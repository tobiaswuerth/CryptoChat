const UserInterface = {
    initialize: function() {
        $("[data-toggle='tooltip']").tooltip();
        $("#btnSendMessage").click(UserInterface.onBtnSendMessageClick);
        $("#btnJoin").click(UserInterface.onBtnJoinClick);
        $("#btnShowHideUserList").click(UserInterface.onBtnShowHideUserListClick);

        const txtPass = $("#txtPassword");
        const txtRoom = $("#txtRoom");
        const txtUsername = $("#txtUsername");

        txtPass.keyup(UserInterface.onTxtPasswordKeyUp);
        txtRoom.keyup(UserInterface.onTxtRoomKeyUp);
        txtUsername.keyup(UserInterface.onTxtUsernameKeyUp);

        removeTooltip(txtPass);
        removeTooltip(txtRoom);
        removeTooltip(txtUsername);

        txtPass.tooltip({ title: "Input cannot be empty", placement: "right", trigger: "manual", html: false, animation: true });
        txtRoom.tooltip({ title: "Input cannot be empty", placement: "right", trigger: "manual", html: false, animation: true });
        txtUsername.tooltip({ title: "Input cannot be empty", placement: "right", trigger: "manual", html: false, animation: true });
    },
    onTxtPasswordKeyUp: function(event) {
        UserInterface.updateInputField(event, "Password");
    },
    onTxtRoomKeyUp: function(event) {
        UserInterface.updateInputField(event, "Room");
    },
    onTxtUsernameKeyUp: function(event) {
        UserInterface.updateInputField(event, "Username");
    },
    updateInputField: function(event, identifier) {
        if (event.keyCode === 9) {
            // ignore tab
            return;
        }
        showTooltipIf(`txt${identifier}`, isValueEmpty);
        inputfieldToFailedStateIf(`txt${identifier}`, `row${identifier}`, isValueEmpty);
        UserInterface.updateJoinButtonState();
    },
    updateJoinButtonState: function() {
        const obj = $("#btnJoin");
        if ($("#txtPassword").val() === "" || $("#txtRoom").val() === "" || $("#txtUsername").val() === "") {
            obj.addClass("disabled");
        } else {
            obj.removeClass("disabled");
        }
    },
    onBtnSendMessageClick: function() {
        const e = encrypt($("#txtMessage").val().trim());
        if (!e) {
            // empty message
            return;
        }
        const msg = e.ciphertext.toString(CryptoJS.enc.Base64);
        Caller.sendMessage(msg, e.iv);
        $("#txtMessage").val("").focus();
    },

    onBtnJoinClick: function() {
        show("divKeyGeneration");

        $("#txtKeyGenerationAction").text("Generating Key...");

        let p = $("#txtPassword").val();
        let r = $("#txtRoom").val().trim();
        let u = $("#txtUsername").val().trim();

        const worker = new Worker("js/worker/keyworker.js");
        worker.onmessage = function(d) {
            const data = d.data || {};
            switch (data.type) {
                case "status":
                    $("#modaltxtKeyGenerationActionText").text(`Generating Key...`);
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
    updateProgressbar: function(percent) {
        const $ppc = $(".progress-pie-chart");
        const deg = 360 * percent / 100;
        if (percent > 50) {
            $ppc.addClass("gt-50");
        }
        $(".ppc-progress-fill").css("transform", `rotate(${deg}deg)`);
        $(".ppc-percents span").html(percent + "%");
    },
    onBtnShowHideUserListClick: function() {
        if ($("#divUserList").is(":visible")) {
            hide("divUserList");
            setTimeout(function() {
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