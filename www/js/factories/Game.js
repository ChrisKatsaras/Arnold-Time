angular.module('Game.factories')
.factory('GameFactory' ,['TankFactory', function(TankFactory){
	
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

	GameFactory.receiveData = function(data) {
		console.log("Data recieved");
	}

	GameFactory.addTank = function(tankData) {
		var tank = new TankFactory(tankData.id, tankData.x, tankData.y, tankData.hp);
		console.log("MOTHA FUCKA TANK")
	}

	return GameFactory;	

}]);