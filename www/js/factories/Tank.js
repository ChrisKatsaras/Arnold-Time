angular.module('Game.factories')
.factory('TankFactory' ,['$rootScope', function($rootScope){
	
	var TankFactory = function (id, x, y, hp) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.hp = hp;
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
			var div = angular.element('<div id="'+this.id+'"class="tank tank1"></div>');
			this.body = angular.element(document).find('body').eq(0);
			this.body.append(div);
			this.person = angular.element(document.querySelector('#'+this.id));
			//console.log(this.person);
			
			this.registerControls();
			this.refresh();

		},
		
		refresh : function () {
			//this.person.css('left', this.x - 30 + 'px');
			//this.person.css('top', );
			console.log("X:",this.x," Y:",this.y,this.id);

			angular.element(document.querySelector('#'+this.id)).css('top',this.y - 40 + 'px');
			
			angular.element(document.querySelector('#'+this.id)).css('left',this.x - 40 + 'px');
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
		}
	}
	

	return TankFactory;	

}]);