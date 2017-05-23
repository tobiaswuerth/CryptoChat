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