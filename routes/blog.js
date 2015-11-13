var FS = require('fs');
var DateFormat = require('dateformat');
var Router = module.exports = require('express').Router();
var Gitback = require('gitback');
var RSS = require('rss');

var BLOG_DIR = __dirname + '/../blog';
var DATE_FORMAT = 'dddd, mmmm dS, yyyy';

var ENTRIES = [];
var ENTRIES_KEYED = {};
/*
var DB = new Gitback({
  directory: __dirname + '/../database',
  remote: 'git@gitback-blog:bobby-brennan/gitback-blog.git',
  branch: process.env.DEVELOPMENT ? 'dev' : 'master',
  refreshRate: process.env.DEVELOPMENT ? undefined : 30000,
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
*/

var GITBACK_DIR = __dirname + '/../gitback-blog/articles'
var articles = FS.readdirSync(GITBACK_DIR).map(function(name) {
  var item = JSON.parse(FS.readFileSync(GITBACK_DIR + '/' + name + '/_item.json', 'utf8'));
  item.content = FS.readFileSync(GITBACK_DIR + '/' + name + '/content.md', 'utf8');
  item.id = name;
  return item;
})

Router.get('/rss', function(req, res) {
  var rssFeed = new RSS({
    title: 'Bobby Brennan\'s Blog',
    description: 'A collection of thoughts, tips, and tirades',
    feed_url: 'http://bbrennan.info/blog/rss',
    site_url: 'http://bbrennan.info/blog',
  });

  articles.forEach(function(article) {
    rssFeed.item({
      title: article.title,
      description: article.description,
      url: 'http://bbrennan.info/blog/' + article.id,
      date: new Date(article.date),
      author: 'Bobby Brennan',
    })
  })
  res.header('Content-Type','text/xml').send(rssFeed.xml())
})

Router.get('/:post', function(req, res) {
  var article = articles.filter(function(a) {return a.id === req.params.post})[0];
  if (!article) return res.status(404).end();
  res.render('blog-post', {article: article});
}) 

Router.get('/', function(req, res) {
  res.render('blog', {articles: articles});
});
