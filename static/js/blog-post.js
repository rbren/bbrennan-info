var App = angular.module('app', ['hc.marked', 'ngAnimate']);
App.config(['markedProvider', function(markedProvider) {
  markedProvider.setOptions({
    gfm: true,
    highlight: function (code) {
      return hljs.highlightAuto(code).value;
    },
  });
  markedProvider.setRenderer({
    link: function(href, title, text) {
      return "<a href='" + href + "'" + (title ? " title='" + title + "'" : '') + " target='_blank'>" + text + "</a>";
    }
  });
}]);
App.controller('Article', function($scope) {
  $scope.article = ARTICLE;
})

App.controller('Comments', function($scope) {
  $scope.refresh = function() {
    $.getJSON('/blog/api/comments?article=' + $scope.article.id, function(comments) {
      $scope.comments = comments;
      $scope.comments.forEach(function(comment) {
        comment.date = parseInt(comment.id);
      });
      $scope.comments.sort(function(c1, c2) {
        if (c1.date > c2.date) return -1;
        if (c1.date < c2.date) return 1;
        return 0;
      })
      $scope.$apply();
    });
  }
  $scope.refresh();

  $scope.addComment = function() {
    $scope.sending = true;
    $scope.sent = false;
    $scope.error = false;
    if ($scope.comment.match('<script')) {
      $scope.error = 'This is why we can\'t have nice things :(';
      return;
    }
    $.ajax('/blog/api/comments', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      error: function() {
        console.log('error', arguments);
        $scope.sending = false;
        $scope.error = true;
        $scope.$apply();
      },
      success: function() {
        $scope.sending = false;
        $scope.comment = '';
        $scope.sent = true;
        setTimeout(function() {$scope.sent = false; $scope.$apply()}, 2500);
        $scope.refresh();
      },
      data: JSON.stringify({
        id: new String((new Date()).getTime()),
        article: $scope.article.id,
        text: $scope.comment,
        by: $scope.by || 'anonymous',
      }),
    })
  }
})
