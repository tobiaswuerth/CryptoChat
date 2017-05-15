
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
const keyGenerationStatusCallback = function(percentDone) {
    console.log(`Computed ${percentDone}%/100%`);
};
const startKeyGeneration = function(pass, room) {
    // hash inputes -> guarantees a certain length
    const hashPass = CryptoJS.SHA3(pass, { outputLength: 512 }).toString(CryptoJS.enc.Hex);
    const hashRoom = CryptoJS.SHA3(room, { outputLength: 512 }).toString(CryptoJS.enc.Hex);
    // calculate iterations for PBKDF2 based on password
    let iterations = stringToInt(hashPass);
    iterations = Math.abs(iterations);
    iterations = iterations % 1000 + 3000; // between 3k and 4k iterations, based on password
    // concat password and room hash to get an unknown combination for input
    const keyBase = CryptoJS.SHA3(hashPass + hashRoom, { outputLength: 512 }).toString(CryptoJS.enc.Hex);
    // start key generation with keyBase and use hashRoom as salt
    key = CryptoJS.PBKDF2(keyBase,
        hashRoom,
        { keySize: 256 / 32, iterations: iterations, hasher: CryptoJS.algo.SHA3 },
        keyGenerationStatusCallback);
};