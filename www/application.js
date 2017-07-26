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
	this. lastBallId = 0;
	
}

GameServer.prototype = {
	addTank: function(tank) {
		this.tanks.push(tank);
		console.log(this.tanks);
	}
}

var game = new GameServer();

/*Socket events*/
io.on('connection', function(user) {
	console.log("A user has connected");
	
	user.on('joinGame', function(data) {
		console.log(data.id," is joining the game!");
		var initX = Math.floor(Math.random() * (900 - 40)) + 40;
        var initY = Math.floor(Math.random() * (500 - 40)) + 40;
        //user.emit('addTank', {id: data.id, x: initX, y: initY, hp: 100});
       	user.emit('addTank', { id: data.id, x: initX, y: initY, hp: 100 });
        game.addTank({id: data.id, x: initX, y: initY, hp: 100});
	})

	user.on('sync', function(data) {
		console.log("Sync server")
		if(data.tank = undefined) {
			console.log('sync the tank');
		}
		user.emit('sync');
	})
});

//our app is now fully initialized, listen on port 3000 and await a request from the client.
http.listen(8082, function() {
  console.log("Now listening on 8082.");
});
