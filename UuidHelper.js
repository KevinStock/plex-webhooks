var express = require('express')
  , multer  = require('multer');

var app = express();
var upload = multer({ dest: '/tmp/' });

console.log('Listening...');

app.post('/', upload.single('thumb'), function(req, res, next) {
    var payload = JSON.parse(req.body.payload);
    console.log('Got webhook for', payload.event);
  
    // Log Player UUID
    console.log('Player UUID: ' + payload.Player.uuid);

  });

  app.listen(3101);