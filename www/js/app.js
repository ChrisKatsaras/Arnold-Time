var Game = angular.module('Game', ['ngRoute', 'ngMaterial', 'ngAnimate', 'Game.controllers','smoothScroll','chart.js'])

//function runs when app has been initialized and has started
.run(function(){
	console.log("Project has started.");
})

//Configuration function. Here we define which templates are 
//linked to which controllers.
.config(function($routeProvider, $locationProvider) {
	$routeProvider

	.when('/', {
		templateUrl: "templates/arena.html"
	})

    //default catch-all
	.otherwise({
		redirectTo: '/404'
	});

	$locationProvider.html5Mode(true);
});

