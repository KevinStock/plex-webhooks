# Plex Webhooks

This project allows you to control LIFX lights through Plex webhooks. It listens for events from Plex and adjusts the lighting based on the event type (play, pause, stop) and the device that triggered the event.

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Run `npm install` to install all the necessary dependencies.

## Setup

1. Run `npm run setup` to start the setup process.
2. You will be prompted to enter your Plex server URL, Plex Authentication Token, and LIFX Authentication Token. Enter these details as prompted.
3. Next, you will be asked to enter a series of device pairings. For each pairing, you will need to enter a Plex Device UUID, a LIFX Group ID, and a light action on stop (either 'on' or 'off').
4. Once you have entered all your pairings, type 'done' to finish the setup process. A `config.json` file will be created with your entered details.

## Running the Application

1. Run `npm start` to start the application.
2. The application will now listen for Plex webhook events and adjust your LIFX lights accordingly.

## Additional Tools and Details

### Plex Device UUID

The `UuidHelper.js` script can be used to log the UUID of any device that triggers a Plex webhook event. This can be useful for finding the UUID of a device to use in the setup process. To use this script, run `node UuidHelper.js` and trigger a Plex webhook event from the device you want to find the UUID of.

### Plex Auth Token

See this page for instuctions on retrieving your Plex Auth token: https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/

### Plex Webhooks

See this page for details on setting up Plex Webhooks. The Plex URL used in this application is the full URL and port of your Plex instance (e.g. `http://192.168.1.10:32400`). Plex Webhooks should be setup according to where the plexWebhooks.js is accessible by Plex and the port plexWebhooks is running on, which is set to 3101.

## Author

Kevin Stock - [kevin@kevinstock.net](mailto:kevin@kevinstock.net) - [http://www.kevinstock.net](http://www.kevinstock.net)

## License

This project is licensed under the MIT License.