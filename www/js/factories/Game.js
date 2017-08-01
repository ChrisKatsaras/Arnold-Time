angular.module('Game.factories')
.factory('GameFactory' ,['TankFactory', 'BulletFactory',function(TankFactory, BulletFactory) {
	
	//var GameFactory = {};
	var GameFactory = function (width, height, socket) {
		this.tanks = [];
		this.width = width;
		this.height = height
		this.socket = socket;
		angular.element(document.querySelector('#field')).css('height','500px');
		angular.element(document.querySelector('#field')).css('width','1100px');
		var loop = this;

		setInterval(function() {
			loop.gameLoop();
		}, 35);
	}

	GameFactory.prototype = { 
	
		gameLoop : function() {
			//If the user is in the game
			if(this.local) {
				this.sendData();
				this.local.move();
			}
		},

		sendData : function() {
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
				if(game.local !== undefined && serverTank.id == game.local.id) {
					game.local.hp = serverTank.hp;
					if(game.local.hp <= 0) {
						game.killSoilder(game.local);
						this.local = {};
						console.log("You dead");
					}
				}	
				var found = false;
				game.tanks.forEach( function(clientTank) {
					if(clientTank.id == serverTank.id) {
						clientTank.x = serverTank.x;
						clientTank.y = serverTank.y;
						clientTank.angle = serverTank.angle;
						clientTank.hp = serverTank.hp;
						if(clientTank.hp <= 0){
							game.killSoilder(clientTank);
						}

						clientTank.refresh();
						found = true;
					}
				});
				//console.log("List of tanks", game.tanks);
				if(!found && (game.local == undefined || serverTank.id != game.local.id)) {

					game.addTank({id : serverTank.id, local : false, x: serverTank.x, y: serverTank.y, hp: serverTank.hp});
				}
			});

			$("div.bullet").remove();
			serverData.bullets.forEach( function(bullet) {
				var newBullet = new BulletFactory(bullet.username, bullet.bulletID, bullet.x, bullet.y, bullet.alpha);
				//Do destroy stuff here
			});
		},

		addTank : function(tankData) {
			var tank = new TankFactory(tankData.id, tankData.local, tankData.x, tankData.y, tankData.hp, this.socket);
			if(tank.local) {
				console.log("The player local");
				this.local = tank;
			} else {
				console.log("The player isnt local");
				this.tanks.push(tank);
			}
			
		},

		removeTank: function(username) {
			this.tanks = this.tanks.filter(function(t) {
				return t.id != username
			});
			$('#' + username).remove();
		},

		killSoilder: function(soilder) {
			soilder.dead = true;
			this.removeTank (soilder.id);
			//TODO : Add death gif later
		}
	}

	return GameFactory;	

}]);