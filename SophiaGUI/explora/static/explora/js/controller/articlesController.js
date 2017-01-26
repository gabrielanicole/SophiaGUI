app.controller('searchController', ['$scope', '$http', '$window', 'dataFormat', "staticData", function (
    $scope, $http, $window, dataFormat, staticData) {

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

    $("#mediaContainer").tooltip();
    $("#categoryContainer").tooltip();
    $("#exportButton").tooltip();

    $scope.options = [
        { key: "Minuto", value: "minute" },
        { key: "Hora", value: "hour" },
        { key: "Día", value: "day" },
        { key: "Semana", value: "week" },
        { key: "Mes", value: "month" },
        { key: "Año", value: "year" }
    ];


    $scope.checkbox = {
        art_title: false,
        art_content: false,
        art_date: false,
        art_name_press_source: false,
        art_category: false,
        art_url: false,
        format: ""
    };

    $scope.exportData = function () {

        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        var json_data = {
            search: {
                "index": "articles",
                "fields": ["art_content"],
                "art_name_press_source": $scope.selectedMedium.media_twitter,
                "and": tag_values.must_contain_group,
                "or": tag_values.should_contain_group,
                "not_and": tag_values.not_contain_group,
                "dates": { "startdate": $scope.histogram_startdate, "enddate": $scope.histogram_enddate },
                "art_category": $scope.selectedCategory
            },
            "checkbox": $scope.checkbox
        }

        $http({
            method: 'POST',
            url: '/exportData/',
            data: $.param({ data: JSON.stringify(json_data) })
        }).then(function successCallback(response, headers) {
            if (response.headers()['content-type'] == 'text/json') {
                var blob = new Blob([JSON.stringify(response.data)], { type: response.headers()['content-type'] });
            }
            else {
                var blob = new Blob([String(response.data)], { type: response.headers()['content-type'] });
            }
            saveAs(blob, response.headers()['file-name']);
        }, function errorCallback(response) {
            console.log("Error Callback");
        });
    }

    $scope.validateExport = function () {
        if (($scope.checkbox.art_title == true ||
            $scope.checkbox.art_content == true ||
            $scope.checkbox.art_date == true ||
            $scope.checkbox.art_name_press_source == true ||
            $scope.checkbox.art_category == true ||
            $scope.checkbox.art_url == true) &&
            $scope.checkbox.format != "") {
            return true;
        }
        else {
            return false;
        }
    }

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

    $scope.histogram_startdate;
    $scope.histogram_enddate;
    $scope.total_pages;
    $scope.actual_page;
    $scope.articulos = [];
    $scope.page_init;
    $scope.page_end;
    $scope.size = 3;
    $scope.busy = false;

    $scope.press_source = [];
    $scope.category = staticData.getCategoryList();
    //Default values
    $scope.selectedMedium = [];
    $scope.selectedCategory = $scope.category[0];

    //Set Intial Variables
    var histogram_enddate = new Date().toISOString().slice(0, 10);
    //var histogram_startdate = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    //var histogram_startdate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().slice(0, 10);
    var histogram_startdate = new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().slice(0, 10);
    $scope.windowsWidth = $window.innerWidth;
    $scope.granularity = 'hour';

    $scope.histogram_startdate = histogram_startdate;
    $scope.histogram_enddate = histogram_enddate;

    $scope.startdate = histogram_startdate;
    $scope.enddate = histogram_enddate;

    $("#datepicker1").datepicker('update', String($scope.histogram_startdate));
    $("#datepicker2").datepicker('update', String($scope.histogram_enddate));

    function loadPressMedia() {
        $http({
            method: 'GET',
            url: '/pressmedia/getlist/',
        }).then(function successCallback(response) {
            for (x in response.data) {
                $scope.press_source = response.data;
                //$scope.press_source.push(response.data[x].media_name);
            }
            var empty = { media_id: "", media_name: "", media_twitter: "" };
            $scope.press_source.unshift(empty);
            $scope.selectedMedium = empty;

        }, function errorCallback(response) {
            console.log(response.data);
        });
    }

    $scope.loadNextItems = function (){
        //$scope.update_list($scope.actual_page + 1);
    }

    $scope.mediaChange = function (media) {
        $scope.selectedMedium = media;
    }

    $scope.categoryChange = function (category) {
        $scope.selectedCategory = category;
    }

    $scope.selectedItem = function (selected) {
        $scope.granularity = selected;
        loadHistogram($scope.granularity);
    }

    function loadHistogram(granularity) {
        var twitter = $scope.selectedMedium.media_twitter;
        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        var json_data = {
            "index": "articles",
            "fields": ["art_content"],
            "art_name_press_source": twitter,
            "and": tag_values.must_contain_group,
            "or": tag_values.should_contain_group,
            "not_and": tag_values.not_contain_group,
            "dates": { "startdate": $scope.startdate, "enddate": $scope.enddate },
            "art_category": $scope.selectedCategory

        }

        var data = {
            startdate: $scope.histogram_startdate,
            enddate: $scope.histogram_enddate,
            countby: granularity,
            search: JSON.stringify(json_data)
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

    $scope.update_list = function (page) {

        $scope.busy = true;
        var twitter = $scope.selectedMedium.media_twitter;
        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        var json_data = {
            "index": "articles",
            "fields": ["art_content"],
            "and": tag_values.must_contain_group,
            "or": tag_values.should_contain_group,
            "not_and": tag_values.not_contain_group,
            "dates": { "startdate": $scope.startdate, "enddate": $scope.enddate },
            "art_name_press_source": twitter,
            "art_category": $scope.selectedCategory
        }

        $http({
            method: 'POST',
            url: '/get_data/articles/articles_advance_search/' + page + '/',
            data: $.param({ data: JSON.stringify(json_data) })
        }).then(function successCallback(response) {
            console.log(response.data.results);
            $scope.articulos.push();
            $scope.total_pages = parseInt(response.data.totalpages);
            $scope.actual_page = parseInt(response.data.page);

            var range = dataFormat.get_pagination_range($scope.actual_page, $scope.size, $scope.total_pages);
            $scope.page_init = range.page_init;
            $scope.page_end = range.page_end;
            $scope.busy = false;

        }, function errorCallback(response) {
            return (response);
        });
    }

    $scope.update_histogram = function () {
        var date1 = $("#datepicker1").datepicker('getDate');
        var date2 = $("#datepicker2").datepicker('getDate');

        $scope.histogram_startdate = date1.toISOString().slice(0, 10);
        $scope.histogram_enddate = date2.toISOString().slice(0, 10);

        $scope.startdate = $scope.histogram_startdate;
        $scope.enddate = $scope.histogram_enddate;

    }

    //Controler for advancesearch button.
    $scope.get_input_data = function () {
        //set day as default
        $scope.granularity = 'hour';
        $scope.update_histogram();
        loadHistogram($scope.granularity);
        $scope.update_list(1);
    }

    $scope.loadModal = function (article_id) {

        var data = { art_id: article_id[0][0] };
        $http({
            method: 'POST',
            url: '/articles/modal_new',
            data: $.param(data)
        }).then(function successCallback(response) {
            console.log(response)
            if ($('#myModal').length) {
                $('#myModal').remove();
            }
            //In the tag <modal> then append the response from Django
            $('#modal').append(response.data);
            //Then display the modal window
            $('#myModal').modal('show');

        }, function errorCallback(response) {
            console.log(response);
        });
    }

    $scope.createNewsCase = function (newsCaseName) {
        //Format the necesary data for the newsCase
        $scope.news_case_name = newsCaseName[0][0];
        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        var twitter = $scope.selectedMedium.media_twitter;
        var today = new Date().toISOString().slice(0, 10)
        var checked = $('#toogleCase').prop('checked');
        var json_data = {
            "index": "articles",
            "fields": ["art_content"],
            "and": tag_values.must_contain_group,
            "or": tag_values.should_contain_group,
            "not_and": tag_values.not_contain_group,
            "dates": { "startdate": $scope.histogram_startdate, "enddate": $scope.histogram_enddate },
            "category": $scope.selectedCategory,
            "press_source": twitter,
            "new_name": $scope.news_case_name,
            "new_date": today,
            "follow_new_feed": checked
        }

        if ($scope.news_case_name.length > 0) {
            $http({
                method: 'POST',
                url: '/create/newsCase/',
                data: $.param({ data: JSON.stringify(json_data) })
            }).then(function successCallback(response) {
                console.log(response);
                toastr.success("Caso noticioso creado con éxito");
            }, function errorCallback(response) {
                console.log(response);
            });
        }
        else {
            toastr.error("No ingresó nombre al caso noticioso");
        }
        $scope.news_case_name = "";
    }

    function run() {
        loadHistogram($scope.granularity)
        $scope.update_list(1);
    }
    loadPressMedia();
    run();

}]);