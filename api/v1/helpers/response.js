'use strict';

let errorCode = require('../constants/error');
let message = require('../language');

let response = (req, res, defaults, options = {}) => {
  let status = options.status ? options.status : defaults.status;
  return res.status(status).json({
    code: (options.error ? options.error : defaults.code),
    message: (options.message ? options.message : defaults.code ? message.error(req, errorCode[defaults.code]) : message.error(req, options.error)),
    field: (options.field ? message.validation(req, options.field) : undefined),
    data: (options.data ? options.data : undefined),
  });
}

let error = (req, res, options = {}) => {
  response(req, res, {
    status: "400",
  }, options)
};

let success = (req, res, options = {}) => {
  response(req, res, {
    status: "200",
    code: errorCode.SUCCESS,
  }, options)
};

let errorServer = (req, res, options = {}) => {
  response(req, res, {
    status: "500",
    code: errorCode.SERVER,
  }, options)
};

let errorDatabase = (req, res, options = {}) => {
  response(req, res, {
    status: "500",
    code: errorCode.DATABASE,
  }, options)
};

let errorValidation = (req, res, options = {}) => {
  response(req, res, {
    status: "400",
    code: errorCode.VALIDATION,
  }, options)
};

module.exports = { error, success, errorDatabase, errorServer, errorValidation };