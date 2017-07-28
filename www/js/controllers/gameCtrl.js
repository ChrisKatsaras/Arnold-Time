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

    socket.on('joinedGame',function (username) {
        $mdDialog.cancel();
        console.log("unique");
    });

    //User leaves the game
    $(window).on('beforeunload', function(){
        if(username != null) {
            socket.emit('leaveGame', username);
        }
        
    });

}]);