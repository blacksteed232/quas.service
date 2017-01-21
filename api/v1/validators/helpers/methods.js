'use strict';

let dbSanitizer = require('mongo-sanitize');
let validator = require('validator');

const LENGTH = (error, req, attributeName, result, options, callback) => {
  if (options.values.min && options.values.max) {
    if (req.body[attributeName].length < options.values.min || req.body[attributeName].length > options.values.max) {
      result.push({
        code: (options.message ? options.message : "LENGTH_BOUNDED"),
        params: {
          min: options.values.min,
          max: options.values.max,
        }
      });
    }
  } else if (!options.values.min) {
    if (req.body[attributeName].length > options.values.max) {
      result.push({
        code: (options.message ? options.message : "LENGTH_UPPER"),
        params: {
          max: options.values.max,
        }
      });
    }
  } else if (!options.values.max) {
    if (req.body[attributeName].length < options.values.min) {
      result.push({
        code: (options.message ? options.message : "LENGTH_LOWER"),
        params: {
          min: options.values.min,
        }
      });
    }
  }
  callback();
}

const DUPLICATION = (error, req, attributeName, result, options, callback) => {
  let query = new Object();
  query[attributeName] = dbSanitizer(req.body[attributeName]);
  options.values.schema.findOne(query, (errDB, user) => {
    if (errDB) {
      error.push(new Error(errDB));
    } else {
      if (user) {
        result.push(options.message);
      }
    }
    callback();
  });
}

const REQUIRE = (req, attributeName, result, options = {}) => {
  if (!req.body[attributeName] || validator.isEmpty(req.body[attributeName])) {
    result.push(options.message ? options.message : "REQUIRED");
    return true;
  }
  return false;
}

const MATCH = (error, req, attributeName, result, options, callback) => {
  var matchResult = options.values.patterns.map((pattern) => {
    return validator.matches(req.body[attributeName], pattern);
  }).reduce((a, b) => {
    if (options.values.exclusion) {
      return (a || b);
    }
    return (a && b);
  }, (options.values.exclusion ? false : true));
  if (!(options.values.exclusion ^ matchResult)) {
    if (matchResult) {
      result.push(options.message ? options.message : "MISMATCH");
    }
  }
  callback();
}

const CONTAIN = (error, req, attributeName, result, options, callback) => {
  var matchResult = options.values.patterns.map((pattern) => {
    return validator.contains(req.body[attributeName], pattern);
  }).reduce((a, b) => {
    if (options.values.exclusion) {
      return (a || b);
    }
    return (a && b);
  }, (options.values.exclusion ? false : true));
  if (options.values.exclusion) {
    if (matchResult) {
      result.push(options.message ? options.message : "EXCLUDE");
    }
  } else {
    if (!matchResult) {
      result.push(options.message ? options.message : "INCLUDE");
    }
  }
  callback();
}

module.exports = { LENGTH, DUPLICATION, REQUIRE, MATCH, CONTAIN };