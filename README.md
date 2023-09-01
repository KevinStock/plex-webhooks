# plex-webhooks

## Description
This is a Node.js application that controls LIFX lights through Plex Webhooks. The color of the lights is determined by the dominant color of the media image being played back. Different behaviors are enabled for different rooms but for all rooms, the lights are dimmed to 25% when playing and increased to 100% when paused.

## Setup
1. Run `npm install` to install all dependencies.
2. Run `npm run setup` to generate the `config.json` file.
- PLEXADDRESS is your Plex server URL.
- PLEXTOKEN is your Plex Authentication Token
- LIFXAUTH is your LIFX Authentication Token
- DEVICE_PAIRS are paired Plex Devices with LifX lights.
  - The LifX Group is the name of the group of lights to control.
  - The Plex Device UUID is the UUID of the device running a Plex client.
  - The Light Action on Stop is the behavior of the lights when media is stopped (on / off)
3. Run npm run start to start the application.

## Dependencies
The application depends on the following npm packages:
1. express
2. multer
3. request
4. img-color
5. dotenv

## Configuration
The application uses a config.json file to store configuration details. This file is created by the setup.js script during the setup process. The script prompts the user to enter their Plex server URL, Plex Authentication Token, and LIFX Authentication Token. It also allows the user to enter multiple pairings of Plex Device UUIDs, Lifx Group IDs, and light actions on stop.

### Version
The current version of the application is 0.1.0.

### License
This project is licensed under the MIT License.

### Contact
If you have any questions or suggestions, feel free to open an issue or pull request.

### Acknowledgements
Thanks to all contributors and users for their support.