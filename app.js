/**
 * Created by youlongli on 2/9/15.
 */

angular.module('computerGraphics', ['ngRoute']).config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
        when('/Contents', {
            templateUrl: 'Contents.html'
        }).
        when('/hw1', {
          templateUrl: 'homework/hw1/hw1.html'
        }).
        when('/hw2', {
          templateUrl: 'homework/hw2/hw2.html'
        }).
        when('/BlinnModel', {
          templateUrl: 'homework/hw3/BlinnModel.html'
        }).
        when('/PhongModel', {
          templateUrl: 'homework/hw3/PhongModel.html'
        }).
        when('/Reflection', {
          templateUrl: 'homework/hw3/Reflection.html'
        }).
        when('/BooleanIntersection', {
            templateUrl: 'homework/hw3/BooleanIntersection.html'
        }).
        when('/Matrix', {
          templateUrl: 'homework/hw3/Matrix.html'
        }).
        when('/Bounce', {
            templateUrl: 'homework/hw3/Bounce.html'
        }).
        when('/Experiment', {
            templateUrl: 'homework/hw4/Experiment.html'
        }).
        when('/Refraction', {
            templateUrl: 'homework/hw4/Refraction.html'
        }).
        when('/Cylinder', {
            templateUrl: 'homework/hw4/Cylinder.html'
        }).
        when('/Cube', {
          templateUrl: 'homework/hw4/Cube.html'
        }).
        when('/Triangle', {
          templateUrl: 'homework/hw4/Triangle.html'
        }).
        otherwise({
          redirectTo: '/Index'
        });
  }]);