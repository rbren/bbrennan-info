var App = angular.module('app', ['hc.marked']);
App.config(['markedProvider', function(markedProvider) {
  markedProvider.setOptions({
    gfm: true,
    breaks: true,
    highlight: function (code) {
      return hljs.highlightAuto(code).value;
    },
  });
}]);
App.controller('Article', function($scope) {
  $scope.article = ARTICLE;
})

App.controller('Comments', function($scope) {
  $scope.refresh = function() {
    $.getJSON('/blog/api/comments?article=' + encodeURIComponent($scope.article.url), function(comments) {
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
})

App.controller('AddComment', function($scope) {
  $scope.addComment = function() {
    $scope.sending = true;
    $.ajax('/blog/api/comments', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      success: function() {
        $scope.sending = false;
        $scope.refresh();
      },
      data: JSON.stringify({
        id: new String((new Date()).getTime()),
        article: $scope.article.url,
        text: $scope.comment,
        by: $scope.by || 'anonymous',
      }),
    })
  }
})
