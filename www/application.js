var express = require('express');
console.log("\nInitializing application...\n");
//register our app as an express application
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//set the root directory of the project, required for res.sendFile.
app.use('/', express.static(__dirname + '/'));


console.log("\nInitilization complete.\n");


var GameServer = function () {
	console.log("Starting the game server");
	this.tanks = [];
	this.balls = [];
	this.lastBallId = 0;
	
}

GameServer.prototype = {
	addTank: function(tank) {
		this.tanks.push(tank);
		console.log(this.tanks);
	},

	updateTanks: function(data){
		this.tanks.forEach( function(tank){
			if(tank.id == data.id){
				tank.x = data.x;
				tank.y = data.y;
				tank.angle = data.angle;
			}
		});
	},
	getData: function(){
		var gameData = {};
		gameData.tanks = this.tanks;
		return gameData;
	},
	checkID : function(id) {
		var flag = true;
		
		if(id === "field") {
			flag = false;
		}
		this.tanks.forEach( function(tank){
			console.log(id);
			if(tank.id === id) {
				console.log("User already exists");
				flag = false;
			}
		});
		return flag;
	},
	removeTank: function(username){
		//Remove tank object
		this.tanks = this.tanks.filter( function(t){return t.id != username} );
	}
}

var game = new GameServer();

/*Socket events*/
io.on('connection', function(user) {
	console.log("A user has connected");
	
	user.on('joinGame', function(data) {
		if(game.checkID(data.id)) {
			console.log(data.id," is joining the game!");
			var initX = Math.floor(Math.random() * (900 - 40)) + 40;
	        var initY = Math.floor(Math.random() * (500 - 40)) + 40;
	       	user.emit('addTank', { id: data.id, local: true, x: initX, y: initY, hp: 100 });
	       	user.broadcast.emit('addTank', { id: data.id, local: false, x: initX, y: initY, hp: 100 });
	        game.addTank({id: data.id, x: initX, y: initY, hp: 100});
			user.emit('joinedGame', true);
		} else {
			user.emit('joinedGame', false);
		}
		
	})

	user.on('sync', function(data) {
		if(data.tank != undefined){
			game.updateTanks(data.tank);
		}

		user.emit('sync', game.getData());
		user.broadcast.emit('sync', game.getData());
	})

	user.on('leaveGame', function(username){
		console.log(username + ' has left the game');
		game.removeTank(username);
		user.broadcast.emit('removeTank', username);
	});
});

//our app is now fully initialized, listen on port 3000 and await a request from the client.
http.listen(8082, function() {
  console.log("Now listening on 8082.");
});
