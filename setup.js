const readline = require('readline');
const fs = require('fs');
const axios = require('axios');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let envContent = '';
let pairCounter = 1;

// Function to ask for a new pairing
function askForPairing() {
  console.log('Please enter Plex Device and Lifx Group ID pairings.');
  // Prompt the user for LIFX Group ID
  rl.question('Enter your LIFX Group ID (or "done" to finish): ', (lifxGroupId) => {
    if (lifxGroupId.toLowerCase() === 'done') {
      // If the user is done, write the .env file and close the readline interface
      fs.writeFileSync('.env', envContent);
      console.log('.env file created successfully.');
      rl.close();
    } else {
      // Prompt the user for Plex Device Name
      rl.question('Enter your Plex Device Name: ', (plexDeviceName) => {
        // Add the new pairing to the .env content
        // Format: DEVICE_PAIR=lifxGroupId,plexDeviceName
        envContent += `DEVICE_PAIR_${pairCounter}=${lifxGroupId},${plexDeviceName}\n`;
        pairCounter++;
        // Ask for another pairing
        askForPairing();
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
      envContent += `PLEXADDRESS=${plexAddress}\nPLEXTOKEN=${plexToken}\nLIFXAUTH=${lifxAuth}\n`;
      // Start asking for pairings
      askForPairing();
    });
  });
});