app.controller('userRequestController', ['$scope', '$http', 'userRequest', function ($scope, $http, userRequest) {

    $("#analistButton").tooltip();
    $scope.requestList;

    function loadList() {
        userRequest.getRequestList().then(function (response) {
            $scope.requestList = response.data;
        });
    }

    $scope.acceptRequest = function (username) {
        userRequest.acceptAnalistRequest(username[0][0]).then(function (response) {
            loadList();
        });
    };

    $scope.rejectRequest = function (username) {
        userRequest.rejectAnalistRequest(username[0][0]).then(function () {
            loadList();
        });
    };

    $scope.sendAnalistRequest = function () {
        userRequest.sendAnalistRequest().then(function (response) {
            if (response.data == 'ok') {
                toastr.success("Se ha enviado su solicitud");
            }
        });
    }
    loadList();

}]);

