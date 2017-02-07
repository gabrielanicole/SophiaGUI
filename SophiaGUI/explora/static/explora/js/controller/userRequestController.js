app.controller('userRequestController', ['$scope', '$http', 'userRequest', function ($scope, $http, userRequest) {

    $("#analistButton").tooltip();
    $scope.requestList;

    userRequest.getRequestList().then(function (response) {
        $scope.requestList = response.data;
    });

    $scope.acceptRequest = function (username) {
        console.log(username[0][0]);
    };

    $scope.rejectRequest = function (username) {
        console.log(username[0][0]);
    };

    $scope.sendAnalistRequest = function () {
        userRequest.sendAnalistRequest().then(function (response) {
            if (response.data == 'ok') {
                toastr.success("Se ha enviado su solicitud");
            }
        });
    }

}]);

