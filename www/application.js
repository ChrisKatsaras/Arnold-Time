var fs = require('fs');
var path = require("path");
var express = require('express');
console.log("\nInitializing application...\n");
var app = express(); //Registers the app as an express application
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SAT = require('sat'); //Used for collision detection (Separating axis theorem)
var redis = require('redis');
var client = redis.createClient(); //Creates Redis instance
var chalk = require('chalk'); //For coloured console output
var bluebird = require("bluebird"); //Used for promises with Redis requests
var profanity = require( 'profanity-util', { substring: "lite" } );
var UAParser = require('ua-parser-js');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

client.on('connect', function() {
    console.log(chalk.green('Redis connected'));
});

//Included so we can retrieve data from HTTP requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
})); 

//Putting this before the app.get results in the app.get not being run
app.use('/', express.static(__dirname + '/'));

app.get('*',function(req,res){
  res.sendFile(path.join(__dirname+'/'));
});

//Login endpoint
app.post('/login', function (req, res) {
	
	var parser = new UAParser();
  	var ua = req.headers['user-agent'];
  	var browserName = parser.setUA(ua).getBrowser().name;
  	var fullBrowserVersion = parser.setUA(ua).getBrowser().version;
  	var browserVersion = fullBrowserVersion.split(".",1).toString();
  	var browserVersionNumber = Number(browserVersion);
    //If the username exceeds the maximum length
	if(req.body.id.length > 15) {
		res.sendStatus(400);
	} else if(profanity.check(req.body.id).length != 0) {
		res.status(400).send("No swearing, please");
	} else if((browserName == 'Firefox' && browserVersion <= 24) || (browserName == 'Chrome' && browserVersion <= 29) || (browserName == 'Safari' && browserVersion <= 5)) {
    	res.status(403).send("Arnold Time requires "+browserName+" to be updated first");
    } else if(browserName != 'Firefox' && browserName != 'Chrome' && browserName != 'Safari') {
    	res.status(403).send("Currently, Arnold Time does not support "+browserName);
    } else {
		client.ttl(req.body.fp, function(err, reply) {
	   		if(reply == -1) {
	   			console.log(chalk.red("You already exist"));
	   			res.status(400).send("You are already logged in");
	   			
	   		} else if(reply >= 0) {
	   			console.log(chalk.red("You are being timed", reply));
	   			res.status(409).send(reply.toString());
	   		} else {
	   			console.log(chalk.green("You're a new player"));
	   			client.get(req.body.token, function(err, reply) {
			   		if(reply) {
			   			var object = {
			   				socketID : reply,
			   				fingerprint : req.body.fp
			   			}
			   			client.set(req.body.token, JSON.stringify(object), function(err, reply) {});
			   			client.set(req.body.fp, reply, function(err, reply) {});
			   			res.sendStatus(200);
			   		} else {
			   			res.sendStatus(400);
			   		}
				});
	   		}
		});
	}
});

console.log("\nInitilization complete.\n");

var GameServer = function () {
	console.log("Starting the game server");
	this.soldiers = [];
	this.bullets = [];
	this.bulletID = 0; //Keeps track of bullets
	this.canvasBullet; //XXX Just for testing
	this.canvasSoldier; //XXX Just for testing
	this.canvasShield; //XXX Just for testing
}

GameServer.prototype = {
	addSoldier: function(soldier) {
		this.soldiers.push(soldier);
	},

	addBullet : function(bullet) {
		this.bullets.push(bullet);
	},

	updateSoldiers : function(data){
		this.soldiers.forEach(function (soldier) {
			if(soldier.id == data.id){
				soldier.x = data.x;
				soldier.y = data.y;
				soldier.angle = data.angle;
				soldier.shield = data.shield;
				if(soldier.shield && soldier.shieldHP >= 1) {
					soldier.shieldHP -= 1;
				} else if(soldier.shield && soldier.shieldHP < 1) {
					soldier.shieldHP = 0;
				} else if(soldier.shield && soldier.shieldHP < 1) {
					soldier.shield = false;
				}
				else if (!soldier.shield && soldier.shieldHP < 100){
					soldier.shieldHP += 0.1;
				}
			}
		});
	},

	moveBullets : function () {
		var game = this;
		this.bullets.forEach(function (bullet) {
			game.bulletCollision(bullet);
			if(bullet.x < 0 || bullet.x > 1100 || bullet.y < 0 || bullet.y > 500) {
				bullet.outOfBounds = true;
			} else if(!bullet.outOfBounds) {
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
		this.soldiers.forEach(function (soldier) {
			if(bullet.userID != soldier.id) {
				var points = [];
				points.push(new SAT.Vector(-44,-60.5));
				points.push(new SAT.Vector(+44,-60.5));
				points.push(new SAT.Vector(+44,+60.5));
				points.push(new SAT.Vector(-44,+60.5));
				var satSoldier = new SAT.Polygon(new SAT.Vector(soldier.x+44,soldier.y+60.5),points);
				satSoldier.rotate(soldier.angle);
				if(soldier.shield) {
					var satShield = new SAT.Circle(new SAT.Vector((soldier.x-30)+75,(soldier.y-15)+75), 75);
					game.canvasShield = satShield;
					bullet.outOfBounds = SAT.testPolygonCircle(satBullet,satShield);
				} else {
					bullet.outOfBounds = SAT.testPolygonPolygon(satBullet,satSoldier);
					if(bullet.outOfBounds) {
						soldier.hp -= 10;
					}	
				}

			 	//game.canvasSoldier= satSoldier; //XXX Just for testing
			}
		});
		
	},

	getData : function(){
		var gameData = {};
		gameData.soldiers = this.soldiers;
		gameData.bullets = this.bullets;
		return gameData;
	},

	checkID : function(id) {
		var flag = true;
		var regExp = new RegExp(/^[a-zA-Z-]+$/);

		if(id === "field" || !regExp.test(id)) {
			flag = false;
		}

		this.soldiers.forEach( function(soldier){
			console.log(id);
			if(soldier.id === id) {
				console.log("User already exists");
				flag = false;
			}
		});
		return flag;
	},

	getNameBySocketID: function (socketID) {
		var game = this;
		var id;
		this.soldiers.forEach(function (soldier) {
			if(soldier.socketID === socketID) {
				id = soldier.id;
			}
		});
		return id;
	},

	removeSoldier : function(username){
		//Remove soldier object
		this.soldiers = this.soldiers.filter( function(t){return t.id != username} );
	}, 

	removeBullets : function() {
		this.bullets = this.bullets.filter(function(bullet) {
			return !bullet.outOfBounds;
		});
	},

	removeDeadSoldiers : function() {
		this.soldiers = this.soldiers.filter(function(soldier) {
			return soldier.hp > 0;
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
		var speedX = 25 * Math.sin(this.alpha);
		var speedY = -25 * Math.cos(this.alpha);
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
	       	user.emit('addSoldier', { id: data.id, local: true, x: initX, y: initY, hp: 100});
	       	user.broadcast.emit('addSoldier', { id: data.id, local: false, x: initX, y: initY, hp: 100});
	        game.addSoldier({id: data.id, x: initX, y: initY, hp: 100, shield : false, shieldHP: 100, socketID: user.id});
			user.emit('joinedGame', true);

			if(game.soldiers.length == 1) {
				user.emit('alone', true);
			} else {
				user.emit('alone', false);
				user.broadcast.emit('alone', false);
			}
		} else {
			user.emit('joinedGame', false);
		}
		
	})

	user.on('sync', function(data) {
		if(data.soldier != undefined) {
			game.updateSoldiers(data.soldier);
		}
		//var test = [];
		///test.push(game.canvasBullet); //XXX Just for testing
		//test.push(game.canvasSoldier);//XXX Just for testing
		//test.push(game.canvasShield);
		//user.emit('test',test); //XXX Just for testing
		user.emit('sync', game.getData());
		user.broadcast.emit('sync', game.getData());
		//game.removeBullets();
		game.removeDeadSoldiers();
		
	})

	user.on('disconnect', function() {
		var username = game.getNameBySocketID(user.id);
		var timeout = false;
		console.log("disconnect", username);
		console.log(username + ' has left the game');
		game.removeSoldier(username);
		user.broadcast.emit('removeSoldier', username);
		if(game.soldiers.length == 1) {
			user.broadcast.emit('alone', true);
		} else {
			user.broadcast.emit('alone', false);
		}
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
		game.soldiers.forEach(function (soldier) { 
			if(soldier.id == bullet.username && !soldier.shield) {
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

//Interval to keep bullets updated. This needs to be done in a seperate loop as users cannot be relied on to updated movement, etc.
setInterval(function() {
	io.sockets.emit('updateBullets', game.bullets);
	game.moveBullets();
	game.removeBullets();
}, 100);

//our app is now fully initialized, listen on port 3000 and await a request from the client.
http.listen(3000, function() {
  console.log("Now listening on 3000.");
});
