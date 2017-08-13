var Game = angular.module('Game', ['ngRoute', 'ngMaterial', 'ngAnimate', 'Game.controllers','Game.factories','smoothScroll'])


//Configuration function. Here we define which templates are 
//linked to which controllers.
Game.config(function($routeProvider, $locationProvider) {
	$routeProvider

	.when('/', {
		templateUrl: "/templates/arena.html"
	})

	.when('/404', {
		templateUrl: "/templates/404.html"
	})

    //default catch-all
	.otherwise({
		templateUrl: '/templates/404.html'
	});

	$locationProvider.html5Mode(true);
});

