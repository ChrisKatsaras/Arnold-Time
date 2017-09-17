angular.module('Game.factories')
.factory('GameFactory' ,['SoldierFactory', 'BulletFactory',function(SoldierFactory, BulletFactory) {
	
	var GameFactory = function (width, height, socket) {
		this.soldiers = [];
		this.width = width;
		this.height = height
		this.socket = socket;
		angular.element(document.querySelector('#field')).css('height','500px');
		angular.element(document.querySelector('#field')).css('width','1100px');
		var loop = this;

		setInterval(function() {
			loop.gameLoop();
		}, 100);
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
			//Send soldier data
			var t = {
				id: this.local.id,
				x: this.local.x,
				y: this.local.y,
				angle: this.local.angle,
				shield: this.local.shield
			};
			gameData.soldier = t;
			this.socket.emit('sync', gameData);	
		},

		receiveData : function(serverData) {
			
			var game = this;
			serverData.soldiers.forEach( function(serverSoldier) {
				if(game.local !== undefined && serverSoldier.id == game.local.id) {
					game.local.hp = serverSoldier.hp;
					game.local.shieldHP = serverSoldier.shieldHP;
					if(game.local.hp <= 0) {
						game.killSoldier(game.local);
						this.local = {};
						console.log("You dead");
						game.socket.emit('localDead');
					}
				}	
				var found = false;
				game.soldiers.forEach( function(clientSoldier) {
					if(clientSoldier.id == serverSoldier.id) {
						clientSoldier.x = serverSoldier.x;
						clientSoldier.y = serverSoldier.y;
						clientSoldier.angle = serverSoldier.angle;
						clientSoldier.hp = serverSoldier.hp;
						clientSoldier.shield = serverSoldier.shield;
						clientSoldier.shieldHP = serverSoldier.shieldHP;
						if(clientSoldier.hp <= 0){
							game.killSoldier(clientSoldier);
						}

						clientSoldier.refresh();
						found = true;
					}
				});

				if(!found && (game.local == undefined || serverSoldier.id != game.local.id)) {

					game.addSoldier({id : serverSoldier.id, local : false, x: serverSoldier.x, y: serverSoldier.y, hp: serverSoldier.hp});
				}
			});
		},

		updateBullets : function (bullets) {
			bullets.forEach( function(bullet) {
				if($("#bullet" + bullet.bulletID).length == 0) {
  					var newBullet = new BulletFactory(bullet.userID, bullet.bulletID, bullet.x, bullet.y, bullet.alpha);
				}
			
			});
			var ids = $("div[id^='bullet']").map(function() {
    			return this.id;
			}).get();
			test = bullets;
			ids.forEach( function(bullet) {
				let obj = test.find(o => ("bullet"+o.bulletID) === bullet);
				if(obj) {
					angular.element(document.querySelector('#bullet'+obj.bulletID)).css('transform','translate3d('+(obj.x-6)+'px,'+(obj.y-10)+'px,0px) rotate('+obj.alpha+'rad)');
					//Do destroy stuff here
					
				} else {
					$('#'+bullet).remove();
				}
				
			});

		},

		addSoldier : function(soldierData) {
			var soldier = new SoldierFactory(soldierData.id, soldierData.local, soldierData.x, soldierData.y, soldierData.hp, this.socket);
			if(soldier.local) {
				this.local = soldier;
			} else {
				this.soldiers.push(soldier);
			}
		},

		removeSoldier: function(username) {
			this.soldiers = this.soldiers.filter(function(t) {
				return t.id != username
			});
			$('#' + username).remove();
			$('#health-bar' + username).remove();
			$('#shield-bar'+ username).remove();
			$('#name'+ username).remove();
		},

		killSoldier: function(soldier) {
			soldier.dead = true;
			this.removeSoldier (soldier.id);
			//TODO : Add death gif later
		}
	}

	return GameFactory;	

}]);