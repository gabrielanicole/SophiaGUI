app.controller('showNewsCaseController', ['$scope', '$http', '$location', 'dataFormat', '$window', function (
    $scope, $http, $location, dataFormat, $window) {

    var absUrl = $location.absUrl().split("/");
    var elastic_id = absUrl[absUrl.length - 1];
    var data = { 'elastic_id': elastic_id };

    $scope.histogram_startdate;
    $scope.histogram_enddate;

    $scope.startdate;
    $scope.enddate;
    $scope.articulos;
    $scope.total_pages;
    $scope.actual_page;
    $scope.page_init;
    $scope.page_end;
    $scope.size = 3;

    $scope.press_source = ["Cualquier Medio", "medioX", "medioY", "medioZ"];
    $scope.category = ["Cualquier Categoría", "Category1", "Category2", "Category3"];
    $scope.options = [
        { key: "Minuto", value: "minute" },
        { key: "Hora", value: "hour" },
        { key: "Día", value: "day" },
        { key: "Semana", value: "week" },
        { key: "Mes", value: "month" },
        { key: "Año", value: "year" }
    ];

    //Default values
    $scope.selectedMedium = $scope.press_source[0];
    $scope.selectedCategory = $scope.category[0];

    //Adding widgets setup
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

    //Section to control the TAG sistem
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

    $http({
        method: 'POST',
        url: '/getNewsCaseInfo/',
        data: $.param(data)
    }).then(function successCallback(response) {
        //console.log(response.data);
        $scope.restoreSession(response.data);
        $scope.restoreHistogram();
        $scope.update_list(1);

    }, function errorCallback(response) {
        console.log(response);
    });

    $scope.restoreSession = function (data) {
        //Restore what the user searched
        histogram_startdate = String(data.news_case_data.new_date_from.slice(0, 10));
        histogram_enddate = String(data.news_case_data.new_date_to.slice(0, 10));
        $("#datepicker1").datepicker('update', histogram_startdate);
        $("#datepicker2").datepicker('update', histogram_enddate);
        var new_or = dataFormat.getTagList(data.news_case_data.new_or);
        var new_and = dataFormat.getTagList(data.news_case_data.new_and);
        var new_not = dataFormat.getTagList(data.news_case_data.new_not);
        should_contain.add(new_or);
        must_contain.add(new_and);
        not_contain.add(new_not);
    }

    $scope.selectedItem = function (selected) {
        $scope.granularity = selected;
        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        var json_data = {
            "index": "articles",
            "fields": ["art_title", "art_content"],
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
            url: '/get_data/articles/histogram',
            data: $.param(data)

        }).then(function successCallback(response) {
            //Delete the histogram
            $("#histogram").empty();
            //Add the new histogram
            var histograma = generate_histogram(width = ($scope.windowsWidth - 300), height = 300, data_json = response.data);

        }, function errorCallback(response) {
            console.log(response);
        });

    }

    $scope.restoreHistogram = function () {
        var date1 = $("#datepicker1").datepicker('getDate');
        var date2 = $("#datepicker2").datepicker('getDate');
        $scope.histogram_startdate = date1.toISOString().slice(0, 10);
        $scope.histogram_enddate = date2.toISOString().slice(0, 10);

        $scope.startdate = $scope.histogram_startdate;
        $scope.enddate = $scope.histogram_enddate;

        $scope.windowsWidth = $window.innerWidth;
        $scope.granularity = 'day';
        //Draw Histogram for first time
        $scope.selectedItem($scope.granularity);

    }

    $scope.update_list = function (page) {

        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        var json_data = {
            "index": "articles",
            "fields": ["art_title", "art_content"],
            "and": tag_values.must_contain_group,
            "or": tag_values.should_contain_group,
            "not_and": tag_values.not_contain_group,
            "dates": { "startdate": $scope.startdate, "enddate": $scope.enddate }
        }
        $http({
            method: 'POST',
            url: '/get_data/articles/articles_advance_search/' + page + '/',
            data: $.param({ data: JSON.stringify(json_data) })
        }).then(function successCallback(response) {
            $scope.articulos = response.data.results;
            $scope.total_pages = parseInt(response.data.totalpages);
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
    //Controler for advancesearch button.
    $scope.get_input_data = function () {
        //set day as default
        $scope.granularity = 'day';
        $scope.update_histogram();
        $scope.update_list(1);
        $scope.selectedItem($scope.granularity);
    }

    $scope.update_news_case = function (newsCaseName) {
        $scope.news_case_name = newsCaseName[0][0];
        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);

        var aux_category;
        if ($scope.selectedCategory == 'Cualquier Categoría') { aux_category = ""; }
        else { aux_category = $scope.selectedCategory; }

        var aux_press_source;
        if ($scope.selectedMedium == 'Cualquier Medio') { aux_press_source = ""; }
        else { aux_press_source = $scope.selectedMedium; }

        var checked = $('#toogleCase').prop('checked');

        var json_data = {
            "elastic_id": elastic_id,
            "and": tag_values.must_contain_group,
            "or": tag_values.should_contain_group,
            "not_and": tag_values.not_contain_group,
            "dates": { "startdate": $scope.histogram_startdate, "enddate": $scope.histogram_enddate },
            "category": aux_category,
            "press_source": aux_press_source,
            "new_name": $scope.news_case_name,
            "follow_new_feed": checked
        }

        $http({
            method: 'POST',
            url: '/updateNewsCase/',
            data: $.param({ data: JSON.stringify(json_data) })
        }).then(function successCallback(response) {
            console.log(response);
        }, function errorCallback(response) {
            console.log(response);
        });
        $scope.news_case_name = "";
    }

}]);