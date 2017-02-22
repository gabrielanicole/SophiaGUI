app.controller('pressMediaController', ['$scope', '$http', function ($scope, $http) {

    $scope.press_source = [];
    $scope.pressMedia = {};
    $scope.selectedMedium;

    $scope.insertClicked = false;
    $scope.editClicked = false;
    $scope.selectedMediaId = "";

    $http({
        method: 'GET',
        url: '/pressmedia/getlist/',
    }).then(function successCallback(response) {
        $scope.press_source = response.data;
        $scope.getMediaData($scope.selectedMedium);
    }, function errorCallback(response) {
        console.log(response.data);
    });

    $scope.getMediaData = function (media) {
        $scope.selectedMediaId = media.media_id
        $scope.selectedMedium = media;
        $http({
            method: 'POST',
            url: '/pressmedia/get/',
            data: $.param({ media_id: media.media_id })
        }).then(function successCallback(response) {
            $scope.pressMedia = response.data;
        }, function errorCallback(response) {
            console.log(response.data);
        });
    }

    $scope.clearPress = function () {
        $scope.pressMedia = {};
    }

    $scope.insertMedia = function () {
        if ($scope.insertClicked == true && $scope.editClicked == false) {

            $http({
                method: 'POST',
                url: '/pressmedia/insert/',
                data: $.param({ data: JSON.stringify($scope.pressMedia) })
            }).then(function successCallback(response) {
                console.log(response);
                toastr.success(response.data);
            }, function errorCallback(response) {
                toastr.error(response.data);
            });
        }
        else {
            $http({
                method: 'POST',
                url: '/pressmedia/edit/',
                data: $.param({ data: JSON.stringify($scope.pressMedia), mediaEditid: $scope.selectedMediaId })
            }).then(function successCallback(response) {
                console.log(response);
                toastr.success(response.data);
            }, function errorCallback(response) {
                toastr.error(response.data);
            });
        }
    }

    $scope.deleteMedia = function () {
        $http({
            method: 'POST',
            url: '/pressmedia/delete/',
            data: $.param({ media_id: $scope.selectedMediaId, twitter: $scope.pressMedia.pre_twitter })
        }).then(function successCallback(response) {
            console.log(response);
            toastr.success("Se ha eliminado el medio");
        }, function errorCallback(response) {
            toastr.error("Ha ocurrido un error");
        });
    }

    $scope.editMedia = function () {
        try {
            $scope.selectedMediaId = $scope.selectedMedium.media_id;
        }
        catch (err) {
            console.log(err);
        }
    }

}]);