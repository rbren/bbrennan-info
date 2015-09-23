var FS = require('fs');
var DateFormat = require('dateformat');
var Router = module.exports = require('express').Router();
var Gitback = require('gitback');

var BLOG_DIR = __dirname + '/../blog';
var DATE_FORMAT = 'dddd, mmmm dS, yyyy';

var ENTRIES = [];
var ENTRIES_KEYED = {};

var DB = new Gitback({
  directory: __dirname + '/../database',
  remote: 'https://github.com/bobby-brennan/gitback-blog.git',
});

DB.initialize(function(err) {
  if (err) throw err;
  Router.use('/api', DB.router);
})

if (process.env.DEVELOPMENT) {
  Router.use(function(req, res, next) {
    DB.collections.articles.reload(function(err) {
      if (err) throw err;
      next();
    })
  })
}

Router.get('/:post', function(req, res) {
  var entry = DB.collections.articles.get(req.params.post);
  if (!entry) return res.status(404).end();
  res.render('blog-post', {entry: entry});
}) 

Router.get('/', function(req, res) {
  res.render('blog', {entries: DB.collections.articles.get()});
});
