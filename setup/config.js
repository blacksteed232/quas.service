'use strict';

let config = require('nconf');
require('dotenv').load();

let settings = {
  RATE_LIMIT_TIME: 60000,
  RATE_LIMIT_COUNT: 2000,

  LANGUAGE_DEFAULT: "en",

  CORS_DOMAINS: [process.env.NODE_HOST],
  CORS_METHODS: ['GET', 'POST', 'PUT', 'DELETE'],
  CORS_HEADERS: ['authorization', 'content-type', 'x-language'], //React frontend only allow lowercase custom headers
  CORS_END_PREFLIGHT: true,
};

config.use('memory')
  .argv()
  .env()
  .defaults(settings);



module.exports = config;