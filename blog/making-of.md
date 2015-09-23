{
  "title": "The Making of this Blog",
  "description": "How I put together a lightweight blog in a few hours",
  "date": "9-22-2015"
}
END_METADATA

## Motivation
I'm determined to get back into writing. I figure a blog is an easy way to start.

#### Why not just use Blogger or medium.com?
There are plenty of platforms out there I could have used, none of which I looked at.
There are a few reasons I wanted to build my own:
* I wanted to use my own domain
* I'll be writing a lot about web tools, and want to be able to embed demos
* It sounded like fun

## The Requirements
I wanted each blog post to be a Markdown file. I also wanted a cover page with the latest posts,
So I'd need to be able to include some metadata like title, description, and date created.

As a bonus challenge, I wanted to include a commenting system. This means we'll need a datastore.

How hard could it be?

## The Stack
I've been using NodeJS with Express for the last year, and for a simple webservice I can't imagine
anything better.  I'm also using AngularJS to control the comments section. It beats
jQuery by a mile, but after a year of daily use I still feel like I'm fighting it...would
love any suggestions on a new MV* framework.

You might think this sounds like a boring, predictable MEAN stack, but shyamalan twist, no Mongo.
Instead, I'm using an experimental backend that I've been putting together - GitBack.
So...GEAN? GBEAN? I like GBEAN.

I'll be writing a detailed post on GitBack later, but the idea is to use git as a datastore.
Crazy right? Totally doesn't scale.
But for small amounts of data, with few writes, it's insanely convenient.  You get, for free:
* A history of every revision to the datastore
* Versioning (via branches)
* The ability to roll back any single change, or revert to any point in time
* The ability to store aribitrary data **without dealing with encoding/decoding**. Images are just images, .zips are just .zips
* A beautiful GUI for viewing and editing the datastore, thanks to GitHub

We'll see the basics of using GitBack below.

## The Code
Let's start by writing the first post:

**./blog/hello-world.md**
```markdown
This is **my first post**!
```

Now we need a Node router to turn them into webpages. We'll use the npm package
[marked]('https://www.npmjs.com/package/marked') to render the markdown.

**./routes/blog.js**
```js
var Router = module.exports = require('express').Router();
var Marked = require('marked');
Router.get('/:post', function() {
  var file = Path.join('/', req.params.post);
  file = Path.join(__dirname, '../blog', file + '.md');
  FS.readFile(file, 'utf8', function(err, contents) {
    res.render('blog-post', {entry: contents, Marked: Marked});
  });
})
```

I like to use Jade for rendering HTML:

**./views/blog-post.jade**
```jade
.container
  .row
    .col-xs-12.col-lg-10.col-lg-offset-1
      h1
        span= entry.title
      p.small= entry.dateString
        .clearfix
      hr
      div !{Marked(entry.contents)}
```

### Adding Comments
To enable comments, we'll need a datastore. As I mentioned, we'll be using the open-source GitBack.

**./routes/blog.js**
```js
var DB = new Gitback({
  directory: __dirname + '/../database',
  remote: 'https://github.com/bobby-brennan/gitback-blog.git',
});

DB.initialize(function(err) {
  if (err) throw err;
  Router.use('/api', DB.router);
});
```

GitBack will store all comments in [this GitHub repo](https://github.com/bobby-brennan/gitback-blog.git).
Leave a note below and you'll see it appear there!
GitBack will maintain a local copy of that repository in the specified directory. We just need to add a collection:

**./database/comments.js**
```js
{
  access: {
    get: 'all',
    post: 'all',
  }
}
```

We can get fancier by enforcing a particular schema, adding access control,
or adding middleware to modify the input and output data, but for now we'll accept arbitrary JSON.

Now we'll use AngularJS to read and write comments:

**./static/js/ng/blog-post.js**
```js
App.controller('Comments', function($scope) {
  $scope.refresh = function() {
    $.getJSON('/blog/api/comments?article=' + encodeURIComponent($scope.article.url), function(comments) {
      $scope.comments = comments;
      $scope.$apply();
    });
  };
  $scope.refresh();

  $scope.addComment = function() {
    $.ajax('/blog/api/comments', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: JSON.stringify({
        id: new String((new Date()).getTime()),
        article: $scope.article.url,
        text: $scope.comment || '',
        by: $scope.by || 'anonymous',
      }),
      success: $scope.refresh,
    })
  }
});
```

Easy right? Gitback automatically exposes RESTful endpoints for creating and retrieving comments.

Now we just need to implement the comment UI:
```jade
div(ng-controller="Comments")
  .row
    .col-xs-12
      .form-group
        textarea.form-control(ng-model="comment")
      .form-group
        input.form-control(type="text" ng-model="by")
      a.btn.btn-success(ng-click="addComment()") Submit
      hr
  .row(ng-repeat="comment in comments")
    .col-xs-12
      h6 {{ comment.by || 'anonymous' }}
      div(marked="comment.text || '*No text provided*'")
      hr
```

That's it! Maybe 100 lines of non-boilerplate code. It took longer to write this post.

It's amazing how far the web has come in the last ten years. The proliferation of free
and open source solutions to common problems has simplified and accelerated the development
process by orders of magnitude. 

## The Results
See for yourself! Leave a comment below and test it out.

You can also see the code [on GitHub](https://github.com/bobby-brennan/bbrennan-info)
