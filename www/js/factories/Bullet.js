angular.module('Game.factories')
.factory('BulletFactory' ,['$rootScope', function($rootScope){
	
	var BulletFactory = function (userID, bulletID, x, y, alpha) {
		this.userID = userID;
		this.bulletID = bulletID;
		this.angle = alpha;
		this.x = x;
		this.y = y;

		this.draw();
	}


	BulletFactory.prototype = { 
		draw: function () {
			var div = angular.element('<div id="'+this.bulletID+'"class="bullet"></div>');
			this.body = angular.element(document.querySelector('#field'))
			div.css('transform','translate3d('+this.x+'px,'+this.y+'px,0px) rotate('+this.angle+'rad)');
			this.body.append(div);

			//this.person = angular.element(document.querySelector('#'+this.bu));
		}
	}

	return BulletFactory;	

}]);