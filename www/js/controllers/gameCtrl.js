angular.module('Game.controllers')
.controller('GameCtrl', ['$http', '$location', '$mdDialog', '$mdPanel', '$scope', '$timeout', 'GameFactory', function($http, $location, $mdDialog, $mdPanel, $scope, $timeout, GameFactory) {
    this._mdPanel = $mdPanel;
    var client = this;
    var socket = io.connect();
    var game;
    var username = null;
    var userToken = null;
    client.countdown = -1;
    client.inputName;
    client.errorMessage = null;
    game = new GameFactory(1000, 500, socket);


   	client.init = function(ev) {
        $mdDialog.show({
            templateUrl: 'templates/modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            controller: () => this,
            controllerAs: 'game',
            clickOutsideToClose: false,
            fullscreen: true
        });
   	}


    client.joinGame = function() {
        if(client.inputName.length <= 15 && client.countdown <= 0) {
            //client.errorMessage = null;
            new Fingerprint2().get(function(result, components){         
                $http.post('/login',{id: client.inputName, token: userToken, fp: result}).
                success(function(data) {
                    socket.emit('joinGame', {id: client.inputName, token: userToken});
                    client.countdown = -1;
                }).error(function(data, status) {
                    console.error("Error in posting to login", data, status);
                    if(client.countdown == -1 && status == 409) {
                        client.countdown = parseInt(data);
                        countdown();
                    } else if(status == 400) {
                        client.errorMessage = data;
                    }
                }) 
            }); 
            
        } else {
            if(client.inputName.length > 15) {
                client.errorMessage = "Name is too long!"
                //var audio = new Audio('audio/sob.wav');//LOL
                //audio.play(); 
            }
        }
    }

    var countdown = function() {
        $timeout(function() {
            client.countdown--;
            countdown();
        }, 1000);
    }

    /*Socket events*/
    socket.on('sync',function (gameServerData) {
    	game.receiveData(gameServerData);
    });

    socket.on('addTank',function (tank) {
    	game.addTank(tank)
    });

    socket.on('removeTank',function (username) {
        game.removeTank(username)
    });

    socket.on('joinedGame',function (status) {
        if(status) {
            $mdDialog.cancel();
        } else {
            var audio = new Audio('audio/dontdothat.mp3');//LOL
            audio.play();
        }
    });

    socket.on('userToken', function (token) {
        if(token) {
            userToken = token;
        }
    });

    socket.on('deadModal', function () {
        $mdDialog.show({
            templateUrl: 'templates/deadModal.html',
            parent: angular.element(document.body),
            targetEvent: event,
            controller: () => this,
            controllerAs: 'game',
            clickOutsideToClose: false,
            fullscreen: true
        });
    });

    socket.on('updateBullets', function (bullets) {
        game.updateBullets(bullets);
    });

    //XXX Just for testing
    /*socket.on('test',function (status) {
        //console.log("TEST!",status);
        var canvas = document.getElementById("c");
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;
        var ctx = canvas.getContext("2d");

        if(status[0] != null) {
            ctx.fillStyle = 'rgba(0,255,0,0.5)';
            ctx.beginPath();
            ctx.moveTo(status[0].pos.x, status[0].pos.y);
            status[0].calcPoints.forEach(function (p) {
              ctx.lineTo(status[0].pos.x + p.x, status[0].pos.y + p.y);
            })
            ctx.closePath();
            ctx.fill();
        }

        if(status[1] != null) {

            ctx.fillStyle = 'rgba(0,144,0,0.5)';
            ctx.beginPath();
            ctx.moveTo(status[1].pos.x, status[1].pos.y);
            status[1].calcPoints.forEach(function (p) {
              ctx.lineTo(status[1].pos.x + p.x, status[1].pos.y + p.y);
            })
            ctx.closePath();
            ctx.fill();
        8}
        if(status[2] != null) {
            console.log("we here");
             ctx.fillStyle = 'rgba(22,144,0,0.5)';
             ctx.beginPath();
             ctx.arc(status[2].pos.x,status[2].pos.y,75,0,1.5*Math.PI);
             ctx.stroke;
             ctx.fill();
        }

    });*/

    //User leaves the game
    //$(window).on('beforeunload', function(){
      //  if(username != null) {
        //    socket.emit('leaveGame', username);
        //}
        
    //});

}]);