// Dependencies
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const ColorThief = require('colorthief');
const app = express();
const upload = multer({
    dest: '/tmp/'
});
const config = require('./config.json');
const logger = require('./utils/logger');
const { rgbToHex } = require('./utils/color');
const { isKnownDevice, getKeyByValue } = require('./utils/device');

// Initialize logger
logger();

console.log('Listening...');

app.post('/', upload.single('thumb'), function(req, res, next) {
  var payload = JSON.parse(req.body.payload);
  console.log('Got webhook for', payload.event);

  // Get Media Details
  var mediaTitle = payload.Metadata.grandparentTitle;
  if (payload.Metadata.live == '1') {
	  var mediaImage = payload.Metadata.grandparentThumb;
  }
  else if (payload.Metadata.librarySectionType == 'movie'){
	  var mediaImage = config.PLEXADDRESS + payload.Metadata.thumb + '?X-Plex-Token=' + config.PLEXTOKEN;
  }
  else {
  	  var mediaImage = config.PLEXADDRESS + payload.Metadata.grandparentThumb + '?X-Plex-Token=' + config.PLEXTOKEN;
  }

  // Log Player ID
  console.log(`Player Name: ${payload.Player.title} (${payload.Player.uuid})`);

  // Actions for Known Devices
  if (isKnownDevice(payload.Player.uuid, config) && payload.Metadata.type != 'track') {
    var deviceConfig = config.DEVICE_PAIRS[getKeyByValue(config.DEVICE_PAIRS, payload.Player.uuid)];
    var light_group = deviceConfig.LifXGroup;
    var lightActionOnStop = deviceConfig.lightActionOnStop;
    var options = {
      method: 'PUT',
      json: true,
      url: 'https://api.lifx.com/v1/lights/group:' + encodeURIComponent(light_group) + '/state',
      headers: {
         'Authorization': `Bearer ${config.LIFXAUTH}`
      }
    }

    // Media is Started
    if (payload.event == 'media.play' || payload.event == 'media.resume') {
      // Turn light off.
      console.log('Playing ', mediaTitle);
      console.log('Turning lights down.');
      options.data = {
        "power": "on",
        "brightness": 0.10
      };
      ColorThief.getColor(mediaImage)
        .then(function([r, g, b]) {
          options.data = {
            "power": "on",
            "brightness": 0.10,
            "color": rgb,
            "power": "on",
            "brightness": 0.10,
            "color": rgbToHex(r, g, b)
          };
          axios(options)
            .then(function (response) {
              if (response.status == 200 || response.status == 207) {
                response.data.results.forEach(function(item) {
                  if (item.status == 'ok') {
                    console.log('Request for item ' + item.label + ' was successful!');
                  } else {
                    console.log('Request for item ' + item.label + ' failed with status code: ' + item.status);
                  }
                });
              } else {
                console.log('Status Code: ', response.status);
              }
          })
          .catch(function (error) {
            console.log('Error: ', error);
        });
      })
      .catch(err => console.error(err));
    }
  
    // Media Paused
    else if (payload.event == 'media.pause') {
      // Turn light on.
      console.log('Pausing ', mediaTitle);
      console.log('Turning lights up.');
      ColorThief.getColor(mediaImage)
        .then(function([r, g, b]) {
          options.data = {
            "power": "on",
            "brightness": 0.5,
            "color": rgbToHex(r, g, b)
          };
          axios(options)
            .then(function (response) {
              if (response.status == 200 || response.status == 207) {
                response.data.results.forEach(function(item) {
                  if (item.status == 'ok') {
                    console.log('Request for item ' + item.label + ' was successful!');
                  } else {
                    console.log('Request for item ' + item.label + ' failed with status code: ' + item.statusCode);
                  }
                });
              } else {
                console.log('Status Code: ', response.status);
              }  
            })
            .catch(function (error) {
              console.log('Error: ', error);
            });
        })
        .catch(err => console.error(err));
    }
  
    // Media Stopped
    else if (payload.event == 'media.stop') {
      // Only turn the lights on if in the Living Room
      options.data = {
        "power": lightActionOnStop == 'on' ? "on" : "off",
        "color": "white",
        "brightness": 1.0
      }
      axios(options)
        .then(function (response) {
          if (response.status == 200 || response.status == 207) {
            response.data.results.forEach(function(item) {
              if (item.status == 'ok') {
                console.log('Request for item ' + item.label + ' was successful!');
              } else {
                console.log('Request for item ' + item.label + ' failed with status code: ' + item.statusCode);
              }
            });
          } else {
            console.log('Status Code: ', response.status);
          }
  
        })
        .catch(function (error) {
          console.log('Error: ', error);
        });
    }
  }
  res.sendStatus(200);
  });
  
  app.listen(3101);