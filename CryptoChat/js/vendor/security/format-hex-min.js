/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function() {
    const b = CryptoJS;
    var d = b.lib.CipherParams, c = b.enc.Hex;
    b.format.Hex = {
        stringify: function(a) {
            return a.ciphertext.toString(c)
        },
        parse: function(a) {
            a = c.parse(a);
            return d.create({ ciphertext: a })
        }
    }
})();