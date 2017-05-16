
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
    //iterations = iterations % 1000 + 4000; // between 4k and 5k iterations, based on password
    iterations = iterations % 5 + 1; // ONLY DEBUG!! TODO
    // start key generation with keyBase and use hashRoom as salt
    key = CryptoJS.PBKDF2(hashPass,
        hashRoom,
        { keySize: 256 / 32, iterations: iterations, hasher: CryptoJS.algo.SHA3 },
        keyGenerationStatusCallback);
};