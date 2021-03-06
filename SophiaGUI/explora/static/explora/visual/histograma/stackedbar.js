function generate_stackedbar(data, total_by_day, medias, type, width) {

    aux_width = parseInt($("#aux_val").css("width"), 10);
    aux_width > 0 ? width = aux_width : width = 884;

    var height = 300;
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
    var margin = { top: 20, right: 60, bottom: 50, left: 50 };
    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;
    var h2 = height / 2 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0, w]);

    var x2 = d3.time.scale()
        .range([0, w]);

    var y = d3.scale.linear()
        .range([h, 0])

    var y2 = d3.scale.linear()
        .range([h2, 0])

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(10)
        .tickSize(8, 1)
        .tickPadding(8)
        .orient("bottom");

    var xAxis2 = d3.svg.axis()
        .scale(x2)
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

    var yAxis2 = d3.svg.axis()
        .scale(y2)
        .ticks(10)
        .tickPadding(8)
        .tickSize(8, 1)
        .orient("left")

    var brush = d3.svg.brush()
        .x(x2)
        .on("brushend", brushed);

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

    m_e = data[0].bucket.length;
    x.domain([d3.min(data, function (d) { return d.bucket[0].x; }), d3.max(data, function (d) { return d.bucket[d.bucket.length - 1].x; })]);
    x2.domain([d3.min(data, function (d) { return d.bucket[0].x; }), d3.max(data, function (d) { return d.bucket[d.bucket.length - 1].x; })]);

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

    var ministack = d3.select("#stackedbar")
        .append("svg")
        .attr("id", "ministack")
        .attr("class", "chart")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h2 + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //.call(zoom);

    var rect = ministack.append("rect")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h2 + margin.top + margin.bottom)
        .style("stroke-width", 0)
        .style("fill", "none")
        .style("pointer-events", "all");

    ministack.append("g")
        .attr("class", "y axis")
        .call(yAxis2);

    ministack.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h2 + ")")
        .call(xAxis2);

    function brushed() {
        var brush_values = brush.extent();

        filtered_data = [];
        data.forEach(function (d, i) {
            var filter_aux = d.bucket.filter(function (d) {
                return d.x >= brush_values[0] && d.x <= brush_values[1];
            })
            filtered_data.push({ bucket: filter_aux });
        })

        filtered_data.forEach(function (d) {
            offdate = new Date(d.bucket[d.bucket.length - 1].x);
            offdate.setDate(offdate.getDate() + 1);
            d.bucket.push({
                'x': offdate,
                'y': +0, 'stackValue': 0,
                'key': d.key,
                'total_doc_by_media': d.total_doc
            });
        })

        stacked.selectAll(".srect").remove();
        stacked.selectAll(".sgroups").remove();

        x.domain([d3.min(filtered_data, function (d) { return d.bucket[0].x; }), d3.max(filtered_data, function (d) { return d.bucket[d.bucket.length - 1].x; })]);
        //x.domain([brush_values[0], brush_values[1]])
        stacked.select("g.x.axis").call(xAxis);

        scope.$apply(function () {
            scope.stackBarBrushChange(String(brush_values[0].toISOString().slice(0, 19)).replace("T", " "),
                String(brush_values[1].toISOString().slice(0, 19)).replace("T", " "));
        })

        type == "percent" ? normalizedChart(filtered_data) : countChart(filtered_data);

    }


    function normalizedChart(data) {
        n_e = data[0].bucket.length;
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
        yAxis2.ticks(5)
        // Add a group for each row of data
        var groups = stacked.selectAll("sgroups")
            .data(stack)
            .enter()
            .append("g")
            .attr("class", "sgroups")
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

                d3.selectAll(".srect").style("opacity", 0.3)
                d3.selectAll(".srect")
                    .filter(function (f) {
                        return f.key == selected_key;
                    })
                    .attr("stroke-width", 0.5)
                    .style("opacity", 0.8);
                d3.select(this).style("opacity", 1);

                scope.$apply(function () {
                    scope.stackmedia = selected_key;
                    scope.stackdate = stackdate.toISOString().slice(0, 10);
                    scope.stacktotal = stacktotal;
                    scope.totalofday = aux[0].doc_count;
                    scope.totalByMedia = total_by_media;
                })
            })
            .on("mouseout", function (d) {
                d3.selectAll(".srect").attr("stroke", "black").attr("stroke-width", 0.5).style("opacity", 1);
            });

        y2.domain([0, d3.max(total_by_day, function (d) { return d.doc_count })])

        stacked.select("g.y.axis").call(yAxis);
        ministack.select("g.y.axis").call(yAxis2);

    }

    function countChart(data) {

        n_e = data[0].bucket.length;
        stacked.select("g.x.axis").call(xAxis);

        yAxis2.ticks(5)

        delete stack
        stack = d3.layout.stack().offset("zero")(data.map(function (d) {
            return d.bucket
        }));

        y.domain([0, d3.max(stack, function (d) { return d3.max(d, function (d) { return d.y0 + d.y; }) })])

        stacked.select("g.y.axis").call(yAxis);
        ministack.select("g.y.axis").call(yAxis2);

        // Add a group for each row of data
        var groups = stacked.selectAll("sgroups")
            .data(stack)
            .enter()
            .append("g")
            .attr("class", "sgroups")
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


                d3.selectAll(".srect").style("opacity", 0.2)
                d3.selectAll(".srect")
                    .filter(function (f) {
                        return f.key == selected_key;
                    })
                    .attr("stroke-width", 0.5)
                    .style("opacity", 0.8);
                d3.select(this).style("opacity", 1);

                scope.$apply(function () {
                    scope.stackmedia = selected_key;
                    scope.stackdate = stackdate.toISOString().slice(0, 10);
                    scope.stacktotal = stacktotal;
                    scope.totalofday = aux[0].doc_count;
                    scope.totalByMedia = total_by_media;
                })
            })
            .on("mouseout", function (d) {
                d3.selectAll(".srect").attr("stroke", "black").attr("stroke-width", 0.5).style("opacity", 1);
            });

        y2.domain([0, d3.max(total_by_day, function (d) { return d.doc_count })])

        stacked.select("g.y.axis").call(yAxis);
        ministack.select("g.y.axis").call(yAxis2);

    }

    type == "percent" ? normalizedChart(data) : countChart(data);

    ministack.selectAll(".stackminibars")
        .data(total_by_day)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.key_as_string);
        })
        .attr("width", function (d) {
            return w / (m_e - padding);
        })
        .attr("y", function (d) { return y2(d.doc_count); })
        .attr("height", function (d) { return h2 - y2(d.doc_count); })
        .style("fill", "#078770");

    ministack.append("g")
        .attr("class", "brush")
        .call(brush)
        .selectAll('rect')
        .attr("height", h2);


}