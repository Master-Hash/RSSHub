// @ts-check

const crypto = require('node:crypto').webcrypto;

/**
 * 生成加密请求
 * @param {string} data
 * @returns {Promise<{params: string, encSecKey: string}>}
 * @see https://blog.csdn.net/weixin_39643061/article/details/119950551
 * 第二次 AES-CBC 加密的密钥随机，我用了固定值。
 *
 * `encSecKey` 是第二次 AES-CBC 加密密钥的 RSA 加密值，用固定值可以少造轮子。
 */
async function weapiEncrypt(data) {
    const s1 = await encrypt(data, '0CoJUm6Qyw8W8jud', '0102030405060708');
    const s2 = await encrypt(s1, 'FcxSDp2H2mDnPUQo', '0102030405060708');

    return {
        params: s2,
        encSecKey:
            'b1b67eb028aa953f1173bb312ff7131c9ade59458be645ec05c8199e0bb83276ca695d35df7623f6ee7e8eb6a0f3fcbbddb91dff9c56b69e228cad4c7a0036cfefbc5e61f46acae60a4ce7414b4b87640198df72da326751f2d0e78ad9ec40f56e56ba738822e4d87e4c3c8f1006e162ede0ada9d8d53cbd80a4140d1130671d',
    };
}

/**
 * encrypt message with AES-CBC and Web Crypto API
 * @param {string} message
 * @param {string} key
 * @param {string} iv
 * @returns {Promise<string>}
 * @see https://roubin.me/web-crypto-api-introduction/
 * @see https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
 */
async function encrypt(message, key, iv) {
    const buffer = await crypto.subtle.encrypt(
        {
            name: 'AES-CBC',
            iv: stringToArrayBuffer(iv),
        },
        await importSecretKey(key),
        stringToArrayBuffer(message)
    );
    return Buffer.from(buffer).toString('base64');
}

/**
 * import AES-CBC key
 * @param {string} key
 * @returns {Promise<CryptoKey>}
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/importKey
 */
function importSecretKey(key) {
    return crypto.subtle.importKey('raw', stringToArrayBuffer(key), 'AES-CBC', true, ['encrypt', 'decrypt']);
}

/**
 * convert String to ArrayBuffer
 * @param {string} str
 * @returns {ArrayBuffer}
 * @see https://stackoverflow.com/a/11058858/1123955
 */
function stringToArrayBuffer(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

/**
 * convert ArrayBuffer to String
 * @param {ArrayBuffer} buf
 * @returns {string}
 * @see https://stackoverflow.com/a/11058858/1123955
 */
// function arrayBufferToString(buf) {
//     return String.fromCharCode(...new Uint8Array(buf));
// }

module.exports = {
    weapiEncrypt,
};

// test code
// encrypt(
//     '{"id":"0","seriesId":"875050","wordwrap":"7","offset":"0","total":"true","limit":"20","csrf_token":""}', "0CoJUm6Qyw8W8jud", "0102030405060708")
//     .then(e => encrypt(e, "ceejT9n2Dmsz1tkd", "0102030405060708"))
//     .then(console.log);

// weapiEncrypt(JSON.stringify({
//     "seriesId": "875050",
//     // "total": "true"
// }))
//     .then(e => fetch("https://music.163.com/weapi/topic/all", {
//         "headers": {
//             "Content-Type": "application/x-www-form-urlencoded",
//         },
//         "body": (new URLSearchParams(e)).toString(),
//         "method": "POST",
//     }))
//     .then(e => e.json())
//     .then(console.log);
