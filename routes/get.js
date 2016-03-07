'use strict'

var express = require('express');
var router = express.Router();
const http = require('http');
const xml2js = require('xml2js');
const co = require('co');

/* GET Forecast. */
router.get('/', function(req, res, next) {
  co(function *() {
    let rss = yield getRss();
    let cityId = yield findCityId(rss, req.query.city);
    let forecast = yield getForecast(cityId);

    // encode to utf-8
    var body = forecast.replace(/(\\u)([0-9a-fA-F]{4})/g, function(match, p1, p2) {
      return String.fromCharCode(parseInt(p2, 16));
    });

    res.render('get', {info: body});
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
            resolve(err);
          } else {
            resolve(result.rss.channel);
          }
        });
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
      resolve("Got error: " + e.message);
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
    var options = {
      host: 'weather.livedoor.com',
      port: 80,
      path: '/forecast/webservice/json/v1?city=' + cityId,
    };

    http.get(options, function(httpRes) {
      let body = '';
      httpRes.setEncoding('utf8');
      httpRes.on('data', (chunk) => {
        body += chunk;
      });

      httpRes.on('end', (httpRes) => {
        resolve(body);
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
      resolve("Got error: " + e.message);
    });
  });
}

module.exports = router;
