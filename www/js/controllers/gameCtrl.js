angular.module('Game.controllers')
.controller('GameCtrl', ['$location','$scope','TankFactory', function($location,$scope,TankFactory) {

    var game = this;
    var socket = io.connect();

    TankFactory.createGame(socket);

    game.joinGame = function(name) {
        socket.emit('joinGame', {id: name});
    }

}]);