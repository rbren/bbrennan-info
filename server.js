var FS = require('fs');
var Express = require('express');
var App = Express();

App.set('views', __dirname + '/views')
App.set('view engine', 'jade');

App.use(require('body-parser').json());

App.use(Express.static(__dirname + '/static'));

App.use('/strapping', require('strapping')({basePath: '/strapping'}));

App.all('/posted/*', function(req, res) {
  var redir = 'http://bbrennan.info:3030' + req.originalUrl.substring(7);
  console.log('redir', redir);
  res.redirect(307, redir);
})

App.post('/contact', function(req, res) {
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

App.use('/blog', require('./routes/blog.js'));

App.get('/', function(req, res) {
  res.render('index');
});

App.listen(3000);

var sanitizePath = function(path) {
  // Get rid of weird chars
  path = path.replace(/[^\w\.\/\-\?]/g, '');
  // Get rid of traversals
  path = path.replace(/\.\./g, '');
  return path;
}

