require('dotenv').load();
// Dependencies
const express = require('express');
const request = require('request');
const multer = require('multer');
const color = require('img-color');
const app = express();
const upload = multer({
    dest: '/tmp/'
});

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

// Device Pairs
var DEVICE_PAIRS = {};
for (let i = 1; process.env[`DEVICE_PAIR_${i}`]; i++) {
  const [lifxGroupId, plexDeviceName] = process.env[`DEVICE_PAIR_${i}`].split(',');
  DEVICE_PAIRS[plexDeviceName] = lifxGroupId;
}

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
	  var mediaImage = process.env.PLEXADDRESS + payload.Metadata.thumb + '?X-Plex-Token=' + process.env.PLEXTOKEN;
  }
  else {
  	  var mediaImage = process.env.PLEXADDRESS + payload.Metadata.grandparentThumb + '?X-Plex-Token=' + process.env.PLEXTOKEN;
  }

  // Log Player ID
  console.log('Player Name: ' + payload.Player.name);

  // Actions for Known Devices
  if (isKnownDevice(payload.Player.name) && payload.Metadata.type != 'track') {
    var light_group = DEVICE_PAIRS[payload.Player.name];
    var options = {
      method: 'PUT',
      json: true,
      url: 'https://api.lifx.com/v1/lights/group_id:' + light_group + '/state',
      headers: {
         'Authorization': process.env.LIFXAUTH
      }
    }

    // Media is Started
    if (payload.event == 'media.play' || payload.event == 'media.resume') {
      // Turn light off.
      console.log('Playing ', mediaTitle);
      console.log('Turning lights down.');
      options.body = {
        "power": "on",
        "brightness": 0.10
      };
      color.getDominantColor(mediaImage)
        .then(function(col) {
          options.body.color = "#" + col.dColor;
          request(options);
        })
        .catch(err => console.error(err));
    }

    // Media Paused
    else if (payload.event == 'media.pause') {
      // Turn light on.
      console.log('Pausing ', mediaTitle);
      console.log('Turning lights up.');
      options.body = {
        "power": "on",
        "brightness": 0.5
      };
      color.getDominantColor(mediaImage)
        .then(function(col) {
          options.body.color = "#" + col.dColor;
          request(options);
        })
        .catch(err => console.error(err));

    }

    // Media Stopped
    else if (payload.event == 'media.stop') {
      // Only turn the lights on if in the Living Room
      if (payload.Player.name == 'ATV - Living Room') {
        console.log('Stopped Playing ', mediaTitle);
        console.log('Turning lights up.');
        options.body = {
          "power": "on",
          "color": "white",
          "brightness": 1.0
        }
      }
      else {
        console.log('Media Stopped: Turning lights off.');
        options.body = {
          "color": "white",
          "brightness": 1.0,
          "power": "off"
        }
      }
    request(options);
    }
  }
  res.sendStatus(200);

  // Function to check if Player is an AppleTV
  function isKnownDevice(name) {
    return Object.values(DEVICE_PAIRS).includes(name);
  }

  // Function to get Key by Value from associative array
  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
});

app.listen(3101);
