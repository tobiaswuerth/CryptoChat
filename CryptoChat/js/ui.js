const UserInterface = {
    initialize: function () {
        $("#btnSendMessage").click(UserInterface.onBtnSendMessageClick);
        $("#btnJoin").click(UserInterface.onBtnJoinClick);
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
        $("#modal").modal("show");
        $("#modalText").text("Generating Key...");
        
        let p = $("#txtPassword").val();
        let r = $("#txtRoom").val().trim();
        let u = $("#txtUsername").val().trim();

        const worker = new Worker("js/worker/keyworker.js");
        worker.onmessage = function (d) {
           const data = d.data ||{};
            switch(data.type) {
                case "status":
                    $("#modalText").text(`Generating Key ${data.value}%/100%`);
                    break;
                case "done":
                    key = JSON.parse(data.value);

                    $("#modalText").text("Encrypting inputs...");

                    // hash inputs
                    p = CryptoJS.SHA3(p, { outputLength: 512 }).toString(CryptoJS.enc.Hex);
                    r = CryptoJS.SHA3(r, { outputLength: 512 }).toString(CryptoJS.enc.Hex);

                    u = encrypt(u, DEFAULT_IV);
                    r = encrypt(p + r, DEFAULT_IV); // room identification is based on password and room

                    user = u.ciphertext.toString(CryptoJS.enc.Base64);
                    room = r.ciphertext.toString(CryptoJS.enc.Base64);

                    $("#modalText").text("Initializing...");
                    Caller.init(user, room);
                    break;
            }
        }
        worker.postMessage({ cmd: "startKeyGeneration", param : { pass: p, room: r } });
    }
}