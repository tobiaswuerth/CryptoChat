/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(undefined) {
    // Shortcuts
    const C = CryptoJS;
    const C_lib = C.lib;
    var CipherParams = C_lib.CipherParams;
    const C_enc = C.enc;
    var Hex = C_enc.Hex;
    const C_format = C.format;
    const HexFormatter = C_format.Hex = {
        /**
         * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
         *
         * @param {CipherParams} cipherParams The cipher params object.
         *
         * @return {string} The hexadecimally encoded string.
         *
         * @static
         *
         * @example
         *
         *     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
         */
        stringify: function(cipherParams) {
            return cipherParams.ciphertext.toString(Hex);
        },
        /**
         * Converts a hexadecimally encoded ciphertext string to a cipher params object.
         *
         * @param {string} input The hexadecimally encoded string.
         *
         * @return {CipherParams} The cipher params object.
         *
         * @static
         *
         * @example
         *
         *     var cipherParams = CryptoJS.format.Hex.parse(hexString);
         */
        parse: function(input) {
            const ciphertext = Hex.parse(input);
            return CipherParams.create({ ciphertext: ciphertext });
        }
    };
}());