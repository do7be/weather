'use strict'

var express = require('express');
var router = express.Router();
const http = require('http');
const xml2js = require('xml2js');
const co = require('co');

/* GET users listing. */
router.get('/', function(req, res, next) {

  co(function *() {
    let rss = yield getRss();

    let cityId = yield findCityId(rss, req.query.city);

    let result = yield getForecast(cityId);

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
            resolve(result.rss.channel);
          }
        });
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
  });
}

function findCityId(rss, cityName) {
  return new Promise(function(resolve) {
    const prefs = rss[0]['ldWeather:source'][0]['pref'];
    prefs.forEach(function (pref) {
      pref.city.forEach(function (city) {
        if (city['$'].title == cityName) {
          resolve(city['$'].id);
        }
      });
    });
  });

  return resolve(null);
}

function getForecast(cityId) {
  return new Promise(function(resolve) {
    resolve("finish");
  });
}

module.exports = router;
