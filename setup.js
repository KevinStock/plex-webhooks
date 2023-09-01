// setup.js
const readline = require('readline');
const fs = require('fs');
const axios = require('axios');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let config = {
  DEVICE_PAIRS: {},
  PLEXADDRESS: '',
  PLEXTOKEN: '',
  LIFXAUTH: ''
}

// Function to ask for a new pairing
function askForPairing() {
  console.log('Please enter Plex Device UUID, Lifx Group ID, and light action on stop pairings.');
  // Prompt the user for LIFX Group ID
  rl.question('Enter your LIFX Group ID (or "done" to finish): ', (lifxGroupId) => {
    if (lifxGroupId.toLowerCase() === 'done') {
      // If the user is done, write the .env file and close the readline interface
      fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
      console.log('config.json file created successfully.');
      rl.close();
    } else {
      // Prompt the user for Plex Device Name
      rl.question('Enter your Plex Device UUID: ', (plexDeviceUUID) => {
        // Prompt the user for light action on stop
        rl.question('Enter your light action on stop (on/off): ', (lightActionOnStop) => {
          // Add the new pairing to the .env content
          // Format: DEVICE_PAIR=lifxGroupId,plexDeviceName
          config.DEVICE_PAIRS[lifxGroupId] = {
            PlexDeviceUUID: plexDeviceUUID,
            LifXGroup: lifxGroupId,
            lightActionOnStop: lightActionOnStop
          };
          // Ask for another pairing
          askForPairing();
        });
      });
    }
  });
}

// Prompt the user for Plex server URL
rl.question('Enter your Plex server URL: ', (plexAddress) => {
  // Prompt the user for Plex Authentication Token
  rl.question('Enter your Plex Authentication Token: ', (plexToken) => {
    // Prompt the user for LIFX Authentication Token
    rl.question('Enter your LIFX Authentication Token: ', (lifxAuth) => {
      // Add the initial values to the .env content
      config.PLEXADDRESS = plexAddress;
      config.PLEXTOKEN = plexToken;
      config.LIFXAUTH = lifxAuth;
      // Start asking for pairings
      askForPairing();
    });
  });
});