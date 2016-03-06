'use strict'

var express = require('express');
var router = express.Router();
const http = require('http');
const xml2js = require('xml2js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  getRss().then(function(result) {
    res.render('get', {info: result});
  });
});

function getRss() {
  return new Promise(function(resolve) {
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
        xml2js.parseString(body, (err, result)=> {
          if(err) {
            console.log(err);
          } else {
            console.log(result.rss.channel);
            resolve("hoge");
          }
        });
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
  });
}
module.exports = router;
