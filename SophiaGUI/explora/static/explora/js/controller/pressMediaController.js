app.controller('pressMediaController', ['$scope', '$http', function ($scope, $http) {

    $scope.press_source = ["medioX", "medioY", "medioZ"];
    $scope.selectedMedium = $scope.press_source[0];


    $scope.pressMedia = {
        pre_name: "Nombre Apellido",
        pre_country: "Chile",
        pre_owner: "Nombre del medio",
        pre_date: "2000-12-12",
        pre_url: "http:mi-medio.com",
        pre_region:"Region",
        pre_city: "Valdivia",
        pre_twitter: "Chile",
        pre_facebook: "Cobertura",
        pre_language:"Español",
    }

    $scope.Media = {}
    $scope.insertMedia = function () {
        console.log($scope.Media);
    }

}]);