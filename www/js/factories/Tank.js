angular.module('Game.factories')
.factory('TankFactory' ,['$rootScope', function($rootScope){
	
	var TankFactory = function (id, local, x, y, hp) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.mouseX = null;
		this.mouseY = null;
		this.angle = Math.floor(Math.random() * (360 - 0)) + 0;
		this.hp = hp;
		this.local = local;
		this.direction = {
			up: false,
			down: false,
			left: false,
			right: false
		}
		this.draw();
	}


	TankFactory.prototype = { 

		draw : function(){
			var div = angular.element('<div id="'+this.id+'"class="tank tank1"><div class="feet"></div></div>');
			this.body = angular.element(document).find('body').eq(0);
			this.body.append(div);
			this.person = angular.element(document.querySelector('#'+this.id));
			//console.log(this.person);
			
			this.registerControls();
			this.refresh();

		},
		
		refresh : function () {
			angular.element(document.querySelector('#'+this.id)).css('transform','translate3d('+this.x+'px,'+this.y+'px,0px) rotate('+this.angle+'rad)');
		},

		registerControls : function () {
			var t = this;
			
			$(document).keypress( function(e){
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
			}
			console.log(k);
			}).keyup( function(e){
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
				}
			}) .mousemove( function(e){ //Detect mouse for aiming
				//Using jQuery
				var div = document.querySelector("#"+t.id);
				var dimensions = div.getBoundingClientRect();

				t.mx = dimensions.left + dimensions.width / 2;
				t.my = dimensions.top + dimensions.height / 2;

				t.changeAngle();
			})
		},

		move: function () {
			var moveX = 0;
			var moveY = 0;

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

			this.y += moveY;
			this.x += moveX;
			this.refresh();
		},

		changeAngle : function () {
			this.angle = Math.atan2(event.clientY - this.my, event.clientX - this.mx);
		}
	}
	

	return TankFactory;	

}]);