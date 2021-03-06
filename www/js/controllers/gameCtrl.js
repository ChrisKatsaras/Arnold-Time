angular.module('Game.controllers')
.controller('GameCtrl', ['$http', '$location', '$mdDialog', '$mdPanel', '$mdToast', '$scope', '$timeout', 'GameFactory', function($http, $location, $mdDialog, $mdPanel, $mdToast, $scope, $timeout, GameFactory) {
    this._mdPanel = $mdPanel;
    var client = this;
    var socket = io.connect();
    //var socket = new io("ws://arnoldtime.com:3000/");
    var game;
    var username = null;
    var userToken = null;
    var userRegex = new RegExp(/^[a-zA-Z-]+$/);
    new Clipboard('.btn');
    var loadingScreen = pleaseWait({
      logo: "img/ArnoldTime.png",
      backgroundColor: '#ffffff',
      loadingHtml: "<div class='sk-folding-cube'><div class='sk-cube1 sk-cube'></div><div class='sk-cube2 sk-cube'></div><div class='sk-cube4 sk-cube'></div><div class='sk-cube3 sk-cube'></div></div>"
    });
    client.countdown = -1;
    client.inputName;
    client.errorMessage = null;
    client.debug = false;
    game = new GameFactory(1000, 500, socket);

   	client.init = function(ev) {
        setTimeout(function() { 
            loadingScreen.finish();
        }, 2500);

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

        if(client.inputName.length <= 15 && client.countdown <= 0 && client.inputName != "field" && userRegex.test(client.inputName)) {
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
                    } else if(status == 400 || status == 403) {
                        client.errorMessage = data;
                    }
                }) 
            }); 
            
        } else {
            if(client.inputName.length > 15) {
                client.errorMessage = "Username is too long";
            } else if(client.inputName == "field" || !userRegex.test(client.inputName)) {
                client.errorMessage = "Invalid username";
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

    socket.on('addSoldier',function (soldier) {
    	game.addSoldier(soldier)
    });

    socket.on('removeSoldier',function (username) {
        game.removeSoldier(username)
    });

    socket.on('joinedGame',function (status) {
        $mdDialog.cancel();
    });

    socket.on('userToken', function (token) {
        if(token) {
            userToken = token;
        }
    });

    socket.on('alone', function (status) {
        if(status) {
            $mdToast.show({
              hideDelay   : 0,
              position    : 'top right',
              parent: angular.element(document.body),
              controller: 'ToastCtrl',
              controllerAs: 'toast',
              templateUrl : 'templates/inviteFriends.html'
            });
        } else {
             $mdToast.cancel();
        }
        
    });

    socket.on('deadModal', function (ev) {
        $mdDialog.show({
            templateUrl: 'templates/deadModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            controller: () => this,
            controllerAs: 'game',
            clickOutsideToClose: false,
            fullscreen: true
        });
    });

    socket.on('updateBullets', function (bullets) {
        game.updateBullets(bullets);
    });

    socket.on('test',function (status) {
        client.debug = true;
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
             ctx.fillStyle = 'rgba(22,144,0,0.5)';
             ctx.beginPath();
             ctx.arc(status[2].pos.x,status[2].pos.y,75,0,1.5*Math.PI);
             ctx.stroke;
             ctx.fill();
        }
    });
}]);