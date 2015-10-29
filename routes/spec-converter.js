var Router = module.exports = require('express').Router();
var Converter = require('api-spec-converter');

Router.post('/convert', function(req, res) {
  if (req.body.source.indexOf('http') !== 0) return res.status(400).send('Invalid source URL');
  Converter.convert({
    from: req.body.from,
    to: req.body.to,
    source: req.body.source,
  }, function(err, result) {
    if (err) return res.status(500).send(err);
    res.json(result.spec);
  })
})


Router.get('/', function(req, res) {
  res.render('spec-converter');
})

