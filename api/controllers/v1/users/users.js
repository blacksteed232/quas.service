'use strict';

var router = require('express').Router()
var config = require('../../../../config/initializers/config');
var User = require('../../../models/user');
var logger = require('../../../helpers/logger')('CONTROLLER');
var password = require('../../../helpers/password');

router.route('/')

  .get((req, res) => {
    User.find({}, function (err, users) {
      res.json(users);
    });
  })

  .post((req, res) => {
    password.hashPassword(req.body.password, (err, combined) => {
      var nick = new User({
        name: req.body.name,
        password: combined.toString('base64'),
        role: 1
      });
      nick.save(function (err) {
        if (err) throw err;
        console.log('User saved successfully');
        res.json({ success: true });
      });
    });
  });

module.exports = router