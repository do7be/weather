'use strict'

var express = require('express');
var router = express.Router();
const http = require('http');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var options = {
    host: 'weather.livedoor.com',
    port: 80,
    path: '/forecast/rss/primary_area.xml',
  };

  http.get(options, function(httpRes) {
    let body = '';
    httpRes.setEncoding('utf8');
    httpRes.on('data', (chunk) => {
      body += chunk;
    });

    httpRes.on('end', (httpRes) => {
      res.render('get', {info: body});
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
});

module.exports = router;
