
app.controller('articlesListController', ['$scope','$http', function($scope, $http) {
   
   $scope.index = 5;
   $scope.size = 4;
   $scope.total_pages;
   
   $scope.page_number = function(page_number){
       //Function to get the page number from view
       var page = page_number[0][0];
       if(page == $scope.index - $scope.size && page != 1){
            $scope.index = $scope.index - 1;
            $scope.update_list(page);
            
       }
       else if(page == $scope.index + $scope.size && $scope.index + $scope.size != $scope.total_pages){
           $scope.index = $scope.index + 1;
           $scope.update_list(page);
       }
       else{
           $scope.index = $scope.index;
           $scope.update_list(page);
       }
   }

   $scope.update_list = function(page){
        $http({
                method: 'POST',
                url: '/get_data/articles/'+page+'/'
                }).then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    $scope.articulos = response.data.results;
                    $scope.total_pages = response.data.totalpages;

                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
   }

   //load the first page
   $scope.update_list(1);
   
   $scope.range = function(min, max){
        var output = [];
        for(var i = min; i <= max; i++){
            output.push(i); 
        }
        return output;
    }

   
   
}]);

