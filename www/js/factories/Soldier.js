angular.module('Game.factories')
.factory('SoldierFactory' ,['BulletFactory', function(BulletFactory){
	
	var clickDisabled = false;
	var moveX;
	var moveY;
	var SoldierFactory = function (id, local, x, y, hp, socket) {
		var div = document.querySelector("#field");
		var dimensions = div.getBoundingClientRect();
		var rot;
		this.id = id;
		this.x = x;
		this.y = y;
		this.mouseX = null;
		this.mouseY = null;
		this.angle = Math.floor(Math.random() * (6.28319 - 0));
		this.hp = hp;
		this.local = local;
		this.direction = {
			up: false,
			down: false,
			left: false,
			right: false
		}
		this.shield = false;
		this.shieldHP = 100;
		this.dead = false;
		this.socket = socket;
		this.draw();
	}


	SoldierFactory.prototype = { 

		draw : function() {
			var div = angular.element('<div id="'+this.id+'"class="soldier soldier1"><div id="holder-'+this.id+'" class="point"></div><div id="shield'+this.id+'" class="shield"></div></div>');
			var healthbar = angular.element('<div id="health-bar'+this.id+'"class="health-bar"><div id="health-bar-glass'+this.id+'" class="health-bar-glass"><div id="health-bar-fluid'+this.id+'" class="health-bar-fluid"></div></div></div>');
			var shieldbar = angular.element('<div id="shield-bar'+this.id+'"class="health-bar"><div id="shield-bar-glass'+this.id+'" class="health-bar-glass"><div id="shield-bar-fluid'+this.id+'" class="shield-bar-fluid"></div></div></div>');
			var name = angular.element('<div id="name'+this.id+'" class="nametag">'+this.id+'</div>');
			this.body = angular.element(document.querySelector('#field'))
			this.body.append(div);
			this.body.append(healthbar);
			this.body.append(shieldbar);
			this.body.append(name);
			this.placeholder = angular.element(document.querySelector('#holder-'+this.id)).css('bottom','auto');
			this.placeholder = angular.element(document.querySelector('#holder-'+this.id)).css('top','5px');
			this.placeholder = angular.element(document.querySelector('#holder-'+this.id)).css('left','auto');
			this.placeholder = angular.element(document.querySelector('#holder-'+this.id)).css('right','17px');
			this.refresh();

			if(this.local) {
				this.registerControls();
			}
		},
		
		refresh : function () {
			var aR;
		    this.rot = this.rot || 0;
		    aR = this.rot % 6.28319;
		    if ( aR < 0 ) { 
		    	aR += 6.28319; 
		    }
		    if ( aR < 3.14159 && (this.angle > (aR + 3.14159)) ) { 
		    	this.rot -= 6.28319; 
		    }
		    if ( aR >= 3.14159 && (this.angle <= (aR - 3.14159)) ) { 
		    	this.rot += 6.28319; 
		    }
		    this.rot += (this.angle - aR);
			angular.element(document.querySelector('#'+this.id)).css('transform','translate3d('+this.x+'px,'+this.y+'px,0px) rotate('+this.rot+'rad)');
			angular.element(document.querySelector('#'+this.id)).css('transform','translate3d('+this.x+'px,'+this.y+'px,0px) rotate('+this.rot+'rad)');
			angular.element(document.querySelector('#health-bar'+this.id)).css('transform','translate3d('+this.x+'px,'+this.y+'px,0px)');
			angular.element(document.querySelector('#health-bar-fluid'+this.id)).css('width',this.hp+'%');
			angular.element(document.querySelector('#shield-bar'+this.id)).css('transform','translate3d('+this.x+'px,'+(this.y+6)+'px,0px)');
			angular.element(document.querySelector('#shield-bar-fluid'+this.id)).css('width',this.shieldHP+'%');
			angular.element(document.querySelector('#name'+this.id)).css('transform','translate3d('+this.x+'px,'+(this.y-15)+'px,0px)');
			angular.element(document.querySelector('#shield'+this.id)).css('transform','translate3d(-30px,-15px,0px)');
			
			if(this.shield && this.shieldHP > 1) {
				$("#shield"+this.id).show();
			} else {
				$("#shield"+this.id).hide();
			}
		},

		registerControls : function () {
			var t = this;
			keyboardJS.bind('w', function(e) {
			  t.direction.up = true;
			}, function(e) {
			  t.direction.up = false;
			});
			keyboardJS.bind('a', function(e) {
			  t.direction.left = true;
			}, function(e) {
			  t.direction.left = false;
			});
			keyboardJS.bind('s', function(e) {
			  t.direction.down = true;
			}, function(e) {
			  t.direction.down = false;
			});
			keyboardJS.bind('d', function(e) {
			  t.direction.right = true;
			}, function(e) {
			  t.direction.right = false;
			});
			keyboardJS.bind('space', function(e) {
			  t.shield = true;
			}, function(e) {
			  t.shield = false;
			});

			$('#field').mousemove( function(e) {
				var div = document.querySelector("#"+t.id);
				//If the soldier isn't dead
				if(div != null) {
					var dimensions = div.getBoundingClientRect();
					t.mx = dimensions.left + dimensions.width / 2;
					t.my = dimensions.top + dimensions.height / 2;
					t.changeAngle(e);
				}
				
			}) .click( function() {
				var div = document.querySelector("#"+t.id);
				if(!clickDisabled && div != null) {
					t.shoot();
					clickDisabled = true;
					setTimeout(function() {
						clickDisabled = false;
					}, 500);
				}
			})
		},

		move: function () {
			moveX = 0;
			moveY = 0;

			if(this.dead) {
				return;
			}

			if(this.direction.up) {
				moveY = -1;
			}
			if(this.direction.down) {
				moveY = 1;
			}
			if(this.direction.left) {
				moveX = -1;
			}
			if(this.direction.right) {
				moveX = 1;
			} 

			moveX *= 13;
			moveY *= 13;
			var div = document.querySelector("#field");
			var dimensions = div.getBoundingClientRect();
			if((this.x + moveX > 0) && (this.x + moveX < dimensions.width - 88)) {
				this.x += moveX;
			}

			if((this.y+ moveY > 0) && (this.y + moveY < dimensions.height - 121)) {
				this.y += moveY;
			}
			
			this.refresh();
		},

		changeAngle : function (e) {
			this.angle = Math.atan2(e.clientY - this.my, e.clientX - this.mx) + 1.5378;
		},

		shoot : function () {

			var div2 = document.querySelector("#holder-"+this.id);
			var div = div2.getBoundingClientRect();
			var parent = document.querySelector("#field");
			var parentDiv = parent.getBoundingClientRect();
		    relativePos = {};
			relativePos.top = div.top - parentDiv.top;
			relativePos.right = div.right - parentDiv.left;
			var bullet = {};
			bullet.alpha = this.angle;
			bullet.username = this.id;
			bullet.x = relativePos.right;
			bullet.y = relativePos.top;
			bullet.x += moveX;
			bullet.y += moveY;
			this.socket.emit('shoot', bullet);
		}
	}
	
	return SoldierFactory;	

}]);