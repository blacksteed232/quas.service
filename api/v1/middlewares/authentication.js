'usestrict';

let config = require('../../../setup/config');
let logger = require('../../../setup/logger')('MIDDLEWARE');
let error = require('../constants/error');
let jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
let response = require('../helpers/response');

module.exports = (req, res, next) => {
  let token = req.body.token || req.query.token || req.headers['authorization'];
  if (token) {
    jwt.verify(token, config.get('NODE_JWT_SECRET'), (err, decoded) => {
      if (err) {
        // Token is invalid or validation failed.
        return response.error(res, {
          status: "400",
          error: error.TOKEN_INVALID,
        });
      } else {
        // Token is valid, authentication succeeded.
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // Token is missing.
    return response.error(res, {
      status: "400",
      error: error.TOKEN_MISSING,
    });
  }
};
