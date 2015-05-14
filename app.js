/**
 * Created by youlongli on 2/9/15.
 */

var app = angular.module('computer-graphics', ['ngRoute']);

app.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
        when('/Contents', {
          templateUrl: 'Contents.html'
        }).
      // HW1
        when('/hw1', {
          templateUrl: 'homework/hw1/hw1.html'
        }).
      // HW2
        when('/hw2', {
          templateUrl: 'homework/hw2/hw2.html'
        }).
      // HW3
        when('/hw3/BlinnModel', {
          templateUrl: 'homework/hw3/BlinnModel.html'
        }).
        when('/hw3/PhongModel', {
          templateUrl: 'homework/hw3/PhongModel.html'
        }).
        when('/hw3/Reflection', {
          templateUrl: 'homework/hw3/Reflection.html'
        }).
        when('/hw3/BooleanIntersection', {
          templateUrl: 'homework/hw3/BooleanIntersection.html'
        }).
        when('/hw3/Matrix', {
          templateUrl: 'homework/hw3/Matrix.html'
        }).
        when('/hw3/Bounce', {
          templateUrl: 'homework/hw3/Bounce.html'
        }).
      // HW4
        when('/hw4/Refraction', {
          templateUrl: 'homework/hw4/Refraction.html'
        }).
        when('/hw4/Cylinder', {
          templateUrl: 'homework/hw4/Cylinder.html'
        }).
        when('/hw4/Cube', {
          templateUrl: 'homework/hw4/Cube.html'
        }).
        when('/hw4/Triangle', {
          templateUrl: 'homework/hw4/Triangle.html'
        }).
        when('/hw4/Hexagon', {
          templateUrl: 'homework/hw4/Hexagon.html'
        }).
        when('/hw4/WoodTexture', {
          templateUrl: 'homework/hw4/WoodTexture.html'
        }).
        // HW5
        when('/hw5/', {
          templateUrl: 'homework/hw5/hw5.html'
        }).
        when('/hw5/Cubes', {
          templateUrl: 'homework/hw5/Cubes.html'
        }).
        // HW6
        when('/hw6/Parametric', {
          templateUrl: 'homework/hw6/Parametric.html'
        }).
        when('/hw6/greedySnake', {
          templateUrl: 'homework/hw6/greedySnake.html'
        }).
        when('/hw6/matchMan', {
          templateUrl: 'homework/hw6/matchMan.html'
        }).
        // HW7
        when('/hw7/HW7', {
          templateUrl: 'homework/hw7/HW7.html'
        }).
        when('/hw7/CurveEditor', {
          templateUrl: 'homework/hw7/CurveEditor.html'
        }).
        when('/hw8/HW8', {
          templateUrl: 'homework/hw8/HW8.html'
        }).
        when('/project/pacman', {
          templateUrl: 'homework/project/pacman.html'
        }).
        otherwise({
          redirectTo: 'Contents.html'
        });
  }]);