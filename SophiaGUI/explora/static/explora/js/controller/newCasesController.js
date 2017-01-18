app.controller('newsCasesController', ['$scope', '$http', 'dataFormat', function ($scope, $http, dataFormat) {

    $scope.page_init;
    $scope.page_end;
    $scope.size = 3;
    $scope.news_cases;

    //Date Picker Setup
    $("#datepicker1").datepicker({
        format: "yyyy-mm-dd",
        language: "es",
        orientation: "bottom auto",
    });

    $("#datepicker2").datepicker({
        format: "yyyy-mm-dd",
        language: "es",
        orientation: "bottom auto",
    });

    var today = new Date().toISOString().slice(0, 10);
    $("#datepicker1").datepicker('update', String(today));
    $("#datepicker2").datepicker('update', String(today));

    var should_contain = new Taggle('should', { placeholder: 'Concepto o frase importante en mi búsqueda' });
    var must_contain = new Taggle('and', { placeholder: 'Concepto o frase fundamental en mi búsqueda' });
    var not_contain = new Taggle('not', { placeholder: 'Concepto o frase que permite excluir resultados' });

    $scope.range = function (min, max) {
        var output = [];
        for (var i = min; i <= max; i++) {
            output.push(i);
        }
        return output;
    }

    $scope.page_number = function (page_number) {
        //Function to get the page number from view
        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        query = {
            "and": tag_values.must_contain_group,
            "or": tag_values.should_contain_group,
            "not_and": tag_values.not_contain_group,
            "startdate": $("#datepicker1").datepicker('getDate').toISOString().slice(0, 10),
            "enddate": $("#datepicker2").datepicker('getDate').toISOString().slice(0, 10),
        }

        var page = page_number;
        $http({
            method: 'POST',
            url: '/get_data/usernewscases/' + page + '/',
            data: $.param({ data: JSON.stringify(query) })
        }).then(function successCallback(response) {
            $scope.news_cases = response.data.data;
            $scope.totalpages = response.data.totalpages;
            $scope.actual_page = response.data.page;

            if ($scope.news_cases.length == 0) {
                $(".pagination_container").empty();
            }
            
            else {
                if ($scope.totalpages == 1) {
                    $scope.page_init = 1;
                    $scope.page_end = 1;
                }
                else {
                    var range = dataFormat.get_pagination_range($scope.actual_page, $scope.size, $scope.totalpages);
                    $scope.page_init = range.page_init;
                    $scope.page_end = range.page_end;
                }
            }
        }, function errorCallback(response) {
            return (response);
        });
    }

    $scope.search_cases = function () {
        $scope.page_number(1);
    }
    $scope.search_cases();

}]);