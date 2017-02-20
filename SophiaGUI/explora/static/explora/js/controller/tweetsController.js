app.controller('tweetsController', ['$scope', '$http', 'dataFormat', '$window', 'Tweets', 'PressMedia', 'ExportData', function (
    $scope, $http, dataFormat, $window, Tweets, PressMedia, ExportData) {

    $('#hideVisz').on('shown.bs.collapse', function () {
        $("#collapseIcon").removeClass("glyphicon glyphicon-chevron-up").addClass("glyphicon glyphicon-chevron-down");
    });

    $('#hideVisz').on('hidden.bs.collapse', function () {
        $("#collapseIcon").removeClass("glyphicon glyphicon-chevron-down").addClass("glyphicon glyphicon-chevron-up");
    });

    $scope.total_pages;
    $scope.actual_page;
    $scope.page_init;
    $scope.page_end;
    $scope.max_page = 7;
    $scope.size = 3;
    $scope.startdate;
    $scope.enddate;

    $("#mediaContainer").tooltip();
    $("#mediumGroupContainer").tooltip();
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

    $scope.sortGroup = [
        { key: "Tiempo", value: "pub_date" },
        { key: "Relevancia", value: "_score" }
    ]

    $scope.selectedSort = $scope.sortGroup[0];

    $scope.sortChange = function (sortType) {
        $scope.selectedSort = sortType;
    }



    $scope.press_source = [];
    $scope.press_media_groups = [];
    $scope.selectedMedium = [];

    function loadPressMedia() {
        PressMedia.getPressMediaList().then(function (response) {
            $scope.press_source = response.data;
            var empty = { media_id: "", media_name: "", media_twitter: "" };
            $scope.press_source.unshift(empty);
            $scope.selectedMedium = empty;
            $scope.update_list(1);
            //Draw Histogram for first time
            $scope.selectedItem($scope.granularity);
        });
    }
    loadPressMedia();

    $scope.selecteMediumGroup;
    function loadPressMediaGroups() {
        PressMedia.getPressMediaGroups().then(function (response) {
            $scope.press_media_groups = response.data.names;
            $scope.press_media_groups.unshift("");
            $scope.selecteMediumGroup = $scope.press_media_groups[0];

        });
    }
    loadPressMediaGroups();

    $scope.groupChange = function (group) {
        $scope.selecteMediumGroup = group;
    }

    $scope.mediaChange = function (media) {
        $scope.selectedMedium = media;
    }

    $scope.backToTop = function () {
        window.scrollTo(0, 0);
    }

    $scope.loadNextItems = function () {

        $('#loadIcon').removeClass("hidden");
        page = $scope.actual_page + 1;
        if (page <= $scope.total_pages) {
            var twitter;
            try {
                twitter = $scope.selectedMedium.media_twitter;
            }
            catch (err) {
                twitter = "";
            }

            var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
            var json_data = {
                "index": "publications",
                "pub_username": twitter,
                "fields": ["pub_content"],
                "and": tag_values.must_contain_group,
                "or": tag_values.should_contain_group,
                "not_and": tag_values.not_contain_group,
                "pre_owner": $scope.selecteMediumGroup,
                "sort": $scope.selectedSort.value,
                "dates": { "startdate": $scope.startdate, "enddate": $scope.enddate }
            }

            Tweets.getTweetList(json_data, page).then(function (data) {
                for (var x = 0; x < data.results.length; x++) {
                    $scope.tweets.push(data.results[x]);
                }
                $scope.total_pages = parseInt(data.totalPages);
                $scope.actual_page = parseInt(data.page);

                var range = dataFormat.get_pagination_range($scope.actual_page, $scope.size, $scope.total_pages);
                $scope.page_init = range.page_init;
                $scope.page_end = range.page_end;
                $('#loadIcon').addClass("hidden");
            });
        }
        else {
            $('#loadIcon').addClass("hidden");
        }
    }
    $scope.options = [
        { key: "Hora", value: "hour" },
        { key: "Día", value: "day" },
        { key: "Mes", value: "month" },
        { key: "Año", value: "year" }
    ];

    var histogram_enddate = new Date().toISOString().slice(0, 10);
    //var histogram_startdate = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    //var histogram_startdate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().slice(0, 10);
    var histogram_startdate = new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().slice(0, 10);
    $scope.windowsWidth = $window.innerWidth;
    $scope.granularity = 'hour';

    $scope.startdate = histogram_startdate + " 00:00:00";
    $scope.enddate = histogram_enddate + " 23:59:59";

    $scope.histogram_startdate = histogram_startdate + " 00:00:00";
    $scope.histogram_enddate = histogram_enddate + " 23:59:59";

    $("#datepicker1").datepicker('update', String($scope.histogram_startdate).slice(0, 10));
    $("#datepicker2").datepicker('update', String($scope.histogram_enddate).slice(0, 10));

    $scope.selectedItem = function (selected) {

        var twitter = $scope.selectedMedium.media_twitter;
        $scope.granularity = selected;
        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        var json_data = {
            "index": "publications",
            "fields": ["pub_content"],
            "and": tag_values.must_contain_group,
            "or": tag_values.should_contain_group,
            "not_and": tag_values.not_contain_group,
            "pub_username": twitter,
            "pre_owner": $scope.selecteMediumGroup,
            "dates": { "startdate": $scope.histogram_startdate, "enddate": $scope.histogram_enddate },
        }

        var data = {
            countby: $scope.granularity,
            search: JSON.stringify(json_data)
        };

        Tweets.getTweetsCountBy(data).then(function (response) {
            $("#histogram").empty();
             var histograma = generate_histogram(width = ($scope.windowsWidth - 85), height = 300,
                data_json = response.data, granularity = $scope.granularity);
        });
    }

    $scope.update_list = function (page) {

        var twitter = $scope.selectedMedium.media_twitter;
        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        var json_data = {
            "index": "publications",
            "pub_username": twitter,
            "fields": ["pub_content"],
            "and": tag_values.must_contain_group,
            "or": tag_values.should_contain_group,
            "not_and": tag_values.not_contain_group,
            "pre_owner": $scope.selecteMediumGroup,
            "sort": $scope.selectedSort.value,
            "dates": { "startdate": $scope.startdate, "enddate": $scope.enddate }
        }

        Tweets.getTweetList(json_data, page).then(function (data) {
            $scope.tweets = data.results;
            $scope.total_pages = parseInt(data.totalPages);
            $scope.actual_page = parseInt(data.page);
            $scope.total_found = data.total;
            var range = dataFormat.get_pagination_range($scope.actual_page, $scope.size, $scope.total_pages);
            $scope.page_init = range.page_init;
            $scope.page_end = range.page_end;
        })
    }

    $scope.update_histogram = function () {
        var date1 = $("#datepicker1").datepicker('getDate');
        var date2 = $("#datepicker2").datepicker('getDate');
        $scope.histogram_startdate = date1.toISOString().slice(0, 10) + " 00:00:00";
        $scope.histogram_enddate = date2.toISOString().slice(0, 10) + " 23:59:59";
    }

    $scope.get_input_data = function () {
        $scope.granularity = 'hour';
        $scope.update_histogram();
        $scope.update_list(1);
        $scope.selectedItem($scope.granularity);
    }

    /* Export Image Secction */
    $scope.exportImageFormat = "PNG";
    $scope.exportImage = function (format) {
        ExportData.exportImage(format);
    }

}]);