app.controller('userRequestController', ['$scope', '$http', 'userRequest', function ($scope, $http, userRequest) {

    /* Standar User */
    $("#analistButton").tooltip();

    $scope.sendAnalistRequest = function () {
        userRequest.sendAnalistRequest().then(function (response) {
            if (response.data == 'ok') {
                toastr.success("Se ha enviado su solicitud");
            }
        });
    }

    $scope.requestList;
    $scope.allowedRequestList;

    function loadList() {
        userRequest.getRequestList().then(function (response) {
            $scope.requestList = response.data;
        });
        userRequest.getAllowedRequestList().then(function (response) {
            $scope.allowedRequestList = response.data;
        })
    }

    $scope.acceptRequest = function (username) {
        userRequest.acceptAnalistRequest(username[0][0]).then(function (response) {
            response.data == "ok" ? toastr.success("Se ha aceptado el permiso") : toastr.error("Ha ocurrido un error");
            loadList();
        });
    };

    $scope.rejectRequest = function (username) {
        userRequest.rejectAnalistRequest(username[0][0]).then(function (response) {
            response.data == "ok" ? toastr.success("Se ha rechazado el permiso") : toastr.error("Ha ocurrido un error");
            loadList();
        });
    };

    $scope.removePermission = function (username) {
        userRequest.removePermission(username[0][0]).then(function (response) {
            response.data == "success" ? toastr.success("Se ha eliminado el permiso") : toastr.error("Ha ocurrido un error");
            loadList();
        })
    }
    loadList();

}]);

