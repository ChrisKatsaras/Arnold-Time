angular.module('Game.factories')
.factory('GameFactory' ,['TankFactory', function(TankFactory){
	
	//var GameFactory = {};
	var GameFactory = function (width, height, socket) {
		this.tanks = [];
		this.width = width;
		this.height = height
		this.socket = socket;
		this.local = null;
		var loop = this;

		setInterval(function() {
			loop.gameLoop();
		}, 25);
	}

	GameFactory.prototype = { 
	
		gameLoop : function() {
			this.sendData();
			this.local.move();
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
			var tank = new TankFactory(tankData.id, tankData.local, tankData.x, tankData.y, tankData.hp);
			if(tank.local) {
				console.log("the tank is local");
				this.local = tank;
			} else {
				console.log("the AINT tank is local");
				this.tanks.push(tank);
			}
			
		}
	}

	return GameFactory;	

}]);