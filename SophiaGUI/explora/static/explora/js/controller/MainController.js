
app.controller('searchController', ['$scope', '$http', '$window', function ($scope, $http, $window) {

    $scope.total_pages;
    $scope.actual_page;
    $scope.articulos;
    $scope.page_init;
    $scope.page_end;
    $scope.max_page = 7;
    $scope.size = 3;
   
    $scope.page_number = function (page_number) {
        //Function to get the page number from view
        var page = page_number[0][0];
        $scope.update_list(page);
    }

    $scope.range = function (min, max) {
        var output = [];
        for (var i = min; i <= max; i++) {
            output.push(i);
        }
        return output;
    }

    var granularity = 'day';

    $scope.options = [
        { key: "Minuto", value: "minute" },
        { key: "Hora", value: "hour" },
        { key: "Día", value: "day" },
        { key: "Semana", value: "week" },
        { key: "Mes", value: "month" },
        { key: "Año", value: "year" }
    ];

    var histogram_enddate = new Date().toISOString().slice(0, 10);

    var histogram_startdate = new Date();
    histogram_startdate.setMonth(histogram_startdate.getMonth() - 2);
    histogram_startdate = histogram_startdate.toISOString().slice(0, 10);


    $scope.windowsWidth = $window.innerWidth;

    $scope.selectedItem = function (selected) {
        granularity = selected;
        var data = {
            startdate: histogram_startdate,
            enddate: histogram_enddate,
            countby: granularity
        };

        $http({
            method: 'POST',
            url: '/get_data/articles/histogram',
            data: $.param(data)

        }).then(function successCallback(response) {
            $("#histogram").empty();
            var histograma = generate_histogram(width = ($scope.windowsWidth - 300), height = 300, data_json = response.data);

        }, function errorCallback(response) {
            console.log(response);
        });

    }
    //Draw Histogram for first time
    $scope.selectedItem(granularity);

    //Section to control the TAG sistem
    var should_contain = new Taggle('should', { placeholder: 'Concepto o frase importante en mi búsqueda' });
    var must_contain = new Taggle('and', { placeholder: 'Concepto o frase fundamental en mi búsqueda' });
    var not_contain = new Taggle('not', { placeholder: 'Concepto o frase que permite excluir resultados' });

    function generate_array(data_array) {
        var results = [];
        if (data_array.length > 0) {
            var match = "";
            for (i = 0; i < data_array.length; i++) {
                if (data_array[i].indexOf(" ") == -1) {
                    match = match + data_array[i] + " ";
                }
                else {
                    results.push({ "match_phrase": data_array[i] });
                }
            }
            results.push({ "match": match });
        }
        else {
            return results;
        }

        return results;
    }

    $scope.update_list = function (page) {

        var should_contain_group = should_contain.getTagValues();
        var must_contain_group = must_contain.getTagValues();
        var not_contain_group = not_contain.getTagValues();

        should_contain_group = generate_array(should_contain_group);
        must_contain_group = generate_array(must_contain_group);
        not_contain_group = generate_array(not_contain_group);

        var json_data = {
            "index": "articles",
            "fields": ["art_title", "art_content"],
            "and": must_contain_group,
            "or": should_contain_group,
            "not_and": not_contain_group,
        }

        $http({
            method: 'POST',
            url: '/get_data/articles/articles_advance_search/' + page + '/',
            data: $.param({ data: JSON.stringify(json_data) })
        }).then(function successCallback(response) {
            $scope.articulos = response.data.results;
            $scope.total_pages = parseInt(response.data.totalpages);
            $scope.actual_page = parseInt(response.data.page);

            var c1 = $scope.actual_page;
            var c2 = $scope.actual_page;

            for (var a = $scope.actual_page; a <= $scope.actual_page + $scope.size; a++) {
                if (a >= $scope.total_pages) {
                    c1 = c1;
                }
                else {
                    c1++;
                }
            }
            for (var b = $scope.actual_page; b > $scope.actual_page - $scope.size; b--) {
                if (b <= 1) {
                    c2 = c2;
                }
                else {
                    c2--;
                }
            }
            $scope.page_init = c2;
            $scope.page_end = c1;

        }, function errorCallback(response) {

        });
    }

    //load the first page
    $scope.update_list(1);

    //Controler for advancesearch button.
    $scope.get_input_data = function () {
        $scope.update_list(1);
    }

}]);

