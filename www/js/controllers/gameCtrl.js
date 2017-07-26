angular.module('Game.controllers')
.controller('GameCtrl', ['$location','$scope', function($location,$scope) {

    var game = this;
    var socket = io.connect();

    game.joinGame = function(name) {
        console.log(name);
        socket.emit('joinGame', {id: name});
    }

}]);