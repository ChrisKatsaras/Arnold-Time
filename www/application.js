var express = require('express');
console.log("\nInitializing application...\n");
//register our app as an express application
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//set the root directory of the project, required for res.sendFile.
app.use('/', express.static(__dirname + '/'));


console.log("\nInitilization complete.\n");

io.on('connection', function(socket) {
	console.log("A user has connected");

	socket.on('joinGame', function(test) {
		console.log("Wat");
	})
});

var GameServer = function () {
	console.log("Starting the game server");
	this.tanks = [];
	this.balls = [];
	this. lastBallId = 0;
	
}

var game = new GameServer();



//our app is now fully initialized, listen on port 3000 and await a request from the client.
http.listen(8082, function() {
  console.log("Now listening on 8082.");
});
