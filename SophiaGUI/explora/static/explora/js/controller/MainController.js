
app.controller('articlesListController', ['$scope','$http', function($scope, $http) {
   
   $scope.page_number = function(page_number){
       //Function to get the page number from view
       var page = page_number[0][0];
       $scope.index = page;
   }

   $scope.index = 5;
   $scope.range = function(min, max){
        var output = [];
        for(var i = min; i <= max; i++){
            output.push(i); 
        }
        return output;
    }
/*
   $http({
        method: 'POST',
        url: '/get_data/articles/1/'
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.articulos = response.data;
            console.log($scope.articulos);

        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        }); */
}]);

