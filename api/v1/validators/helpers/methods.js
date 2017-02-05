'use strict';

let dbSanitizer = require('mongo-sanitize');
let validator = require('validator');
let utils = require('../../helpers/utils');

const LENGTH = (error, req, attributeName, result, options, callback) => {
  if (options.values.min && options.values.max) {
    if (req.body[attributeName].length < options.values.min || req.body[attributeName].length > options.values.max) {
      result.push({
        code: (options.message ? options.message : "LENGTH_BOUNDED"),
        params: {
          min: options.values.min,
          max: options.values.max
        }
      });
    }
  } else if (!options.values.min) {
    if (req.body[attributeName].length > options.values.max) {
      result.push({
        code: (options.message ? options.message : "LENGTH_UPPER"),
        params: {
          max: options.values.max
        }
      });
    }
  } else if (!options.values.max) {
    if (req.body[attributeName].length < options.values.min) {
      result.push({
        code: (options.message ? options.message : "LENGTH_LOWER"),
        params: {
          min: options.values.min
        }
      });
    }
  }
  callback();
}

const DUPLICATION = (error, req, attributeName, result, options, callback) => {
  // let query = new Object();
  // query[attributeName] = dbSanitizer(req.body[attributeName]);
  // options.values.schema.findOne(query, (errDB, user) => {
  //   if (errDB) {
  //     error.push(errDB);
  //   } else {
  //     if (user) {
  //       result.push(options.message);
  //     }
  //   }
  //   callback();
  // });
}

const REQUIRE = (req, attributeName, result, options = {}) => {
  if (!req.body[attributeName]
    || ((req.body[attributeName]).hasOwnProperty('length') && req.body[attributeName].length === 0)
    || utils.isEmptyObject(req.body[attributeName])) {
    result.push(options.message ? options.message : "REQUIRED");
    return true;
  }
  return false;
}

const TYPE = (req, attributeName, result, options = {}) => {
  let type = (options.value ? options.value : options);
  let typeCheckResult = false;
  let generateResult = (hasCorrectType, result, options) => {
    if (!hasCorrectType) {
      result.push({
        code: (options.message ? options.message : "TYPE"),
        params: {
          type: (options.value ? options.value : options)
        }
      });
      return false;
    }
    return true;
  }
  switch ((options.value ? options.value : options)) {
    case 'string':
      typeCheckResult = generateResult((typeof req.body[attributeName] === type), result, options);
      break;
    case 'number':
      if (typeof req.body[attributeName] === 'string' && !Number.isNaN(Number(req.body[attributeName]))) {
        req.body[attributeName] = Number(req.body[attributeName]);
      }
      typeCheckResult = generateResult((typeof req.body[attributeName] === type), result, options);
      break;
    case 'boolean':
      typeCheckResult = generateResult((typeof req.body[attributeName] === type), result, options);
      break;
    default:
      typeCheckResult = generateResult((false), result, options);
      break;
  }
  return typeCheckResult;
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
    result.push(options.message ? options.message : "MISMATCH");
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

const VALIDATOR_LIBRARY = (error, req, attributeName, result, options, callback) => {
  // var matchResult = options.values.patterns.map((pattern) => {
  //   return validator.contains(req.body[attributeName], pattern);
  // }).reduce((a, b) => {
  //   if (options.values.exclusion) {
  //     return (a || b);
  //   }
  //   return (a && b);
  // }, (options.values.exclusion ? false : true));
  // if (options.values.exclusion) {
  //   if (matchResult) {
  //     result.push(options.message ? options.message : "EXCLUDE");
  //   }
  // } else {
  //   if (!matchResult) {
  //     result.push(options.message ? options.message : "INCLUDE");
  //   }
  // }
  callback();
}

module.exports = { TYPE, LENGTH, DUPLICATION, REQUIRE, MATCH, CONTAIN, VALIDATOR_LIBRARY };