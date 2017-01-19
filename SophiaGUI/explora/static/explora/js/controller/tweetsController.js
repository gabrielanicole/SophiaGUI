app.controller('tweetsController', ['$scope', '$http', 'dataFormat', '$window', function ($scope, $http, dataFormat, $window) {

    $scope.total_pages;
    $scope.actual_page;
    $scope.page_init;
    $scope.page_end;
    $scope.max_page = 7;
    $scope.size = 3;
    $scope.startdate;
    $scope.enddate;

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

    var should_contain = new Taggle('should', { placeholder: 'Concepto o frase importante en mi búsqueda' });
    var must_contain = new Taggle('and', { placeholder: 'Concepto o frase fundamental en mi búsqueda' });
    var not_contain = new Taggle('not', { placeholder: 'Concepto o frase que permite excluir resultados' });

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

    $scope.press_source = ["Cualquier Medio", "medioX", "medioY", "medioZ"];
    $scope.category = ["Cualquier Categoría", "Category1", "Category2", "Category3"];
    //Default values
    $scope.selectedMedium = $scope.press_source[0];
    $scope.selectedCategory = $scope.category[0];


    $scope.options = [
        { key: "Minuto", value: "minute" },
        { key: "Hora", value: "hour" },
        { key: "Día", value: "day" },
        { key: "Semana", value: "week" },
        { key: "Mes", value: "month" },
        { key: "Año", value: "year" }
    ];

    var histogram_enddate = new Date().toISOString().slice(0, 10);
    var histogram_startdate = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    $scope.windowsWidth = $window.innerWidth;
    $scope.granularity = 'hour';


    $scope.startdate = histogram_startdate;
    $scope.enddate = histogram_enddate;

    $scope.histogram_startdate = histogram_startdate;
    $scope.histogram_enddate = histogram_enddate;

    $("#datepicker1").datepicker('update', String($scope.histogram_startdate));
    $("#datepicker2").datepicker('update', String($scope.histogram_enddate));


    $scope.selectedItem = function (selected) {
        $scope.granularity = selected;
        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        var json_data = {
            "index": "articles",
            "fields": ["pub_content"],
            "and": tag_values.must_contain_group,
            "or": tag_values.should_contain_group,
            "not_and": tag_values.not_contain_group,
        }

        var data = {
            startdate: $scope.histogram_startdate,
            enddate: $scope.histogram_enddate,
            countby: $scope.granularity,
            search: JSON.stringify(json_data)
        };

        $http({
            method: 'POST',
            url: '/get_data/tweets/histogram/',
            data: $.param(data)

        }).then(function successCallback(response) {
            $("#histogram").empty();
            var histograma = generate_histogram(width = ($scope.windowsWidth - 300), height = 300, data_json = response.data);

        }, function errorCallback(response) {
            console.log(response);
        });

    }
    //Draw Histogram for first time
    $scope.selectedItem($scope.granularity);


    $scope.update_list = function (page) {

        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        var json_data = {
            "index": "publications",
            "fields": ["pub_content"],
            "and": tag_values.must_contain_group,
            "or": tag_values.should_contain_group,
            "not_and": tag_values.not_contain_group,
            "dates": { "startdate": $scope.startdate, "enddate": $scope.enddate }
        }

        $http({
            method: 'POST',
            url: '/get_data/tweets/' + page + '/',
            data: $.param({ data: JSON.stringify(json_data) })
        }).then(function successCallback(response) {
            $scope.tweets = response.data.results;
            $scope.total_pages = parseInt(response.data.totalPages);
            $scope.actual_page = parseInt(response.data.page);

            var range = dataFormat.get_pagination_range($scope.actual_page, $scope.size, $scope.total_pages);
            $scope.page_init = range.page_init;
            $scope.page_end = range.page_end;

        }, function errorCallback(response) {
            return (response);
        });
    }

    $scope.update_histogram = function () {
        var date1 = $("#datepicker1").datepicker('getDate');
        var date2 = $("#datepicker2").datepicker('getDate');

        $scope.histogram_startdate = date1.toISOString().slice(0, 10);
        $scope.histogram_enddate = date2.toISOString().slice(0, 10);
        $scope.selectedItem($scope.granularity);

    }

    $scope.update_list(1);
    $scope.get_input_data = function () {
        $scope.granularity = 'day';
        $scope.update_histogram();
        $scope.update_list(1);
        $scope.selectedItem($scope.granularity);
    }

}]);