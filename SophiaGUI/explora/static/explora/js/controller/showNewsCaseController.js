app.controller('showNewsCaseController', ['$scope', '$http', '$location', 'dataFormat', '$window', 'staticData', 'ExportData', 'PressMedia', 'Articles', 'NewsCases', function (
    $scope, $http, $location, dataFormat, $window, staticData, ExportData, PressMedia, Articles, NewsCases) {

    $("#mediaContainer").tooltip();
    $("#categoryContainer").tooltip();
    $("#exportButton").tooltip();
    $("#mediumGroupContainer").tooltip();

    $('#hideVisz').on('shown.bs.collapse', function () {
        $("#collapseIcon").removeClass("glyphicon glyphicon-chevron-up").addClass("glyphicon glyphicon-chevron-down");
    });

    $('#hideVisz').on('hidden.bs.collapse', function () {
        $("#collapseIcon").removeClass("glyphicon glyphicon-chevron-down").addClass("glyphicon glyphicon-chevron-up");
    });

    var opts = dataFormat.loadSpinnerOPTS();
    var absUrl = $location.absUrl().split("/");
    var elastic_id = absUrl[absUrl.length - 1];
    var data = { 'elastic_id': elastic_id };

    $scope.histogram_startdate;
    $scope.histogram_enddate;
    $scope.idNot;

    $scope.startdate;
    $scope.enddate;
    $scope.articulos;
    $scope.total_pages;
    $scope.actual_page = 1;
    $scope.page_init;
    $scope.page_end;
    $scope.size = 3;
    $scope.busy = true;
    $scope.id_not;

    $scope.medias = [];
    $scope.press_source = [];
    $scope.press_media_groups = [""];
    $scope.selectedMediumGroup = $scope.press_media_groups[0];
    $scope.category = staticData.getCategoryList();
    //Default values
    $scope.selectedMedium = [];
    $scope.selectedMediumGroup;
    $scope.selectedCategory = $scope.category[0];
    $scope.twitter = "";

    $scope.articles_by_media = [];
    $scope.stackData = [];
    $scope.stacktype = "count";

    $scope.validateTotalFound = function () {
        if ($scope.total_found <= 10000) {
            return true;
        }
        else {
            return false;
        }
    }

    function loadPressMediaGroups(data) {
        PressMedia.getPressMediaGroups().then(function (response) {
            $scope.press_media_groups = response.data.names;
            $scope.press_media_groups.unshift("");
            $scope.selectedMediumGroup = $scope.press_media_groups[0];
            $scope.loadPressMedia(data);
        });
    }


    $scope.loadPressMedia = function (data) {
        PressMedia.getPressMediaList().then(function (response) {
            $scope.press_source = response.data;
            var empty = { media_id: "", media_name: "", media_twitter: "" };
            $scope.press_source.unshift(empty);
            $scope.selectedMedium = empty;
            $scope.restoreSession(data);
        });
    }

    $scope.searchOptionList = [
        { key: "Titular y Contenido", value: ["art_title", "art_content"] },
        { key: "Titular", value: ["art_title"] },
        { key: "Contenido", value: ["art_content"] }
    ]

    $scope.sortGroup = [
        { key: "Tiempo", value: "art_date" },
        { key: "Relevancia", value: "_score" }
    ]
    $scope.selectedSort = $scope.sortGroup[0];

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
        $scope.actual_page = page;
        $scope.update_list(page, false);
    }

    $scope.range = function (min, max) {
        var output = [];
        for (var i = min; i <= max; i++) {
            output.push(i);
        }
        return output;
    }

    $scope.checkbox = {
        art_title: false,
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
                "fields": $scope.searchOption.value,
                "art_name_press_source": $scope.selectedMedium.media_twitter,
                "and": tag_values.must_contain_group,
                "or": tag_values.should_contain_group,
                "not_and": tag_values.not_contain_group,
                "dates": { "startdate": $scope.histogram_startdate, "enddate": $scope.histogram_enddate },
                "art_category": $scope.selectedCategory,
                "idNot": $scope.idNot,
                "pre_owner": $scope.selectedMediumGroup
            },
            "checkbox": $scope.checkbox
        }
        ExportData.save(json_data, opts);
    }

    $scope.validateExport = function () {
        if (($scope.checkbox.art_title == true ||
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

    $scope.backToTop = function () {
        window.scrollTo(0, 0);
    }

    $scope.loadNextItems = function () {
        $('#loadIcon').removeClass("hidden");
        page = $scope.actual_page + 1;
        $scope.busy = true;
        if (page <= $scope.total_pages) {
            var twitter = $scope.selectedMedium.media_twitter;
            var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
            var json_data = {
                "index": "articles",
                "fields": $scope.searchOption.value,
                "and": tag_values.must_contain_group,
                "or": tag_values.should_contain_group,
                "not_and": tag_values.not_contain_group,
                "dates": { "startdate": $scope.startdate, "enddate": $scope.enddate },
                "art_name_press_source": twitter,
                "art_category": $scope.selectedCategory,
                "pre_owner": $scope.selectedMediumGroup,
                "sort": $scope.selectedSort.value
            }

            Articles.getArticlesList(json_data, page).then(function (data) {
                for (var x = 0; x < data.results.length; x++) {
                    $scope.articulos.push(data.results[x]);
                }
                $scope.total_pages = parseInt(data.totalpages);
                $scope.actual_page = parseInt(data.page);

                var range = dataFormat.get_pagination_range($scope.actual_page, $scope.size, $scope.total_pages);
                $scope.page_init = range.page_init;
                $scope.page_end = range.page_end;
                $scope.busy = false;
                $('#loadIcon').addClass("hidden");
            });
        }
        else {
            $('#loadIcon').addClass("hidden");
        }
    }

    NewsCases.getNewsCaseInfo(data).then(function (response) {
        loadPressMediaGroups(response.data);
    })

    $scope.restoreSession = function (data) {
        //Restore what the user searched
        for (x in $scope.searchOptionList) {
            if (JSON.stringify($scope.searchOptionList[x].value) == JSON.stringify(data.news_case_data.new_fields)) {
                $scope.searchOption = $scope.searchOptionList[x];
            }
        }

        if (data.follow_new_feed == 'true') {
            histogram_startdate = String(data.news_case_data.new_date_from.slice(0, 10));
            histogram_enddate = new Date().toISOString().slice(0, 10);
            $("#datepicker1").datepicker('update', histogram_startdate);
            $("#datepicker2").datepicker('update', histogram_enddate);
        }

        else {
            histogram_startdate = String(data.news_case_data.new_date_from.slice(0, 10));
            histogram_enddate = String(data.news_case_data.new_date_to.slice(0, 10));
            $("#datepicker1").datepicker('update', histogram_startdate);
            $("#datepicker2").datepicker('update', histogram_enddate);

        }

        var new_or = dataFormat.getTagList(data.news_case_data.new_or);
        var new_and = dataFormat.getTagList(data.news_case_data.new_and);
        var new_not = dataFormat.getTagList(data.news_case_data.new_not);
        should_contain.add(new_or);
        must_contain.add(new_and);
        not_contain.add(new_not);

        for (var a = 0; a < $scope.press_source.length; a++) {
            if ($scope.press_source[a].media_twitter == data.news_case_data.new_press_source) {
                $scope.selectedMedium = $scope.press_source[a];
                break;
            }
        }

        $scope.selectedCategory = data.news_case_data.new_category;
        //$scope.selectedMedium.media_twitter = data.news_case_data.new_press_source;
        $scope.selectedMediumGroup = data.news_case_data.new_pre_owner;
        $scope.update_list(1, true);
    }

    $scope.loadHistogram = function (selected, update_stack_data) {

        var date1 = $("#datepicker1").datepicker('getDate');
        var date2 = $("#datepicker2").datepicker('getDate');

        $scope.histogram_startdate = date1.toISOString().slice(0, 10) + " 00:00:00";
        $scope.histogram_enddate = date2.toISOString().slice(0, 10) + " 23:59:59";

        $scope.granularity = selected;
        $scope.twitter = $scope.selectedMedium.media_twitter;
        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);

        var json_data = $scope.makeSearchQuery($scope.histogram_startdate, $scope.histogram_enddate);
        json_data.idNot = $scope.idNot;

        var g1 = 'day';
        var g2 = 'hour';

        var data1 = {
            startdate: $scope.histogram_startdate,
            enddate: $scope.histogram_enddate,
            countby: g1,
            search: JSON.stringify(json_data)
        };

        var data2 = {
            startdate: $scope.histogram_startdate,
            enddate: $scope.histogram_enddate,
            countby: g2,
            search: JSON.stringify(json_data)
        };

        if (update_stack_data == true) {
            Articles.getArticlesCountBy(data1).then(function (data) {
                $("#histogram").empty();
                var min_chart_data = data;
                Articles.getArticlesCountBy(data2).then(function (data) {
                    var chart_data = data;
                    var histograma = generate_histogram(width = ($scope.windowsWidth - 85), height = 300,
                        min_chart_data = min_chart_data, chart_data = chart_data, min_granularity = g1, chart_granularity = g2);
                })
            })
        }


    }

    $scope.restoreHistogram = function (update_stack_data) {
        var date1 = $("#datepicker1").datepicker('getDate');
        var date2 = $("#datepicker2").datepicker('getDate');
        $scope.histogram_startdate = date1.toISOString().slice(0, 10) + " 00:00:00";
        $scope.histogram_enddate = date2.toISOString().slice(0, 10) + " 23:59:59";

        $scope.windowsWidth = $window.innerWidth;
        $scope.granularity = 'hour';
        //Draw Histogram for first time
        $scope.loadHistogram($scope.granularity, update_stack_data);
    }

    $scope.update_list = function (page, update_stack_data) {
        $scope.upda_st = update_stack_data;
        NewsCases.getRemovedArticles(data).then(function (response) {
            $scope.idNot = response.data.news_case_data.new_art_not;
            $scope.restoreHistogram($scope.upda_st);
            $scope.loadElements($scope.idNot, page, $scope.upda_st);
        });
    }


    $scope.loadElements = function (idNot, page, update_stack_data) {

        $scope.actual_page = page;
        $scope.idNot = idNot;

        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);

        var json_data = $scope.makeSearchQuery($scope.startdate, $scope.enddate);
        json_data.idNot = idNot;

        $scope.busy = true;
        Articles.getArticlesList(json_data, $scope.actual_page).then(function (data) {

            $scope.articulos = data.results;
            $scope.total_pages = parseInt(data.totalpages);
            $scope.actual_page = parseInt(data.page);
            $scope.total_found = parseInt(data.total);
            $scope.articles_by_media = data.articles_by_media;

            /* Charge initial $scope.medias */
            for (var j = 0; j < $scope.medias.length; j++) {
                $scope["mark" + $scope.medias[j]] = false;
            }
            $scope.medias = [];
            if ($scope.articles_by_media.length > 10) {
                for (var i = 0; i < 10; i++) {
                    $scope.medias.push($scope.articles_by_media[i]['key']);
                }
            } else {
                for (var i = 0; i < $scope.articles_by_media.length; i++) {
                    $scope.medias.push($scope.articles_by_media[i]['key']);
                }
            }
            for (var j = 0; j < $scope.medias.length; j++) {
                $scope["mark" + $scope.medias[j]] = true;
            }
            $("#piechart").empty();
            var chart_w = (($scope.windowsWidth / 3) - 40);
            var pie_chart = generate_chart($scope.articles_by_media, chart_w, $scope.total_found, $scope.medias);

            var range = dataFormat.get_pagination_range($scope.actual_page, $scope.size, $scope.total_pages);
            $scope.page_init = range.page_init;
            $scope.page_end = range.page_end;
            $scope.busy = false;

            var json_data2 = $scope.makeSearchQuery($scope.histogram_startdate, $scope.histogram_enddate);
            json_data2.idNot = idNot;

            var data1 = {
                countby: 'day',
                search: JSON.stringify(json_data2)
            };


            if (update_stack_data == true) {
                Articles.getStackBarData(data1).then(function (data) {
                    $scope.stackData = data;
                    $("#stackedbar").empty();
                    var stackedbar = generate_stackedbar($scope.stackData.total_by_media,
                        $scope.stackData.total_by_day,
                        $scope.medias,
                        $scope.stacktype,
                        ($scope.windowsWidth));
                })
            }

        })

    }

    $scope.update_histogram = function () {
        var date1 = $("#datepicker1").datepicker('getDate');
        var date2 = $("#datepicker2").datepicker('getDate');

        $scope.histogram_startdate = date1.toISOString().slice(0, 10) + " 00:00:00";
        $scope.histogram_enddate = date2.toISOString().slice(0, 10) + " 23:59:59";

    }
    //Controler for advancesearch button.
    $scope.get_input_data = function () {
        //set day as default
        $scope.granularity = 'hour';
        $scope.update_histogram();
        $scope.update_list(1, true);
        $scope.loadHistogram($scope.granularity);
    }

    $scope.update_news_case = function (newsCaseName) {

        var date1 = $("#datepicker1").datepicker('getDate');
        var date2 = $("#datepicker2").datepicker('getDate');

        $scope.histogram_startdate = date1.toISOString().slice(0, 10) + " 00:00:00";
        $scope.histogram_enddate = date2.toISOString().slice(0, 10) + " 23:59:59";

        $scope.news_case_name = newsCaseName[0][0];
        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        $scope.twitter = $scope.selectedMedium.media_twitter;

        var checked = $('#toogleCase').prop('checked');

        var json_data = {
            "fields": $scope.searchOption.value,
            "elastic_id": elastic_id,
            "art_name_press_source": $scope.selectedMedium[0],
            "and": tag_values.must_contain_group,
            "or": tag_values.should_contain_group,
            "not_and": tag_values.not_contain_group,
            "dates": { "startdate": $scope.histogram_startdate, "enddate": $scope.histogram_enddate },
            "category": $scope.selectedCategory,
            "press_source": $scope.twitter,
            "new_name": $scope.news_case_name,
            "pre_owner": $scope.selectedMediumGroup,
            "follow_new_feed": checked
        }

        NewsCases.updateNewsCase(json_data).then(function (response) {
            $scope.news_case_name = "";
            toastr.success("Caso noticioso actualizado con éxito");
        })
    }

    $scope.loadModal = function (article_id) {

        var data = { art_id: article_id[0][0] };
        $http({
            method: 'POST',
            url: '/articles/modal_new',
            data: $.param(data)
        }).then(function successCallback(response) {
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

    $scope.removeArticle = function (id) {

        data = {
            elastic_id: elastic_id,
            article_id: id[0][0]
        }

        NewsCases.removeArticle(data).then(function (response) {
            //$scope.update_list($scope.actual_page, false);
            $scope.articulos.splice($scope.articulos.findIndex(function (d) {
                return d.art_id == data.article_id;
            }), 1);
        })
    }

    $scope.add_media = function (media) {

        var i = $scope.medias.indexOf(media[0][0]);
        if (i !== -1) {
            $scope.medias.splice(i, 1);
            $scope["mark" + media[0][0]] = false;
        } else {
            $scope.medias.push(media[0][0]);
            $scope["mark" + media[0][0]] = true;
        }

        $("#piechart").empty();
        var chart_w = (($scope.windowsWidth / 3) - 40);
        var pie_chart = generate_chart($scope.articles_by_media, chart_w, $scope.total_found, $scope.medias);

        $("#stackedbar").empty();
        var stackedbar = generate_stackedbar($scope.stackData.total_by_media,
            $scope.stackData.total_by_day,
            $scope.medias,
            $scope.stacktype,
            ($scope.windowsWidth));
    }

    $scope.stackChange = function (type) {
        $scope.stacktype = type;
        $("#stackedbar").empty();
        var stackedbar = generate_stackedbar($scope.stackData.total_by_media,
            $scope.stackData.total_by_day,
            $scope.medias,
            $scope.stacktype,
            ($scope.windowsWidth));
    }

    $scope.stackBarBrushChange = function (start, end) {
        $scope.startdate = start;
        $scope.enddate = end;
        $scope.update_list(1, false);
    }


    $scope.makeSearchQuery = function (startdate, enddate) {
        var twitter = $scope.selectedMedium.media_twitter;
        var tag_values = dataFormat.get_tag_values(should_contain, must_contain, not_contain);
        var json_data = {
            "index": "articles",
            "fields": $scope.searchOption.value,
            "and": tag_values.must_contain_group,
            "or": tag_values.should_contain_group,
            "not_and": tag_values.not_contain_group,
            "dates": { "startdate": startdate, "enddate": enddate },
            "art_name_press_source": twitter,
            "art_category": $scope.selectedCategory,
            "pre_owner": $scope.selecteMediumGroup,
            "sort": $scope.selectedSort.value
        }
        return json_data;
    }

    /* Export Image Secction */
    $scope.exportImageFormat = "PNG";
    $scope.exportImage = function (format) {
        ExportData.exportImage(format);
    }

    $scope.clearSearch = function () {
        should_contain.removeAll();
        must_contain.removeAll();
        not_contain.removeAll();
    }

}]);