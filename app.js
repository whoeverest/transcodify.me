var ffmpeg = require('fluent-ffmpeg');

var express = require('express');
var mustache = require('mustache');

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');


var app = express();
app.use(express.bodyParser());

app.get('/', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync('index.html', 'utf-8'));
});

app.get('/get/:videoId', function(req, res) {
  var videoId = req.params.videoId;
  res.attachment();
  res.sendfile(path.join('converted', videoId));
})

app.post('/convert', function(req, res) {
  var url = req.body.url;
  var url_hash = crypto.createHash('md5').update(url).digest("hex");
  
  res.writeHead(200, { 'Content-Type': 'text/html' });

  var proc = new ffmpeg({ source: url })
  .withVideoCodec('libx264')
  .toFormat('mp4')
  .saveToFile(path.join('converted', url_hash + '.mp4'), function(stdout, stderr) {
    var thumbs = new ffmpeg({ source: path.join('converted', url_hash + '.mp4') })
      .withSize('400x300')
      .takeScreenshots({ count: 1, timemarks: ['0.5'] }, 'thumbnails', function(err, filenames) {
        if (!err) {
          fs.rename(path.join('thumbnails', filenames[0]), path.join('thumbnails', url_hash + '.jpg'));
        }
        res.end(mustache.to_html(fs.readFileSync('success.html', 'utf-8'), {link: '/get/' + url_hash + '.mp4'}));
      })
  });
})

app.listen(80);

/*
todo:
- /get/id/filename.mp4
*/