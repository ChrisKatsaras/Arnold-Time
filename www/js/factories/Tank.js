angular.module('Game.factories')
.factory('TankFactory', function(){
	
	var TankFactory = function (id, x, y, hp) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.hp = hp;
		this.draw();
	}


	TankFactory.prototype = { 

		draw : function(){
			var div = angular.element('<div id="'+this.id+'"class="tank tank1"></div>');
			this.body = angular.element(document).find('body').eq(0);
			this.body.append(div);
			this.person = angular.element(document.querySelector('#'+this.id));
			//console.log(this.person);
			

			this.refresh();

		},
		
		refresh : function () {
			//this.person.css('left', this.x - 30 + 'px');
			//this.person.css('top', );
			console.log("X:",this.x," Y:",this.y,this.id);
			angular.element(document.querySelector('#'+this.id)).css('top',this.y - 40 + 'px');
			
			angular.element(document.querySelector('#'+this.id)).css('left',this.x - 40 + 'px');
		}
	}
	

	return TankFactory;	

});