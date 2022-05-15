# Foobar

Foobar is a Python library for dealing with word pluralization.

## Installation

Use the npm package manager.

```bash
npm install 
```

## Usage

You need two devices: one with RelativeOrientationSensor support (Android + Chrome), second to view the platform (Desktop with powerful GPU for rendering) 

To host app on 5000 port, use:
```bash
npm run start
```
To tunnel localhost outside, tool like ngrok can be used
```bash
ngok http 5000
```
Open the app on your mobile device first by navigating on connect page - .../connect. App will ask you to prompt player name and generate an ID for your room. 

Next open the platform page on your desktop device and place your room id as query string (https://e2f3-89-176-163-95.eu.ngrok.io/platform?roomId=2765)



## License
[MIT](https://choosealicense.com/licenses/mit/)
