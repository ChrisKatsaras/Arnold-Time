angular.module('Game.factories', [])
.factory('TankFactory', function(){
	
	var TankFactory = {};

	TankFactory.createGame = function (socket) {
		TankFactory.socket = socket;
		setInterval(function(){
			TankFactory.gameLoop();
		}, 1000);

	}

	TankFactory.gameLoop = function() {
		TankFactory.sendData();
	}

	TankFactory.sendData = function() {
		console.log("Sending data");
		var gameData = 2;
		TankFactory.socket.emit('sync', gameData);
	}

	TankFactory.recieveData = function(data) {
		console.log("Data recieved");
	}

	return TankFactory;

});