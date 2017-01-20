app.controller('pressMediaController', ['$scope', '$http', function ($scope, $http) {

    $scope.press_source = [];
    $scope.pressMedia = {};

    $http({
        method: 'GET',
        url: '/pressmedia/getlist/',
    }).then(function successCallback(response) {
        $scope.press_source = response.data;
        $scope.selectedMedium = $scope.press_source[0];
        $scope.getMediaData($scope.selectedMedium);
    }, function errorCallback(response) {
        console.log(response.data);
    });

    $scope.getMediaData = function (media) {
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

    $scope.Media = {}
    $scope.insertMedia = function () {
        $http({
            method: 'POST',
            url: '/pressmedia/insert/',
            data: $.param({ data: JSON.stringify($scope.Media) })
        }).then(function successCallback(response) {
            toastr.success(response.data);
        }, function errorCallback(response) {
            toastr.error(response.data);
        });

    }

}]);