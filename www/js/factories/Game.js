angular.module('Game.factories', [])
.factory('GameFactory', function(){
	
	var GameFactory = {};
	GameFactory.createGame = function (socket) {
		GameFactory.socket = socket;
		setInterval(function(){
			GameFactory.gameLoop();

		}, 1000);
	}

	GameFactory.gameLoop = function() {
		GameFactory.sendData();
	}

	GameFactory.sendData = function() {
		console.log("Sending data");
		var gameData = 2;
		GameFactory.socket.emit('sync', gameData);
		
	}

	GameFactory.recieveData = function(data) {
		console.log("Data recieved");
	}

	GameFactory.receiveData = function(gameData) {
		//for(i=0;i<gameData.length;i++) {

		//}
	}

	GameFactory.addTank = function(tankData) {
		
	}

	return GameFactory;	

});