angular.module('Game.factories')
.factory('TankFactory', function(){
	
	var TankFactory = function (id, x, y, hp) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.hp = hp;
	}
	

	return TankFactory;	

});