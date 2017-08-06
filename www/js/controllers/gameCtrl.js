angular.module('Game.controllers')
.controller('GameCtrl', ['$location', '$mdDialog','$mdPanel','$scope','GameFactory', function($location, $mdDialog,$mdPanel,$scope,GameFactory) {
    this._mdPanel = $mdPanel;
    var client = this;
    var socket = io.connect();
    var game;
    var username = null;
    game = new GameFactory(1000, 500, socket);
   	client.init = function(ev) {
        $mdDialog.show({
            templateUrl: 'templates/modal.html',
            parent: angular.element(document.body),
            targetEvent: event,
            controller: () => this,
            controllerAs: 'game',
            clickOutsideToClose: false,
            fullscreen: true
        });
   	}


    client.joinGame = function(name) {
        username = name;
        socket.emit('joinGame', {id: name});
        //var audio = new Audio('audio/sob.wav');//LOL
        //audio.play();
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
        if (performance.navigation.type == 1) {
            console.info( "This page is reloaded" );
        } else {
            console.info( "This page is not reloaded");
        }
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
    $(window).on('beforeunload', function(){
        if(username != null) {
            socket.emit('leaveGame', username);
        }
        
    });

    if (window.performance) {
      console.info("window.performance work's fine on this browser");
    }


}]);