/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS = CryptoJS ||
    function(h, r) {
        const k = {};
        const l = k.lib = {};
        var n = function() {},
            f = l.Base = {
                extend: function(a) {
                    n.prototype = this;
                    var b = new n;
                    a && b.mixIn(a);
                    b.hasOwnProperty("init") ||
                    (b.init = function() {
                        b.$super.init.apply(this, arguments)
                    });
                    b.init.prototype = b;
                    b.$super = this;
                    return b
                },
                create: function() {
                    const a = this.extend();
                    a.init.apply(a, arguments);
                    return a
                },
                init: function() {},
                mixIn: function(a) {
                    for (let b in a) {
                        a.hasOwnProperty(b) && (this[b] = a[b]);
                    }
                    a.hasOwnProperty("toString") && (this.toString = a.toString)
                },
                clone: function() {
                    return this.init.prototype.extend(this)
                }
            },
            j = l.WordArray = f.extend({
                init: function(a, b) {
                    a = this.words = a || [];
                    this.sigBytes = b != r ? b : 4 * a.length
                },
                toString: function(a) {
                    return(a || s).stringify(this)
                },
                concat: function(a) {
                    const b = this.words;
                    const d = a.words;
                    const c = this.sigBytes;
                    a = a.sigBytes;
                    this.clamp();
                    if (c % 4) {
                        for (var e = 0; e < a; e++) {
                            b[c + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((c + e) % 4);
                        }
                    } else if (65535 < d.length) {
                        for (e = 0; e < a; e += 4) {
                            b[c + e >>> 2] = d[e >>> 2];
                        }
                    } else {
                        b.push.apply(b, d);
                    }
                    this.sigBytes += a;
                    return this
                },
                clamp: function() {
                    const a = this.words;
                    const b = this.sigBytes;
                    a[b >>> 2] &= 4294967295 <<
                        32 - 8 * (b % 4);
                    a.length = h.ceil(b / 4)
                },
                clone: function() {
                    const a = f.clone.call(this);
                    a.words = this.words.slice(0);
                    return a
                },
                random: function(a) {
                    for (var b = [], d = 0; d < a; d += 4) {
                        b.push(4294967296 * h.random() | 0);
                    }
                    return new j.init(b, a)
                }
            });
        const m = k.enc = {};
        var s = m.Hex = {
                stringify: function(a) {
                    const b = a.words;
                    a = a.sigBytes;
                    for (var d = [], c = 0; c < a; c++) {
                        const e = b[c >>> 2] >>> 24 - 8 * (c % 4) & 255;
                        d.push((e >>> 4).toString(16));
                        d.push((e & 15).toString(16))
                    }
                    return d.join("")
                },
                parse: function(a) {
                    for (var b = a.length, d = [], c = 0; c < b; c += 2) {
                        d[c >>> 3] |= parseInt(a.substr(c,
                                    2),
                                16) <<
                            24 - 4 * (c % 8);
                    }
                    return new j.init(d, b / 2)
                }
            },
            p = m.Latin1 = {
                stringify: function(a) {
                    const b = a.words;
                    a = a.sigBytes;
                    for (var d = [], c = 0; c < a; c++) {
                        d.push(String.fromCharCode(b[c >>> 2] >>> 24 - 8 * (c % 4) & 255));
                    }
                    return d.join("")
                },
                parse: function(a) {
                    for (var b = a.length, d = [], c = 0; c < b; c++) {
                        d[c >>> 2] |= (a.charCodeAt(c) & 255) << 24 - 8 * (c % 4);
                    }
                    return new j.init(d, b)
                }
            },
            t = m.Utf8 = {
                stringify: function(a) {
                    try {
                        return decodeURIComponent(escape(p.stringify(a)))
                    } catch (b) {
                        throw Error("Malformed UTF-8 data");
                    }
                },
                parse: function(a) {
                    return p.parse(unescape(encodeURIComponent(a)))
                }
            },
            q = l.BufferedBlockAlgorithm = f.extend({
                reset: function() {
                    this._data = new j.init;
                    this._nDataBytes = 0
                },
                _append: function(a) {
                    "string" == typeof a && (a = t.parse(a));
                    this._data.concat(a);
                    this._nDataBytes += a.sigBytes
                },
                _process: function(a) {
                    const b = this._data;
                    const d = b.words;
                    var c = b.sigBytes;
                    const e = this.blockSize;
                    var f = c / (4 * e),
                        f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);
                    a = f * e;
                    c = h.min(4 * a, c);
                    if (a) {
                        for (var g = 0; g < a; g += e) {
                            this._doProcessBlock(d, g);
                        }
                        g = d.splice(0, a);
                        b.sigBytes -= c
                    }
                    return new j.init(g, c)
                },
                clone: function() {
                    const a = f.clone.call(this);
                    a._data = this._data.clone();
                    return a
                },
                _minBufferSize: 0
            });
        l.Hasher = q.extend({
            cfg: f.extend(),
            init: function(a) {
                this.cfg = this.cfg.extend(a);
                this.reset()
            },
            reset: function() {
                q.reset.call(this);
                this._doReset()
            },
            update: function(a) {
                this._append(a);
                this._process();
                return this
            },
            finalize: function(a) {
                a && this._append(a);
                return this._doFinalize()
            },
            blockSize: 16,
            _createHelper: function(a) {
                return function(b, d) {
                    return(new a.init(d)).finalize(b)
                }
            },
            _createHmacHelper: function(a) {
                return function(b, d) {
                    return(new u.HMAC.init(a,
                        d)).finalize(b)
                }
            }
        });
        var u = k.algo = {};
        return k
    }(Math);
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(g) {
    var a = CryptoJS;
    const f = a.lib;
    var e = f.Base,
        h = f.WordArray,
        a = a.x64 = {};
    a.Word = e.extend({
        init: function(b, c) {
            this.high = b;
            this.low = c;
        }
    });
    a.WordArray = e.extend({
        init: function(b, c) {
            b = this.words = b || [];
            this.sigBytes = c != g ? c : 8 * b.length;
        },
        toX32: function() {
            for (var b = this.words, c = b.length, a = [], d = 0; d < c; d++) {
                const e = b[d];
                a.push(e.high);
                a.push(e.low);
            }
            return h.create(a, this.sigBytes);
        },
        clone: function() {
            for (var b = e.clone.call(this), c = b.words = this.words.slice(0), a = c.length, d = 0; d < a; d++) {
                c[d] = c[d].clone();
            }
            return b;
        }
    });
})();
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function() {
    const h = CryptoJS;
    var j = h.lib.WordArray;
    h.enc.Base64 = {
        stringify: function(b) {
            var e = b.words;
            const f = b.sigBytes;
            const c = this._map;
            b.clamp();
            b = [];
            for (let a = 0; a < f; a += 3) {
                for (var d = (e[a >>> 2] >>> 24 - 8 * (a % 4) & 255) << 16 |
                             (e[a + 1 >>> 2] >>> 24 - 8 * ((a + 1) % 4) & 255) << 8 |
                             e[a + 2 >>> 2] >>> 24 - 8 * ((a + 2) % 4) & 255,
                    g = 0;
                    4 > g && a + 0.75 * g < f;
                    g++) {
                    b.push(c.charAt(d >>> 6 * (3 - g) & 63));
                }
            }
            if (e = c.charAt(64)) {
                for (; b.length % 4;) {
                    b.push(e);
                }
            }
            return b.join("");
        },
        parse: function(b) {
            var e = b.length;
            const f = this._map;
            var c = f.charAt(64);
            c && (c = b.indexOf(c), -1 != c && (e = c));
            for (var c = [], a = 0, d = 0;
                d <
                    e;
                d++) {
                if (d % 4) {
                    const g = f.indexOf(b.charAt(d - 1)) << 2 * (d % 4);
                    const h = f.indexOf(b.charAt(d)) >>> 6 - 2 * (d % 4);
                    c[a >>> 2] |= (g | h) << 24 - 8 * (a % 4);
                    a++;
                }
            }
            return j.create(c, a);
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    };
})();
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
CryptoJS.lib.Cipher ||
    function(u) {
        var g = CryptoJS;
        const f = g.lib;
        const k = f.Base;
        var l = f.WordArray,
            q = f.BufferedBlockAlgorithm,
            r = g.enc.Base64,
            v = g.algo.EvpKDF,
            n = f.Cipher = q.extend({
                cfg: k.extend(),
                createEncryptor: function(a, b) {
                    return this.create(this._ENC_XFORM_MODE, a, b);
                },
                createDecryptor: function(a, b) {
                    return this.create(this._DEC_XFORM_MODE, a, b);
                },
                init: function(a, b, c) {
                    this.cfg = this.cfg.extend(c);
                    this._xformMode = a;
                    this._key = b;
                    this.reset();
                },
                reset: function() {
                    q.reset.call(this);
                    this._doReset();
                },
                process: function(a) {
                    this._append(a);
                    return this._process();
                },
                finalize: function(a) {
                    a && this._append(a);
                    return this._doFinalize();
                },
                keySize: 4,
                ivSize: 4,
                _ENC_XFORM_MODE: 1,
                _DEC_XFORM_MODE: 2,
                _createHelper: function(a) {
                    return{
                        encrypt: function(b, c, d) {
                            return("string" == typeof c ? s : j).encrypt(a, b, c, d);
                        },
                        decrypt: function(b, c, d) {
                            return("string" == typeof c ? s : j).decrypt(a, b, c, d);
                        }
                    };
                }
            });
        f.StreamCipher = n.extend({
            _doFinalize: function() {
                return this._process(!0);
            },
            blockSize: 1
        });
        var m = g.mode = {},
            t = function(a, b, c) {
                var d = this._iv;
                d ? this._iv = u : d = this._prevBlock;
                for (let e =
                        0;
                    e < c;
                    e++) {
                    a[b + e] ^= d[e];
                }
            },
            h = (f.BlockCipherMode = k.extend({
                createEncryptor: function(a, b) {
                    return this.Encryptor.create(a, b);
                },
                createDecryptor: function(a, b) {
                    return this.Decryptor.create(a, b);
                },
                init: function(a, b) {
                    this._cipher = a;
                    this._iv = b;
                }
            })).extend();
        h.Encryptor = h.extend({
            processBlock: function(a, b) {
                const c = this._cipher;
                const d = c.blockSize;
                t.call(this, a, b, d);
                c.encryptBlock(a, b);
                this._prevBlock = a.slice(b, b + d);
            }
        });
        h.Decryptor = h.extend({
            processBlock: function(a, b) {
                const c = this._cipher;
                const d = c.blockSize;
                const e = a.slice(b, b + d);
                c.decryptBlock(a,
                    b);
                t.call(this, a, b, d);
                this._prevBlock = e;
            }
        });
        m = m.CBC = h;
        h = (g.pad = {}).Pkcs7 = {
            pad: function(a, b) {
                for (var c = 4 * b, c = c - a.sigBytes % c, d = c << 24 | c << 16 | c << 8 | c, e = [], f = 0;
                    f < c;
                    f += 4) {
                    e.push(d);
                }
                c = l.create(e, c);
                a.concat(c);
            },
            unpad: function(a) {
                a.sigBytes -= a.words[a.sigBytes - 1 >>> 2] & 255;
            }
        };
        f.BlockCipher = n.extend({
            cfg: n.cfg.extend({ mode: m, padding: h }),
            reset: function() {
                n.reset.call(this);
                var a = this.cfg;
                const b = a.iv;
                var a = a.mode;
                if (this._xformMode == this._ENC_XFORM_MODE) {
                    var c = a.createEncryptor;
                } else {
                    c = a.createDecryptor, this._minBufferSize = 1;
                }
                this._mode = c.call(a, this, b && b.words);
            },
            _doProcessBlock: function(a, b) {
                this._mode.processBlock(a, b);
            },
            _doFinalize: function() {
                const a = this.cfg.padding;
                if (this._xformMode == this._ENC_XFORM_MODE) {
                    a.pad(this._data, this.blockSize);
                    var b = this._process(!0);
                } else {
                    b = this._process(!0), a.unpad(b);
                }
                return b;
            },
            blockSize: 4
        });
        var p = f.CipherParams = k.extend({
                init: function(a) {
                    this.mixIn(a);
                },
                toString: function(a) {
                    return(a || this.formatter).stringify(this);
                }
            }),
            m = (g.format = {}).OpenSSL = {
                stringify: function(a) {
                    const b = a.ciphertext;
                    a = a.salt;
                    return(a ? l.create([1398893684, 1701076831]).concat(a).concat(b) : b).toString(r);
                },
                parse: function(a) {
                    a = r.parse(a);
                    const b = a.words;
                    if (1398893684 == b[0] && 1701076831 == b[1]) {
                        var c = l.create(b.slice(2, 4));
                        b.splice(0, 4);
                        a.sigBytes -= 16;
                    }
                    return p.create({ ciphertext: a, salt: c });
                }
            },
            j = f.SerializableCipher = k.extend({
                cfg: k.extend({ format: m }),
                encrypt: function(a, b, c, d) {
                    d = this.cfg.extend(d);
                    var e = a.createEncryptor(c, d);
                    b = e.finalize(b);
                    e = e.cfg;
                    return p.create({
                        ciphertext: b,
                        key: c,
                        iv: e.iv,
                        algorithm: a,
                        mode: e.mode,
                        padding: e.padding,
                        blockSize: a.blockSize,
                        formatter: d.format
                    });
                },
                decrypt: function(a, b, c, d) {
                    d = this.cfg.extend(d);
                    b = this._parse(b, d.format);
                    return a.createDecryptor(c, d).finalize(b.ciphertext);
                },
                _parse: function(a, b) {
                    return"string" == typeof a ? b.parse(a, this) : a;
                }
            }),
            g = (g.kdf = {}).OpenSSL = {
                execute: function(a, b, c, d) {
                    d || (d = l.random(8));
                    a = v.create({ keySize: b + c }).compute(a, d);
                    c = l.create(a.words.slice(b), 4 * c);
                    a.sigBytes = 4 * b;
                    return p.create({ key: a, iv: c, salt: d });
                }
            },
            s = f.PasswordBasedCipher = j.extend({
                cfg: j.cfg.extend({ kdf: g }),
                encrypt: function(a,
                                  b,
                                  c,
                                  d) {
                    d = this.cfg.extend(d);
                    c = d.kdf.execute(c, a.keySize, a.ivSize);
                    d.iv = c.iv;
                    a = j.encrypt.call(this, a, b, c.key, d);
                    a.mixIn(c);
                    return a;
                },
                decrypt: function(a, b, c, d) {
                    d = this.cfg.extend(d);
                    b = this._parse(b, d.format);
                    c = d.kdf.execute(c, a.keySize, a.ivSize, b.salt);
                    d.iv = c.iv;
                    return j.decrypt.call(this, a, b, c.key, d);
                }
            });
    }();
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
            return a.ciphertext.toString(c);
        },
        parse: function(a) {
            a = c.parse(a);
            return d.create({ ciphertext: a });
        }
    };
})();
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function() {
    const c = CryptoJS;
    var k = c.enc.Utf8;
    c.algo.HMAC = c.lib.Base.extend({
        init: function(a, b) {
            a = this._hasher = new a.init;
            "string" == typeof b && (b = k.parse(b));
            const c = a.blockSize;
            const e = 4 * c;
            b.sigBytes > e && (b = a.finalize(b));
            b.clamp();
            for (var f = this._oKey = b.clone(), g = this._iKey = b.clone(), h = f.words, j = g.words, d = 0;
                d < c;
                d++) {
                h[d] ^= 1549556828, j[d] ^= 909522486;
            }
            f.sigBytes = g.sigBytes = e;
            this.reset();
        },
        reset: function() {
            const a = this._hasher;
            a.reset();
            a.update(this._iKey);
        },
        update: function(a) {
            this._hasher.update(a);
            return this;
        },
        finalize: function(a) {
            const b = this._hasher;
            a = b.finalize(a);
            b.reset();
            return b.finalize(this._oKey.clone().concat(a));
        }
    });
})();
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(y) {
    for (var p = CryptoJS,
        m = p.lib,
        z = m.WordArray,
        q = m.Hasher,
        s = p.x64.Word,
        m = p.algo,
        v = [],
        w = [],
        x = [],
        c = 1,
        d = 0,
        l = 0;
        24 > l;
        l++) {
        v[c + 5 * d] = (l + 1) * (l + 2) / 2 % 64;
        var r = (2 * c + 3 * d) % 5, c = d % 5, d = r;
    }
    for (c = 0; 5 > c; c++) {
        for (d = 0; 5 > d; d++) {
            w[c + 5 * d] = d + 5 * ((2 * c + 3 * d) % 5);
        }
    }
    c = 1;
    for (d = 0; 24 > d; d++) {
        for (var t = r = l = 0; 7 > t; t++) {
            if (c & 1) {
                var u = (1 << t) - 1;
                32 > u ? r ^= 1 << u : l ^= 1 << u - 32;
            }
            c = c & 128 ? c << 1 ^ 113 : c << 1;
        }
        x[d] = s.create(l, r);
    }
    for (var j = [], c = 0; 25 > c; c++) {
        j[c] = s.create();
    }
    m = m.SHA3 = q.extend({
        cfg: q.cfg.extend({ outputLength: 512 }),
        _doReset: function() {
            for (var c = this._state =
                         [],
                n = 0;
                25 > n;
                n++) {
                c[n] = new s.init;
            }
            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
        },
        _doProcessBlock: function(c, n) {
            for (var h = this._state, d = this.blockSize / 2, b = 0; b < d; b++) {
                var e = c[n + 2 * b],
                    f = c[n + 2 * b + 1],
                    e = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360,
                    f = (f << 8 | f >>> 24) & 16711935 | (f << 24 | f >>> 8) & 4278255360,
                    a = h[b];
                a.high ^= f;
                a.low ^= e;
            }
            for (d = 0; 24 > d; d++) {
                for (b = 0; 5 > b; b++) {
                    for (var k = e = 0, g = 0; 5 > g; g++) {
                        a = h[b + 5 * g], e ^= a.high, k ^= a.low;
                    }
                    a = j[b];
                    a.high = e;
                    a.low = k;
                }
                for (b = 0; 5 > b; b++) {
                    a = j[(b + 4) % 5];
                    e = j[(b + 1) % 5];
                    f = e.high;
                    g = e.low;
                    e = a.high ^
                        (f << 1 | g >>> 31);
                    k = a.low ^ (g << 1 | f >>> 31);
                    for (g = 0; 5 > g; g++) {
                        a = h[b + 5 * g], a.high ^= e, a.low ^= k;
                    }
                }
                for (f = 1; 25 > f; f++) {
                    a = h[f], b = a.high, a = a.low, g =
                        v[f], 32 > g
                                  ? (e = b << g | a >>> 32 - g, k = a << g | b >>> 32 - g)
                                  : (e = a << g - 32 | b >>> 64 - g, k = b << g - 32 | a >>> 64 - g), a = j[w[f]], a.high =
                        e, a.low = k;
                }
                a = j[0];
                b = h[0];
                a.high = b.high;
                a.low = b.low;
                for (b = 0; 5 > b; b++) {
                    for (g = 0; 5 > g; g++) {
                        f = b + 5 * g, a = h[f], e = j[f], f = j[(b + 1) % 5 + 5 * g], k =
                            j[(b + 2) % 5 + 5 * g], a.high = e.high ^ ~f.high & k.high, a.low = e.low ^ ~f.low & k.low;
                    }
                }
                a = h[0];
                b = x[d];
                a.high ^= b.high;
                a.low ^= b.low;
            }
        },
        _doFinalize: function() {
            var c = this._data,
                d = c.words,
                h = 8 * c.sigBytes,
                j = 32 * this.blockSize;
            d[h >>> 5] |= 1 << 24 - h % 32;
            d[(y.ceil((h + 1) / j) * j >>> 5) - 1] |= 128;
            c.sigBytes = 4 * d.length;
            this._process();
            for (var c = this._state, d = this.cfg.outputLength / 8, h = d / 8, j = [], b = 0; b < h; b++) {
                var e = c[b],
                    f = e.high,
                    e = e.low,
                    f = (f << 8 | f >>> 24) & 16711935 | (f << 24 | f >>> 8) & 4278255360,
                    e = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360;
                j.push(e);
                j.push(f);
            }
            return new z.init(j, d);
        },
        clone: function() {
            for (var c = q.clone.call(this), d = c._state = this._state.slice(0), h = 0; 25 > h; h++) {
                d[h] = d[h].clone();
            }
            return c;
        }
    });
    p.SHA3 = q._createHelper(m);
    p.HmacSHA3 = q._createHmacHelper(m);
})(Math);
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
modified by upzone May 2017
*/
(function() {
    // Shortcuts
    const C = CryptoJS;
    const C_lib = C.lib;
    const Base = C_lib.Base;
    var WordArray = C_lib.WordArray;
    const C_algo = C.algo;
    const SHA1 = C_algo.SHA1;
    var HMAC = C_algo.HMAC;
    /**
     * Password-Based Key Derivation Function 2 algorithm.
     */
    var PBKDF2 = C_algo.PBKDF2 = Base.extend({
        /**
         * Configuration options.
         *
         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
         * @property {Hasher} hasher The hasher to use. Default: SHA1
         * @property {number} iterations The number of iterations to perform. Default: 1
         */
        cfg: Base.extend({
            keySize: 128 / 32,
            hasher: SHA1,
            iterations: 1
        }),
        /**
         * Initializes a newly created key derivation function.
         *
         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
         *
         * @example
         *
         *     var kdf = CryptoJS.algo.PBKDF2.create();
         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
         */
        init: function(cfg, statusCallback) {
            this.cfg = this.cfg.extend(cfg);
            this.statusCallback = statusCallback;
        },
        /**
         * Computes the Password-Based Key Derivation Function 2.
         *
         * @param {WordArray|string} password The password.
         * @param {WordArray|string} salt A salt.
         *
         * @return {WordArray} The derived key.
         *
         * @example
         *
         *     var key = kdf.compute(password, salt);
         */
        compute: function(password, salt) {
            // Shortcut
            const cfg = this.cfg;
            const statusCallback = this.statusCallback;
            // Init HMAC
            const hmac = HMAC.create(cfg.hasher, password);
            // Initial values
            const derivedKey = WordArray.create();
            const blockIndex = WordArray.create([0x00000001]);
            // Shortcuts
            const derivedKeyWords = derivedKey.words;
            const blockIndexWords = blockIndex.words;
            const keySize = cfg.keySize;
            const iterations = cfg.iterations;
            // Generate key
            var keySizeCeiled = null;
            var percentageSteps = null;
            var percentageDone = null;
            while (derivedKeyWords.length < keySize) {
                const block = hmac.update(salt).finalize(blockIndex);
                hmac.reset();
                // Shortcuts
                const blockWords = block.words;
                const blockWordsLength = blockWords.length;
                // percentage calculation for status callback
                if (null == keySizeCeiled) {
                    keySizeCeiled = keySize + (blockWordsLength - (keySize % blockWordsLength));
                    percentageSteps = 100 / (keySizeCeiled / blockWordsLength);
                }
                percentageDone = derivedKeyWords.length * 100 / keySizeCeiled;
                statusCallback(percentageDone);
                // Iterations
                let intermediate = block;
                for (let i = 1; i < iterations; i++) {
                    intermediate = hmac.finalize(intermediate);
                    hmac.reset();
                    // Shortcut
                    const intermediateWords = intermediate.words;
                    // XOR intermediate with block
                    for (let j = 0; j < blockWordsLength; j++) {
                        blockWords[j] ^= intermediateWords[j];
                    }
                    if (i % 64 === 0) {
                        statusCallback(percentageDone + (percentageSteps * (i / iterations)));
                    }
                }
                derivedKey.concat(block);
                blockIndexWords[0]++;
            }
            derivedKey.sigBytes = keySize * 4;
            statusCallback(100.0); // done
            return derivedKey;
        }
    });
    /**
     * Computes the Password-Based Key Derivation Function 2.
     *
     * @param {WordArray|string} password The password.
     * @param {WordArray|string} salt A salt.
     * @param {Object} cfg (Optional) The configuration options to use for this computation.
     *
     * @return {WordArray} The derived key.
     *
     * @static
     *
     * @example
     *
     *     var key = CryptoJS.PBKDF2(password, salt);
     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
     */
    C.PBKDF2 = function(password, salt, cfg, statusCallback) {
        return PBKDF2.create(cfg, statusCallback).compute(password, salt);
    };
}());
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
CryptoJS.mode.CTR = function() {
    const b = CryptoJS.lib.BlockCipherMode.extend();
    const g = b.Encryptor = b.extend({
        processBlock: function(b, f) {
            var a = this._cipher;
            const e = a.blockSize;
            var c = this._iv,
                d = this._counter;
            c && (d = this._counter = c.slice(0), this._iv = void 0);
            c = d.slice(0);
            a.encryptBlock(c, 0);
            d[e - 1] = d[e - 1] + 1 | 0;
            for (a = 0; a < e; a++) {
                b[f + a] ^= c[a];
            }
        }
    });
    b.Decryptor = g;
    return b;
}();
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function() {
    for (var q = CryptoJS,
        x = q.lib.BlockCipher,
        r = q.algo,
        j = [],
        y = [],
        z = [],
        A = [],
        B = [],
        C = [],
        s = [],
        u = [],
        v = [],
        w = [],
        g = [],
        k = 0;
        256 > k;
        k++) {
        g[k] = 128 > k ? k << 1 : k << 1 ^ 283;
    }
    for (var n = 0, l = 0, k = 0; 256 > k; k++) {
        var f = l ^ l << 1 ^ l << 2 ^ l << 3 ^ l << 4, f = f >>> 8 ^ f & 255 ^ 99;
        j[n] = f;
        y[f] = n;
        var t = g[n], D = g[t], E = g[D], b = 257 * g[f] ^ 16843008 * f;
        z[n] = b << 24 | b >>> 8;
        A[n] = b << 16 | b >>> 16;
        B[n] = b << 8 | b >>> 24;
        C[n] = b;
        b = 16843009 * E ^ 65537 * D ^ 257 * t ^ 16843008 * n;
        s[f] = b << 24 | b >>> 8;
        u[f] = b << 16 | b >>> 16;
        v[f] = b << 8 | b >>> 24;
        w[f] = b;
        n ? (n = t ^ g[g[g[E ^ t]]], l ^= g[g[l]]) : n = l = 1;
    }
    var F = [
            0, 1, 2, 4, 8,
            16, 32, 64, 128, 27, 54
        ],
        r = r.AES = x.extend({
            _doReset: function() {
                for (var c = this._key,
                    e = c.words,
                    a = c.sigBytes / 4,
                    c = 4 * ((this._nRounds = a + 6) + 1),
                    b = this._keySchedule = [],
                    h = 0;
                    h < c;
                    h++) {
                    if (h < a) {
                        b[h] = e[h];
                    } else {
                        var d = b[h - 1];
                        h % a
                            ? 6 < a &&
                            4 == h % a &&
                            (d = j[d >>> 24] << 24 | j[d >>> 16 & 255] << 16 | j[d >>> 8 & 255] << 8 | j[d & 255])
                            : (d = d << 8 | d >>> 24, d = j[d >>> 24] << 24 |
                                j[d >>> 16 & 255] << 16 |
                                j[d >>> 8 & 255] << 8 |
                                j[d & 255], d ^= F[h / a | 0] << 24);
                        b[h] = b[h - a] ^ d;
                    }
                }
                e = this._invKeySchedule = [];
                for (a = 0; a < c; a++) {
                    h = c - a, d = a % 4 ? b[h] : b[h - 4], e[a] = 4 > a || 4 >= h
                                                                   ? d
                                                                   : s[j[d >>> 24]] ^
                                                                   u[j[d >>> 16 & 255]] ^
                                                                   v[j[d >>>
                                                                       8 &
                                                                       255]] ^
                                                                   w[j[d & 255]];
                }
            },
            encryptBlock: function(c, e) {
                this._doCryptBlock(c, e, this._keySchedule, z, A, B, C, j);
            },
            decryptBlock: function(c, e) {
                var a = c[e + 1];
                c[e + 1] = c[e + 3];
                c[e + 3] = a;
                this._doCryptBlock(c, e, this._invKeySchedule, s, u, v, w, y);
                a = c[e + 1];
                c[e + 1] = c[e + 3];
                c[e + 3] = a;
            },
            _doCryptBlock: function(c, e, a, b, h, d, j, m) {
                for (var n = this._nRounds,
                    f = c[e] ^ a[0],
                    g = c[e + 1] ^ a[1],
                    k = c[e + 2] ^ a[2],
                    p = c[e + 3] ^ a[3],
                    l = 4,
                    t = 1;
                    t < n;
                    t++) {
                    var q = b[f >>> 24] ^ h[g >>> 16 & 255] ^ d[k >>> 8 & 255] ^ j[p & 255] ^ a[l++],
                        r = b[g >>> 24] ^ h[k >>> 16 & 255] ^ d[p >>> 8 & 255] ^ j[f & 255] ^ a[l++],
                        s =
                            b[k >>> 24] ^ h[p >>> 16 & 255] ^ d[f >>> 8 & 255] ^ j[g & 255] ^ a[l++],
                        p = b[p >>> 24] ^ h[f >>> 16 & 255] ^ d[g >>> 8 & 255] ^ j[k & 255] ^ a[l++],
                        f = q,
                        g = r,
                        k = s;
                }
                q = (m[f >>> 24] << 24 | m[g >>> 16 & 255] << 16 | m[k >>> 8 & 255] << 8 | m[p & 255]) ^ a[l++];
                r = (m[g >>> 24] << 24 | m[k >>> 16 & 255] << 16 | m[p >>> 8 & 255] << 8 | m[f & 255]) ^ a[l++];
                s = (m[k >>> 24] << 24 | m[p >>> 16 & 255] << 16 | m[f >>> 8 & 255] << 8 | m[g & 255]) ^ a[l++];
                p = (m[p >>> 24] << 24 | m[f >>> 16 & 255] << 16 | m[g >>> 8 & 255] << 8 | m[k & 255]) ^ a[l++];
                c[e] = q;
                c[e + 1] = r;
                c[e + 2] = s;
                c[e + 3] = p;
            },
            keySize: 8
        });
    q.AES = x._createHelper(r);
})();