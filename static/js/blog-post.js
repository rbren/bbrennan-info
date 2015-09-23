var App = angular.module('app', []);

App.controller('Article', function($scope) {
  $scope.article = ARTICLE;
})

App.controller('Comments', function($scope) {
  $scope.refresh = function() {
    $.getJSON('/blog/api/comments?article=' + encodeURIComponent($scope.article.url), function(comments) {
      console.log('com', comments);
      $scope.comments = comments;
      $scope.$apply();
    });
  }
  $scope.refresh();
})

App.controller('AddComment', function($scope) {
  $scope.addComment = function() {
    $.ajax('/blog/api/comments', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      success: $scope.refresh,
      data: JSON.stringify({
        id: new String((new Date()).getTime()),
        article: $scope.article.url,
        text: $scope.comment,
        by: $scope.by || 'anonymous',
      }),
    })
  }
})
