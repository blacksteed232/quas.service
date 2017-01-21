'use strict';

let async = require('async');

let rule = require('../rules');
let methods = require('./methods');


let appendResult = (results, attributeName, result) => {
  if (result.length !== 0) {
    results[attributeName] = result;
  }
}

const validateObject = (req, callbackMain, option) => {
  let error = {};
  let resultValidation = {};
  async.parallel(option.field.map((attribute) => {
    return (callback) => { validateAttribute(req, resultValidation, error, rule[attribute], callback); }
  }), (errorAsync) => {
    if (errorAsync) {
      error.push(new Error(errorAsync));
    }
    callbackMain(error, resultValidation);
  });
};

const validateAttribute = (req, result, error, options, callbackRootValidator) => {
  let errorList = [];
  if (options.required.value) {
    if (!methods[options.required.function](req, options.name, errorList, options.required.options)) {
      async.series(options.validator.map((option) => {
        return (callback) => { methods[option.function](error, req, options.name, errorList, option, callback) };
      }), () => {
        appendResult(result, options.name, errorList);
        callbackRootValidator();
      });
    } else {
      appendResult(result, options.name, errorList);
      callbackRootValidator();
    }
  } else {
    async.series(options.validator.map((option) => {
      return (callback) => { methods[option.function](error, req, options.name, errorList, option, callback) };
    }), () => {
      appendResult(result, options.name, errorList);
      callbackRootValidator();
    });
  }
};

module.exports = { appendResult, validateAttribute, validateObject };