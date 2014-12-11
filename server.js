var FS = require('fs');
var EXPRESS = require('express');
var APP = EXPRESS();

APP.set('views', __dirname + '/views')
APP.set('view engine', 'ejs');

APP.use(require('body-parser').json());

APP.get("/res/*", function(req, res) {
  var path = sanitizePath(req.url);
  res.sendFile(__dirname + path);
});

APP.post('/contact', function(req, res) {
  console.log('contact:' + JSON.stringify(req.body));
  var text =
      'Date:' + new Date() + '\n' +
      'Email:' + req.body.email + '\n' +
      'Phone:' + req.body.phone + '\n' +
      'Name:' + req.body.name + '\n' +
      'Message:\n' + req.body.message + '\n\n\n';
  if (text.length < 3000) {
    res.end();
    FS.writeFile(__dirname + '/mail/mail.txt', text, {flag: 'a'});
  } else {
    res.status(400);
    res.end('ERROR');
  }
});

APP.get('*', function(req, res) {
  res.render('index.ejs');
});

APP.listen(3000);

var sanitizePath = function(path) {
  // Get rid of weird chars
  path = path.replace(/[^\w\.\/\-\?]/g, '');
  // Get rid of traversals
  path = path.replace(/\.\./g, '');
  return path;
}

