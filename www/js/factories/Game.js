angular.module('Game.factories')
.factory('GameFactory' ,['TankFactory', function(TankFactory){
	
	//var GameFactory = {};
	var GameFactory = function (width, height, socket) {
		this.tanks = [];
		this.width = width;
		this.height = height
		this.socket = socket;
		//this.local = null;
		var loop = this;

		setInterval(function() {
			loop.gameLoop();
		}, 25);
	}

	GameFactory.prototype = { 
	
		gameLoop : function() {
			if(this.local) {
				this.sendData();
				this.local.move();
			}
			
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
			console.log("Sync",gameData);
			this.socket.emit('sync', gameData);	
		},

		receiveData : function(serverData) {
			
			var game = this;
			serverData.tanks.forEach( function(serverTank) {
				

				if(game.local !== undefined && serverTank.id == game.local.id) {
					game.local.hp = serverTank.hp;
					if(game.local.hp <= 0){
						//game.killTank(game.localTank);
						console.log("You dead");
					}
				}	
				//console.log(game.tanks);
				var found = false;
				game.tanks.forEach( function(clientTank){
					//update foreign tanks
					//console.log("Foreign tanks",game.tanks);
					//console.log("Server tank",serverTank);
					if(clientTank.id == serverTank.id){
						clientTank.x = serverTank.x;
						clientTank.y = serverTank.y;
						clientTank.angle = serverTank.angle;
						clientTank.hp = serverTank.hp;
						if(clientTank.hp <= 0){
							//game.killTank(clientTank);
						}
						//console.log("refreshing client tank", clientTank);
						clientTank.refresh();
						found = true;
					}
				});
				console.log("List of tanks", game.tanks);
				if(!found && (game.local == undefined || serverTank.id != game.local.id)){
					//I need to create it
					console.log(serverTank);
					//{ id: data.id, local: false, x: initX, y: initY, hp: 100 })
					game.addTank({id : serverTank.id, local : false, x: serverTank.x, y: serverTank.y, hp: serverTank.hp});
				}
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
			
		},
		removeTank: function(username){
			//Remove tank object
			this.tanks = this.tanks.filter(function(t){return t.id != username} );
			//remove tank from dom
			console.log("removing")
			$('#' + username).remove();
		}
	}

	return GameFactory;	

}]);