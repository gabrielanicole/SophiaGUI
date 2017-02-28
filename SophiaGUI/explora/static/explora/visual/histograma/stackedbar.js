function generate_stackedbar(data, total_by_day, medias, type, width) {

    var padding = 1;
    aux_data = [];
    data.forEach(function (d) {
        if (medias.indexOf(d.key) != -1) {
            aux_data.push({ key: d.key, doc_count: d.doc_count, result_over_time: d.result_over_time });
        }
    })
    data = aux_data;

    //Used tp calculate the % by day
    var total_by_day = total_by_day.buckets;
    total_by_day.forEach(function (d) {
        d.key_as_string = new Date(d.key_as_string);
    })

    var sumByMedia = [];
    aux_data.forEach(function (d) {
        d.result_over_time.buckets.forEach(function (d, i) {
            sumByMedia[i] != undefined ? sumByMedia[i] += d.doc_count : sumByMedia[i] = d.doc_count;
        })
    })

    //We create the extra media data copying the first one and modified al values
    function createExtraData(data, sumByMedia, totalByDay) {
        var extramedia = JSON.parse(JSON.stringify(data));
        extramedia = extramedia[0];
        extramedia.key = "otros medios"
        extramedia.doc_count = 0;
        extramedia.result_over_time.buckets = extramedia.result_over_time.buckets.map(function (d, i) {
            return { doc_count: totalByDay[i].doc_count - sumByMedia[i], key: d.key, key_as_string: d.key_as_string }
        })
        return extramedia
    }
    var extradata = createExtraData(data, sumByMedia, total_by_day);
    data.push(extradata);

    //Declare scope => Interact with angular
    var scope = angular.element($("#angularController")).scope();
    var formatDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
    var colorScale = d3.scale.category20c();
    var margin = { top: 20, right: 40, bottom: 50, left: 100 };
    var w =  width - margin.left - margin.right;
    var h = 300 - margin.top - margin.bottom;
    var h2 = h / 2;

    var x = d3.time.scale()
        .range([0, w]);

    var y = d3.scale.linear()
        .range([h, 0])

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(10)
        .tickSize(8, 1)
        .tickPadding(8)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(10)
        .tickPadding(8)
        .tickSize(8, 1)
        .orient("left")

    var max = 0; //vax value to create de y axis and scale
    var data = data.map(function (d) {
        var key = d.key;
        var total_doc = d.doc_count;
        var bucket = d.result_over_time.buckets.map(function (d) {
            d.y >= max ? max = d.y : max = max;
            //Data to bind into each rect
            return {
                'x': new Date(d.key_as_string),
                'y': +d.doc_count, 'stackValue': d.doc_count,
                'key': key,
                'total_doc_by_media': total_doc
            }
        })
        //Add offset for size of the rects
        offdate = new Date(bucket[bucket.length - 1].x);
        offdate.setDate(offdate.getDate() + 1);
        bucket.push({
            'x': offdate,
            'y': +0, 'stackValue': 0,
            'key': key,
            'total_doc_by_media': total_doc
        });
        return { bucket }
    })

    n_e = data[0].bucket.length;
    x.domain([d3.min(data, function (d) { return d.bucket[0].x; }), d3.max(data, function (d) { return d.bucket[d.bucket.length - 1].x; })]);

    function normalizedChart() {
        $("#stackedbar").empty();

        var stacked = d3.select("#stackedbar")
            .append("svg")
            .attr("class", "chart")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        stacked.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "white")
            .attr("style", "stroke:white")
            .attr("transform", "translate(" + -margin.left + "," + -margin.top + ")");

        stacked.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        stacked.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        stacked.select("g.x.axis").call(xAxis);

        delete stack
        stack = d3.layout.stack().offset("expand")(data.map(function (d) {
            return d.bucket
        }));
        y.domain([0, 1]);
        // We make sure y = 0 when real value = 0, in case we have an empty stack.
        stack.forEach(function (datum, index) {
            datum.forEach(function (datum, index) {
                if (datum.stackValue === 0) {
                    datum.y = 0;
                }
            });
        });

        yAxis.ticks(10, "%")
        stacked.select("g.y.axis").call(yAxis);

        // Add a group for each row of data
        var groups = stacked.selectAll("gr")
            .data(stack)
            .enter()
            .append("g")
            .style("fill", function (d, i) {
                return colorScale(i);
            });

        // Add a rect for each data value
        rects = groups.selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter()
            .append("rect")
            .attr("class", "srect")
            .attr("x", function (d, i) {
                return x(d.x);
            })
            .attr("y", function (d) {
                return y(d.y0 + d.y);
            })
            .attr("height", function (d) {
                return y(d.y0) - y(d.y0 + d.y);
            })
            .attr("width", w / (n_e - padding))
            .on("mouseover", function (d) {

                var selected_key = d.key;
                var stackdate = d.x;
                var aux = total_by_day.filter(x => x.key_as_string.getTime() === stackdate.getTime());
                var stacktotal = (parseInt(d.stackValue) / parseInt(aux[0].doc_count)) * 100;
                var total_by_media = d.stackValue;

                d3.selectAll(".srect")
                    .filter(function (f) {
                        return f.key == selected_key;
                    })
                    .attr("stroke-width", 2)
                    .attr("stroke", "red");

                //d3.select(this).atrr("stroke","black");

                scope.$apply(function () {
                    scope.stackmedia = selected_key;
                    scope.stackdate = stackdate.toISOString().slice(0, 10);
                    scope.stacktotal = stacktotal;
                    scope.totalofday = aux[0].doc_count;
                    scope.totalByMedia = total_by_media;
                })
            })
            .on("mouseout", function (d) {
                d3.selectAll(".srect").attr("stroke", "black").attr("stroke-width", 0.5);
            });
    }

    function countChart() {
        $("#stackedbar").empty();

        var stacked = d3.select("#stackedbar")
            .append("svg")
            .attr("class", "chart")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        stacked.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "white")
            .attr("style", "stroke:white")
            .attr("transform", "translate(" + -margin.left + "," + -margin.top + ")");

        stacked.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        stacked.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        stacked.select("g.x.axis").call(xAxis);

        delete stack
        stack = d3.layout.stack().offset("zero")(data.map(function (d) {
            return d.bucket
        }));

        y.domain([0, d3.max(stack, function (d) { return d3.max(d, function (d) { return d.y0 + d.y; }) })])
        stacked.select("g.y.axis").call(yAxis);

        // Add a group for each row of data
        var groups = stacked.selectAll("gr")
            .data(stack)
            .enter()
            .append("g")
            .style("fill", function (d, i) {
                return colorScale(i);
            });

        // Add a rect for each data value
        rects = groups.selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter()
            .append("rect")
            .attr("class", "srect")
            .attr("x", function (d, i) {
                return x(d.x);
            })
            .attr("y", function (d) {
                return y(d.y0 + d.y);
            })
            .attr("height", function (d) {
                return y(d.y0) - y(d.y0 + d.y);
            })
            .attr("width", w / (n_e - padding))
            .on("mouseover", function (d) {

                var selected_key = d.key;
                var stackdate = d.x;
                var aux = total_by_day.filter(x => x.key_as_string.getTime() === stackdate.getTime());
                var stacktotal = (parseInt(d.stackValue) / parseInt(aux[0].doc_count)) * 100;
                var total_by_media = d.stackValue;

                d3.selectAll(".srect")
                    .filter(function (f) {
                        return f.key == selected_key;
                    })
                    .attr("stroke-width", 2)
                    .attr("stroke", "red");

                //d3.select(this).atrr("stroke","black");

                scope.$apply(function () {
                    scope.stackmedia = selected_key;
                    scope.stackdate = stackdate.toISOString().slice(0, 10);
                    scope.stacktotal = stacktotal;
                    scope.totalofday = aux[0].doc_count;
                    scope.totalByMedia = total_by_media;
                })
            })
            .on("mouseout", function (d) {
                d3.selectAll(".srect").attr("stroke", "black").attr("stroke-width", 0.5);
            });
    }

    type == "percent" ? normalizedChart() : countChart();
}