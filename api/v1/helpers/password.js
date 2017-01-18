'use strict';

let crypto = require('crypto');

// larger numbers mean better security, less
let config = {
  // size of the generated hash
  hashBytes: 32,
  // larger salt means hashed passwords are more resistant to rainbow table, but
  // you get diminishing returns pretty fast
  saltBytes: 16,
  // more iterations means an attacker has to take longer to brute force an
  // individual password, so larger is better. however, larger also means longer
  // to hash the password. tune so that hashing the password takes about a
  // second
  iterations: 842464,
  algorithm: 'sha512'
};

/**
 * Hash a password using Node's asynchronous pbkdf2 (key derivation) function.
 *
 * Returns a self-contained buffer which can be arbitrarily encoded for storage
 * that contains all the data needed to verify a password.
 *
 * @param {!String} password
 * @param {!function(?Error, ?Buffer=)} callback
 */
function hashPassword(password, callback) {
  // generate a salt for pbkdf2
  crypto.randomBytes(config.saltBytes, function (err, salt) {
    if (err) {
      return callback(err);
    }

    crypto.pbkdf2(password, salt, config.iterations, config.hashBytes, config.algorithm,
      function (err, hash) {
        if (err) {
          return callback(err);
        }

        let combined = new Buffer(hash.length + salt.length + 8);

        // include the size of the salt so that we can, during verification,
        // figure out how much of the hash is salt
        combined.writeUInt32BE(salt.length, 0, true);
        // similarly, include the iteration count
        combined.writeUInt32BE(config.iterations, 4, true);

        salt.copy(combined, 8);
        hash.copy(combined, salt.length + 8);
        callback(null, combined);
      });
  });
}

/**
 * Verify a password using Node's asynchronous pbkdf2 (key derivation) function.
 *
 * Accepts a hash and salt generated by hashPassword, and returns whether the
 * hash matched the password (as a boolean).
 *
 * @param {!String} password
 * @param {!Buffer} combined Buffer containing hash and salt as generated by
 *   hashPassword.
 * @param {!function(?Error, !boolean)}
 */
function verifyPassword(password, combined, callback) {
  // extract the salt and hash from the combined buffer
  let saltBytes = combined.readUInt32BE(0);
  let hashBytes = combined.length - saltBytes - 8;
  let iterations = combined.readUInt32BE(4);
  let salt = combined.slice(8, saltBytes + 8);
  let hash = combined.toString('binary', saltBytes + 8);

  // verify the salt and hash against the password
  crypto.pbkdf2(password, salt, iterations, hashBytes, config.algorithm, function (err, verify) {
    if (err) {
      return callback(err, false);
    }

    callback(null, verify.toString('binary') === hash);
  });
}

module.exports.hashPassword = hashPassword;
module.exports.verifyPassword = verifyPassword;