angular.module('Game.controllers')
.controller('ToastCtrl', ['$mdToast', '$scope', function($mdToast, $scope) {
    var toast = this;

    toast.closeToast = function() {
        $mdToast.cancel();
    }
    
}]);