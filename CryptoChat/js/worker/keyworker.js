importScripts(
    "../vendor/security/core-min.js",
    "../vendor/security/x64-core-min.js",
    "../vendor/security/enc-base64-min.js",
    "../vendor/security/cipher-core-min.js",
    "../vendor/security/format-hex-min.js",
    "../vendor/security/hmac-min.js",
    "../vendor/security/sha3-min.js",
    "../vendor/security/pbkdf2.js",
    "../vendor/security/mode-ctr-min.js"
);

const stringToInt = function(input) {
    let hash = 0;
    if (input.length === 0) {
        return hash;
    }
    for (let i = 0; i < input.length; i++) {
        const character = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};
self.addEventListener("message",
    function(d) {
        const data = d.data || {};
        data.cmd = data.cmd || {};
        switch (data.cmd) {
        case "startKeyGeneration":
            data.param = data.param || {};
            data.param.pass = data.param.pass || "";
            data.param.room = data.param.room || "";
            onStartKeyGeneration(data.param.pass, data.param.room);
            break;
        }
    },
    false);
const onStartKeyGeneration = function(pass, room) {
    // hash inputes -> guarantees a certain length
    const hashPass = CryptoJS.SHA3(pass, { outputLength: 512 }).toString(CryptoJS.enc.Hex);
    const hashRoom = CryptoJS.SHA3(room, { outputLength: 512 }).toString(CryptoJS.enc.Hex);
    // calculate iterations for PBKDF2 based on password
    let iterations = stringToInt(hashPass);
    iterations = Math.abs(iterations);
    iterations = iterations % 1000 + 4000; // between 4k and 5k iterations, based on password
    // start key generation with keyBase and use hashRoom as salt
    const key = CryptoJS.PBKDF2(hashPass,
        hashRoom,
        { keySize: 256 / 32, iterations: iterations, hasher: CryptoJS.algo.SHA3 },
        (percentageDone) => self.postMessage({ type: "status", value: percentageDone })
    );
    self.postMessage({ type: "done", value: JSON.stringify(key) });
};