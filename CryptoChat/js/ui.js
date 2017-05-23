const UserInterface = {
    initialize: function() {
        $("#btnSendMessage").click(UserInterface.onBtnSendMessageClick);
        $("#btnJoin").click(UserInterface.onBtnJoinClick);
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
        hide("divJoin");
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
    }
}