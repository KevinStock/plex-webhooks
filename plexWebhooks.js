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

// Apple TVs
var APPLETVS = {'LivingRoom': 'EB5D43ED-416A-4C96-AC21-997582561DBD',
            'Bedroom': '18114917-2071-4486-BDFF-0B87897A8655',
            'Basement': '73E643FA-7653-4D77-977E-44859DFDF491'}

// LIFX Bulb Groups
var LIFXGROUPIDS = {'LivingRoom': '258662f1abbffed5d7410280860b9eef',
                'Bedroom': '93cfa6a8b2266c52e55e5c7c18b3ac44',
                'Basement': '603d06fdac6d5390eb80d58fcf4e9861'}


console.log('Listening...');

app.post('/', upload.single('thumb'), function(req, res, next) {
  var payload = JSON.parse(req.body.payload);
  console.log('Got webhook for', payload.event);

  // Get Media Details
//  console.log(payload.Metadata);
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
  console.log('Player ID: ' + payload.Player.uuid + ' (' + getKeyByValue(APPLETVS, payload.Player.uuid) + ')');

  // Actions for Apple TVs
  if (isAppleTV(payload.Player.uuid) && payload.Metadata.type != 'track') {
    var light_group = LIFXGROUPIDS[getKeyByValue(APPLETVS, payload.Player.uuid)];
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
      if (getKeyByValue(APPLETVS, payload.Player.uuid) == 'LivingRoom') {
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
  function isAppleTV(uuid) {
    for (appleTV in APPLETVS){
      if (APPLETVS[appleTV] == uuid) {
        return true;
      }
    }
    return false;
  }

  // Function to get Key by Value from associative array
  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
});

app.listen(3100);
