angular.module('Game.controllers')
.controller('GameCtrl', ['$location', '$mdDialog','$scope','GameFactory', function($location, $mdDialog,$scope,GameFactory) {

    var client = this;
    var socket = io.connect();
    var game;

   	client.init = function(ev) {
   		$mdDialog.show({
     		templateUrl: 'templates/modal.html',
     		parent: angular.element(document.body),
     		targetEvent: event,
     		clickOutsideToClose: false,
     		fullscreen: false,
     	});
   	}

   	client.cancelModal = function () {
   		$mdDialog.cancel();
   	}

    client.joinGame = function(name) {
    	game = new GameFactory(1000, 500, socket);
        socket.emit('joinGame', {id: name});
        var audio = new Audio('audio/sob.wav');//LOL
        audio.play();
    }	


    /*Socket events*/
    socket.on('sync',function (gameServerData) {
    	//console.log("Sync client");
    	game.receiveData(gameServerData);
    });

    socket.on('addTank',function (tank) {
    	game.addTank(tank)
    });

}]);