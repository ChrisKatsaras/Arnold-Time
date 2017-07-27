angular.module('Game.factories')
.factory('GameFactory' ,['TankFactory', function(TankFactory){
	
	//var GameFactory = {};
	var GameFactory = function (width, height, socket) {
		this.tanks = [];
		this.width = width;
		this.height = height
		this.socket = socket;
		var loop = this;
		
		setInterval(function() {
			loop.gameLoop();
			loop.tanks[0].move();
		}, 25);
	}

	GameFactory.prototype = { 
	
		gameLoop : function() {
			this.sendData();
		},

		sendData : function() {
			//console.log("Sending data");
			var gameData = 2;
			this.socket.emit('sync', gameData);
		},

		receiveData : function(data) {
			//console.log("Data recieved");
		},

		addTank : function(tankData) {
			var tank = new TankFactory(tankData.id, tankData.x, tankData.y, tankData.hp);
			this.tanks.push(tank);
		}
	}

	return GameFactory;	

}]);