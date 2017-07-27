angular.module('Game.controllers')
.controller('GameCtrl', ['$location','$scope','GameFactory', function($location,$scope,GameFactory) {

    var client = this;
    var socket = io.connect();
    var game;
    client.showForm = true;

   


    client.joinGame = function(name) {
    	game = new GameFactory(1000, 500, socket);
        socket.emit('joinGame', {id: name});
        client.showForm = false;
        //var audio = new Audio('audio/sob.wav'); LOL!
        //audio.play();
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