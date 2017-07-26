angular.module('Game.controllers')
.controller('GameCtrl', ['$location','$scope','GameFactory', function($location,$scope,GameFactory) {

    var client = this;
    var socket = io.connect();
    GameFactory.createGame(1000, 500, socket);


    client.joinGame = function(name) {
        socket.emit('joinGame', {id: name});
        //var audio = new Audio('audio/sob.wav'); LOL!
        //audio.play();
    }	


    /*Socket events*/
    socket.on('sync',function (gameServerData) {
    	//console.log("Sync client");
    	GameFactory.receiveData(gameServerData);
    });

    socket.on('addTank',function (tank) {
    	GameFactory.addTank(tank)
    });

}]);