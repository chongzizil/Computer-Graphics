angular.module('computerGraphics').controller('mainCtrl', ['$scope', '$location', '$window', function ($scope, $location, $window) {
    $scope.reload = function() {
        $window.location.reload();
    };
}]);