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

// curtosey of leszek.hanusz on stackoverflow
// https://stackoverflow.com/a/36887315
// add timestamp to log messages
var log = console.log;

console.log = function () {
    var first_parameter = arguments[0];
    var other_parameters = Array.prototype.slice.call(arguments, 1);

    function formatConsoleDate (date) {
        var hour = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();

        return '[' +
               ((hour < 10) ? '0' + hour: hour) +
               ':' +
               ((minutes < 10) ? '0' + minutes: minutes) +
               ':' +
               ((seconds < 10) ? '0' + seconds: seconds) +
               '.' +
               ('00' + milliseconds).slice(-3) +
               '] ';
    }

    log.apply(console, [formatConsoleDate(new Date()) + first_parameter].concat(other_parameters));
};

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
  if (isKnownDevice(payload.Player.uuid) && payload.Metadata.type != 'track') {
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

  // Function to check if Player is a known device
  function isKnownDevice(uuid) {
    return Object.values(config.DEVICE_PAIRS).some(device => device.PlexDeviceUUID === uuid);
  }

  // Function to get Key by Value from associative array
  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key].PlexDeviceUUID === value);
  }

  // Function to convert RGB to HEX
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
});

app.listen(3101);
