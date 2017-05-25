app.service('dataFormat', function () {
    this.generate_array = function (data_array) {
        var results = [];
        var match_array = [];
        if (data_array.length > 0) {
            for (i = 0; i < data_array.length; i++) {
                if (data_array[i].indexOf(" ") == -1) {
                    results.push({"match":data_array[i]})
                }
                else {
                    results.push({ "match_phrase": data_array[i] });
                }
            }
        }
        return results;
    }

    this.get_pagination_range = function (actual_page, size, total_pages) {
        var c1 = actual_page;
        var c2 = actual_page;

        for (var a = actual_page; a <= actual_page + size; a++) {
            if (a >= total_pages) {
                c1 = c1;
            }
            else {
                c1++;
            }
        }
        for (var b = actual_page; b >= actual_page - size; b--) {
            if (b <= 1) {
                c2 = c2;
            }
            else {
                c2--;
            }
        }
        return { "page_init": c2, "page_end": c1 };
    }

    this.get_tag_values = function (should_contain, must_contain, not_contain) {

        var should_contain_group = should_contain.getTagValues();
        var must_contain_group = must_contain.getTagValues();
        var not_contain_group = not_contain.getTagValues();

        should_contain_group = this.generate_array(should_contain_group);
        must_contain_group = this.generate_array(must_contain_group);
        not_contain_group = this.generate_array(not_contain_group);

        return {
            "should_contain_group": should_contain_group,
            "must_contain_group": must_contain_group,
            "not_contain_group": not_contain_group
        };
    }

    this.getTagList = function (data) {
        var results = [];
        for (var a = 0; a < data.length; a++) {
            if (data[a].match_phrase != null) {
                results.push(data[a].match_phrase);
            }
            if (data[a].match != null) {
                var words = String(data[a].match).split(" ");
                for (var x in words) {
                    if (words[x] != "") {
                        results.push(words[x]);
                    }
                }
            }
        }
        return results;
    }
    this.loadSpinnerOPTS = function () {
        var opts = {
            lines: 15 // The number of lines to draw
            , length: 34 // The length of each line
            , width: 7 // The line thickness
            , radius: 11 // The radius of the inner circle
            , scale: 0.5 // Scales overall size of the spinner
            , corners: 0.8 // Corner roundness (0..1)
            , color: '#000' // #rgb or #rrggbb or array of colors
            , opacity: 0.25 // Opacity of the lines
            , rotate: 49 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 0.9 // Rounds per second
            , trail: 34 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            , zIndex: 2e9 // The z-index (defaults to 2000000000)
            , className: 'spinner' // The CSS class to assign to the spinner
            , top: '50%' // Top position relative to parent
            , left: '50%' // Left position relative to parent
            , shadow: false // Whether to render a shadow
            , hwaccel: false // Whether to use hardware acceleration
            , position: 'absolute' // Element positioning
        }
        return opts;
    }

});

app.service('staticData', function () {
    this.getCategoryList = function () {
        return ["", "accidentes", "deporte", "ecologia", "economia",
            "entretenimiento", "judicial", "politica", "salud", "tecnologia", "educacion y cultura"];
    }
});