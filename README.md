# plex-webhooks

## Description
A node.js application that will control LIFX lights through Plex Webhooks.

The color of the lights will be determined by the dominant color of media image for the media that is being played back.

Different behaviors are enabled for different rooms but for all rooms, the lights are dimmed to 25% when playing and increased to 100% when paused.

## Setup

1. `npm run setup`
  - Copies the `.sample_env` file to `.env`
2. Modify the `.env` file to update the appropriate variables.
  - `PLEXADDRESS` is your plex server URL
  - `PLEXTOKEN` is your Plex Authentication Token
  - `LIFXAUTH` is your LIFX Authentication Token
3. `npm install`
  - Install all dependencies
4. `npm run start`
  - Runs the application

## Dependencies
1. express
2. multer
3. request
4. img-color