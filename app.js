/**
 * Created by youlongli on 2/9/15.
 */

angular.module('computerGraphics', ['ngRoute']).config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
        when('/hw1', {
          templateUrl: 'homework/hw1/hw1.html',
          controller: 'hw1Ctrl'
        }).
        otherwise({
          redirectTo: '/'
        });
  }]);