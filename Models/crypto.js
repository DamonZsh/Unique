/**
 * Created by damon.zhang on 2016/9/11.
 */
/**
 * Created by linli on 2015/8/25.
 */
var crypto = require('crypto');
var secretKey = 'chinese';
// //加密
// exports.cipher = function(algorithm, key, buf) {
//     var encrypted = "";
//     var cip = crypto.createCipher(algorithm, key);
//     encrypted += cip.update(buf, 'binary', 'hex');
//     encrypted += cip.final('hex');
//     return encrypted
// };
//
// //解密
// exports.decipher = function(algorithm, key, encrypted) {
//     var decrypted = "";
//     var decipher = crypto.createDecipher(algorithm, key);
//     decrypted += decipher.update(encrypted, 'hex', 'binary');
//     decrypted += decipher.final('binary');
//     return decrypted
// };

exports.aesEncrypt = function(data) {
    var cipher = crypto.createCipher('aes-128-ecb',secretKey);
    return cipher.update(data,'utf8','hex') + cipher.final('hex');
}

/**
 * aes解密
 * @param data
 * @param secretKey
 * @returns {*}
 */
exports.aesDecrypt = function(data) {
    var cipher = crypto.createDecipher('aes-128-ecb',secretKey);
    return cipher.update(data,'hex','utf8') + cipher.final('utf8');
}