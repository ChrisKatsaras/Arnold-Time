angular.module('Game.factories')
.factory('TankFactory' ,['BulletFactory', function(BulletFactory){
	
	var clickDisabled = false;
	var rot;
	keyboardJS.bind('a', function(e) {
  		console.log('a is pressed');
	});
	keyboardJS.bind('w', function(e) {
  		console.log('w is pressed');
	});
	keyboardJS.bind('s', function(e) {
  		console.log('s is pressed');
	});
	keyboardJS.bind('d', function(e) {
  		console.log('d is pressed');
	});
	var TankFactory = function (id, local, x, y, hp, socket) {
		var div = document.querySelector("#field");
		var dimensions = div.getBoundingClientRect();
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


	TankFactory.prototype = { 

		draw : function(){
			var div = angular.element('<div id="'+this.id+'"class="tank tank1"><div id="holder-'+this.id+'" class="point"></div><div id="shield'+this.id+'" class="shield"></div></div>');
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
		    rot = rot || 0;
		    aR = rot % 6.28319;
		    if ( aR < 0 ) { aR += 6.28319; }
		    if ( aR < 3.14159 && (this.angle > (aR + 3.14159)) ) { rot -= 6.28319; }
		    if ( aR >= 3.14159 && (this.angle <= (aR - 3.14159)) ) { rot += 6.28319; }
		    rot += (this.angle - aR);
			angular.element(document.querySelector('#'+this.id)).css('transform','translate3d('+this.x+'px,'+this.y+'px,0px) rotate('+rot+'rad)');
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

			$(document).keypress( function(e) {
			var k = e.keyCode || e.which;
			switch(k){
				case 119: //W
					t.direction.up = true;
					break;
				case 100: //D
					t.direction.right = true;
					break;
				case 115: //S
					t.direction.down = true;
					break;
				case 97: //A
					t.direction.left = true;
					break;
				case 32:
					t.shield = true;
					break;
			}
			}).keyup( function(e) {
				var k = e.keyCode || e.which;
				switch(k){
					case 87: //W
						t.direction.up = false;
						break;
					case 68: //D
						t.direction.right = false;
						break;
					case 83: //S
						t.direction.down = false;
						break;
					case 65: //A
						t.direction.left = false;
						break;
					case 32:
						t.shield = false;
					break;
				}
			}) .mousemove( function(e) {
				var div = document.querySelector("#"+t.id);
				//If the soilder isn't dead
				if(div != null) {
					var dimensions = div.getBoundingClientRect();
					t.mx = dimensions.left + dimensions.width / 2;
					t.my = dimensions.top + dimensions.height / 2;
					t.changeAngle();
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
			var moveX = 0;
			var moveY = 0;

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

			moveX *= 5;
			moveY *= 5;
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

		changeAngle : function () {
			this.angle = Math.atan2(event.clientY - this.my, event.clientX - this.mx) + 1.5378;
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
			this.socket.emit('shoot', bullet);
		}
	}
	

	return TankFactory;	

}]);