var fs = require('fs');
var express = require('express');
console.log("\nInitializing application...\n");
//register our app as an express application
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SAT = require('sat');
var Fingerprint = require('express-fingerprint');
var redis = require('redis');
var client = redis.createClient();
var chalk = require('chalk');
var bluebird = require("bluebird");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

client.on('connect', function() {
    console.log(chalk.green('Redis connected'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
})); 

app.use(Fingerprint({
    parameters:[
        // Defaults 
        Fingerprint.useragent,
        Fingerprint.acceptHeaders,
        Fingerprint.geoip,
    ]
}));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/');
});

app.post('/login', function (req, res) {
	var status;

	client.ttl(req.fingerprint.hash, function(err, reply) {
   		if(reply == -1) {
   			console.log(chalk.red("You already exist"));
   			res.sendStatus(400);
   			
   		} else if(reply >= 0) {
   			console.log(chalk.red("You are being timed", reply));
   			res.status(409).send(reply.toString());
   		} else {
   			console.log(chalk.green("You're a new player"));
   			client.get(req.body.token, function(err, reply) {
		   		if(reply) {
		   			var object = {
		   				socketID : reply,
		   				fingerprint : req.fingerprint.hash
		   			}
		   			client.set(req.body.token, JSON.stringify(object), function(err, reply) {});
		   			client.set(req.fingerprint.hash, reply, function(err, reply) {});
		   			res.sendStatus(200);
		   		} else {
		   			res.sendStatus(400);
		   		}
			});
   		}
	});
});

//Putting this before the app.get results in the app.get not being run
app.use('/', express.static(__dirname + '/'));

console.log("\nInitilization complete.\n");


var GameServer = function () {
	console.log("Starting the game server");
	this.tanks = [];
	this.bullets = [];
	this.bulletID = 0; //Keeps track of bullets
	this.canvasBullet; //XXX Just for testing
	this.canvasTank; //XXX Just for testing
	this.canvasShield; //XXX Just for testing
}

GameServer.prototype = {
	addTank: function(tank) {
		this.tanks.push(tank);
		//console.log(this.tanks);
	},

	addBullet : function(bullet) {
		this.bullets.push(bullet);
	},

	updateTanks : function(data){
		this.tanks.forEach(function (tank) {
			if(tank.id == data.id){
				tank.x = data.x;
				tank.y = data.y;
				tank.angle = data.angle;
				tank.shield = data.shield;
				if(tank.shield && tank.shieldHP >= 1) {
					tank.shieldHP -= 1;
				} else if(tank.shield && tank.shieldHP < 1) {
					tank.shieldHP = 0;
				} else if(tank.shield && tank.shieldHP < 1) {
					tank.shield = false;
				}
				else if (!tank.shield && tank.shieldHP < 100){
					tank.shieldHP += 0.1;
				}
				//console.log("The shield "+tank.shield+" the hp "+tank.shieldHP);
			}
		});
	},

	updateBullets : function () {
		var game = this;

		this.bullets.forEach(function (bullet) {
			game.bulletCollision(bullet);
			if(bullet.x < 0 || bullet.x > 1100 || bullet.y < 0 || bullet.y > 500) {
				bullet.outOfBounds = true;
			} else {
				bullet.move();
			}
		});
	},

	//Sat-JS library handles the collision detection for me due to the fact that rotated polygons can be tricky to calculate collision for
	bulletCollision : function(bullet) {
		var satBullet = new SAT.Box(new SAT.Vector(bullet.x,bullet.y), 20, 12).toPolygon();
		satBullet.rotate(bullet.alpha);
		satBullet.rotate(1.5738 * -1);
		//this.canvasBullet = satBullet; //XXX Just for testing
		var game = this;
		this.tanks.forEach(function (tank) {
			if(bullet.userID != tank.id) {
				var points = [];
				points.push(new SAT.Vector(-44,-60.5));
				points.push(new SAT.Vector(+44,-60.5));
				points.push(new SAT.Vector(+44,+60.5));
				points.push(new SAT.Vector(-44,+60.5));
				var satTank = new SAT.Polygon(new SAT.Vector(tank.x+44,tank.y+60.5),points);
				satTank.rotate(tank.angle);
				if(tank.shield) {
					var satShield = new SAT.Circle(new SAT.Vector((tank.x-30)+75,(tank.y-15)+75), 75);
					game.canvasShield = satShield;
					bullet.outOfBounds = SAT.testPolygonCircle(satBullet,satShield);
				} else {
					bullet.outOfBounds = SAT.testPolygonPolygon(satBullet,satTank);
					if(bullet.outOfBounds) {
						tank.hp -= 10;
					}	
				}

			 	//game.canvasTank = satTank; //XXX Just for testing
			}
		});
		
	},

	getData : function(){
		var gameData = {};
		gameData.tanks = this.tanks;
		gameData.bullets = this.bullets;
		return gameData;
	},
	checkID : function(id) {
		var flag = true;
		var regExp = new RegExp(/^[a-zA-Z-]+$/);

		if(id === "field" || !regExp.test(id)) {
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
	getNameBySocketID: function (socketID) {
		var game = this;
		var id;
		this.tanks.forEach(function (soilder) {
			if(soilder.socketID === socketID) {
				id = soilder.id;
			}
		});
		return id;
	},
	removeTank : function(username){
		//Remove tank object
		this.tanks = this.tanks.filter( function(t){return t.id != username} );
	}, 

	removeBullets : function() {
		this.bullets = this.bullets.filter(function(bullet) {
			return !bullet.outOfBounds;
		});
	},

	removeDeadSoilers : function() {
		this.tanks = this.tanks.filter(function(soilder) {
			return soilder.hp > 0;
		});
	}
}

var Bullet = function (userID, alpha, x, y) {
	this.userID = userID;
	this.bulletID = game.bulletID;
	game.bulletID++;
	this.alpha = alpha;
	this.outOfBounds = false;
	this.x = x;
	this.y = y;
}

Bullet.prototype = {

	move : function() {

		var speedX = 10 * Math.sin(this.alpha);
		var speedY = -10 * Math.cos(this.alpha);
		this.x += speedX;
		this.y += speedY;
	}

}

/*Socket events*/
io.on('connection', function(user) {
	console.log("A user has connected");
	var token;
	require('crypto').randomBytes(48, function(err, buffer) {
  		token = buffer.toString('hex');
  		client.set(token, user.id, function(err, reply) {
  			user.emit('userToken', token);
  		});
	});

	user.on('joinGame', function(data) {	
		if(game.checkID(data.id)) {
			console.log(data.id," is joining the game!");
			var initX = Math.floor(Math.random() * (800 - 10)) + 10;
	        var initY = Math.floor(Math.random() * (350 - 10)) + 10;
	       	user.emit('addTank', { id: data.id, local: true, x: initX, y: initY, hp: 100});
	       	user.broadcast.emit('addTank', { id: data.id, local: false, x: initX, y: initY, hp: 100});
	        game.addTank({id: data.id, x: initX, y: initY, hp: 100, shield : false, shieldHP: 100, socketID: user.id});
			user.emit('joinedGame', true);
		} else {
			user.emit('joinedGame', false);
		}
		
	})

	user.on('sync', function(data) {
		if(data.tank != undefined){
			game.updateTanks(data.tank);
		}

		game.updateBullets();
		//var test = [];
		///test.push(game.canvasBullet); //XXX Just for testing
		//test.push(game.canvasTank);//XXX Just for testing
		//test.push(game.canvasShield);
		//user.emit('test',test); //XXX Just for testing
		user.emit('sync', game.getData());
		user.broadcast.emit('sync', game.getData());
		game.removeBullets();
		game.removeDeadSoilers();
		
	})

	//user.on('leaveGame', function(username){
	//	console.log(username + ' has left the game');
	//	game.removeTank(username);
	//	user.broadcast.emit('removeTank', username);
	//});

	user.on('disconnect', function() {
		var username = game.getNameBySocketID(user.id);
		var timeout = false;
		console.log("disconnect", username);
		console.log(username + ' has left the game');
		game.removeTank(username);
		user.broadcast.emit('removeTank', username);
		console.log("The token", token);
		return client.getAsync(token).then(function(res) {
		    try {
		        userObject = JSON.parse(res);
		        timeout = true;
		    } catch(e) {
		    	console.log(chalk.red("JSON parsing error on disconnect"));
		    }

		    if(timeout) {
		    	console.log("User entered the game and is now leaving");
		    	client.expire(userObject.fingerprint, 10);
		    } else {
		    	 console.log("User never entered the game")
		    }
		});
	});

	user.on('shoot', function(bullet) {
		game.tanks.forEach(function (tank) { 
			if(tank.id == bullet.username && !tank.shield) {
				var bulletObj = new Bullet(bullet.username, bullet.alpha, bullet.x, bullet.y);
				game.addBullet(bulletObj);
			}
		});
	});

	user.on('localDead', function() {
		user.emit('deadModal');
	});
});

var game = new GameServer();

//our app is now fully initialized, listen on port 3000 and await a request from the client.
http.listen(3000, function() {
  console.log("Now listening on 3000.");
});
