var ffmpeg = require('fluent-ffmpeg');

var express = require('express');
var mustache = require('mustache');

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');


var app = express();
app.use(express.bodyParser());
app.use(express.favicon('favicon.ico'));

app.get('/', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync('index.html', 'utf-8'));
});

app.get('/about', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync('about.html', 'utf-8'));
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

  var proc = new ffmpeg({ source: url, timeout: 300 })
  .withVideoCodec('libx264')
  .toFormat('mp4')
  .addOption('-t', '5')
  .addOption('-c:a', 'libfaac')
  .saveToFile(path.join('converted', url_hash + '.mp4'), function(stdout, stderr) {
    process.stdout.write(stderr);
    res.end(mustache.to_html(fs.readFileSync('success.html', 'utf-8'), {link: '/get/' + url_hash + '.mp4'}));
  });
})

app.listen(80);

/*
todo:
- /get/id/filename.mp4

*/