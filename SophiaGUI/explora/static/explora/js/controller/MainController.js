
app.controller('searchController', ['$scope','$http','$window', function($scope, $http, $window) {
   
   $scope.index = 5;
   $scope.size = 4;
   $scope.total_pages;
   $scope.articulos;

   
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
                    $scope.articulos = response.data.results;
                    $scope.total_pages = response.data.totalpages;

                }, function errorCallback(response) {

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

 var granularity = 'day';
    
    $scope.options = [
        {key:"Minuto", value:"minute"},
        {key:"Hora", value:"hour"},
        {key:"Día", value:"day"},
        {key:"Semana", value:"week"},
        {key:"Mes", value:"month"},
        {key:"Año", value:"year"}
        ];

    var histogram_enddate = new Date().toISOString().slice(0,10);

    var histogram_startdate = new Date();
        histogram_startdate.setMonth(histogram_startdate.getMonth() - 2);
        histogram_startdate = histogram_startdate.toISOString().slice(0,10);


        $scope.windowsWidth = $window.innerWidth;

        $scope.selectedItem = function(selected){
            granularity = selected;
            var data = {startdate: histogram_startdate,
                        enddate: histogram_enddate,
                        countby: granularity};

            $http({
                    method: 'POST',
                    url: '/get_data/articles/histogram',
                    data: $.param(data)
                    }).then(function successCallback(response) {
                        $("#histogram").empty();
                        var histograma = generate_histogram(width=($scope.windowsWidth-300),height=300, data_json=response.data);
                        console.log(histograma);

                    }, function errorCallback(response) {
                        console.log(response);
                    });

    }
    //Draw Histogram for first time
    $scope.selectedItem(granularity);


}]);

