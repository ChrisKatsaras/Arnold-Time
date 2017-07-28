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
			var gameData = {};

			//Send tank data
			var t = {
				id: this.local.id,
				x: this.local.x,
				y: this.local.y,
				angle: this.local.angle
			};
			gameData.tank = t;
			this.socket.emit('sync', gameData);
		},

		receiveData : function(serverData) {
			
			var game = this;
			serverData.tanks.forEach( function(serverTank) {
				//console.log(serverTank);

				if(game.local != undefined && serverTank .id == game.local.id) {
					game.local.hp = serverTank.hp;
					if(game.local.hp <= 0){
						//game.killTank(game.localTank);
						console.log("You dead");
					}
				}

				game.tanks.forEach( function(clientTank){
					//update foreign tanks
					if(clientTank.id == serverTank.id){
						clientTank.x = serverTank.x;
						clientTank.y = serverTank.y;
						clientTank.angle = serverTank.angle;
						clientTank.hp = serverTank.hp;
						if(clientTank.hp <= 0){
							//game.killTank(clientTank);
						}
						clientTank.refresh();
						found = true;
					}
				});
			});
		},

		addTank : function(tankData) {
			var tank = new TankFactory(tankData.id, tankData.local, tankData.x, tankData.y, tankData.hp);
			if(tank.local) {
				console.log("The player local");
				this.local = tank;
			} else {
				console.log("The player isnt local");
				this.tanks.push(tank);
			}
			
		}
	}

	return GameFactory;	

}]);