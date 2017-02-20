function generate_histogram(width, height, data, granularity) {

    var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse

    var margin = { top: 20, right: 40, bottom: 50, left: 100 };
    var margin2 = { top: 20, right: 40, bottom: 50, left: 100 };

    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;
    var h2 = height / 2 - margin2.top - margin2.bottom;
    var padding = (granularity == 'day' || granularity == 'hour') ? 1 : 1;

    var chart = d3.select("#histogram")
        .append("svg")
        .attr("id", "selectedHistogram")
        .attr("class", "chart")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    chart.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "white")
        .attr("style", "stroke:white")
        .attr("transform", "translate(" + -margin.left + "," + -margin.top + ")");

    var minichart = d3.select("#histogram")
        .append("svg")
        .attr("id", "miniHistogram")
        .attr("class", "chart")
        .attr("width", w + margin2.left + margin2.right)
        .attr("height", h2 + margin2.top + margin2.bottom)
        .append("g")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    var x = d3.time.scale()
        .range([0, w]);

    var y = d3.scale.linear()
        .range([h, 0]);

    var x2 = d3.time.scale()
        .range([0, w]);

    var y2 = d3.scale.linear()
        .range([h2, 0]);


    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(8, 1)
        .tickPadding(8)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(12)
        .tickPadding(8)
        .tickSize(8, 1)
        .orient("left")

    var xAxis2 = d3.svg.axis()
        .scale(x2)
        .tickSize(5, 1)
        .tickPadding(6)
        .orient("bottom");

    var yAxis2 = d3.svg.axis()
        .scale(y2)
        .ticks(6)
        .tickSize(8, 1)
        .orient("left")

    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis);

    minichart.append("g")
        .attr("class", "y axis")
        .call(yAxis2);

    minichart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h2 + ")")
        .call(xAxis2);

    chart.append("text")
        .attr("x", w / 2)
        .attr("y", h + 40)
        .style("text-anchor", "middle")
        .text("Fecha");

    chart.append("text")
        .attr("x", -(margin.left - 25))
        .attr("y", h / 2)
        .style("text-anchor", "middle")
        .text("Cantidad");

    var brush = d3.svg.brush()
        .x(x2)
        .on("brushend", brushed);

    data.forEach(function (d) {
        d.key_as_string = new Date(d.key_as_string);
        d.doc_count = +d.doc_count;
    });

    data = addBucket(granularity, data);
    var m_e = data.length;

    x.domain([d3.min(data, function (d) { return d.key_as_string; }),
    d3.max(data, function (d) { return d.key_as_string; })]);

    y.domain([0, d3.max(data, function (d) { return d.doc_count; })]);

    x2_min = d3.min(data, function (d) { return d.key_as_string; });
    x2_max = d3.max(data, function (d) { return d.key_as_string; });

    x2.domain([x2_min, x2_max]);

    y2.domain([0, d3.max(data, function (d) { return d.doc_count; })]);

    chart.select("g.y.axis").call(yAxis);
    chart.select("g.x.axis").call(xAxis);

    minichart.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x2(d.key_as_string);
        })
        .attr("width", function (d) {
            console.log(w / (m_e-padding));
            return w / (m_e-padding);
        })
        .attr("y", function (d) { return y2(d.doc_count); })
        .attr("height", function (d) { return h2 - y2(d.doc_count); })
        .style("fill", "#078770");

    minichart.append("g")
        .attr("class", "brush")
        .call(brush)
        .selectAll('rect')
        .attr("height", h2);

    minichart.select("g.y.axis").call(yAxis2);
    minichart.select("g.x.axis").call(xAxis2);

    function default_brush() {

        var mindate = d3.min(data, function (d) { return d.key_as_string; });
        var maxdate = d3.max(data, function (d) { return d.key_as_string; });

        mindate = new Date(mindate);
        maxdate = new Date(maxdate);

        diference = Math.abs(maxdate.getTime() - mindate.getTime());
        daysdif = Math.ceil(diference / (1000 * 3600 * 24));

        date1 = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
        date2 = new Date();

        (daysdif > 7) ? brush.extent([date1, date2]) : brush.extent([mindate, maxdate]);

        brush(d3.select(".brush"));
        brushed();
    }
    default_brush();

    function brushed() {

        var scope = angular.element($("#angularController")).scope();
        var brush_values = brush.extent();

        selected_data = data.filter(function (d) {
            return d.key_as_string >= brush_values[0] && d.key_as_string <= brush_values[1];
        });

        selected_data = addBucket(granularity, selected_data);
        var n_e = selected_data.length;

        x.domain([d3.min(selected_data, function (d) { return d.key_as_string; }),
        d3.max(selected_data, function (d) { return d.key_as_string; })]);

        chart.select("g.y.axis").call(yAxis);
        chart.select("g.x.axis").call(xAxis);

        chart.selectAll(".bar2").remove();

        var ymax = 0;
        var a = chart.selectAll(".bar2")
            .data(selected_data)
            .enter()
            .append("rect")
            .filter(function (d) {
                return d.key_as_string >= brush_values[0] && d.key_as_string <= brush_values[1];
            })
            .each(function (d) {
                if (d.doc_count > ymax) {
                    ymax = d.doc_count;
                    y.domain([0, ymax]);
                }
            })
            .attr("class", "bar2")
            .attr("style", "cursor:pointer")
            .attr("x", function (d) {
                return x(d.key_as_string);
            })
            .attr("width", function (d) {
                return w / (n_e - padding);
            })
            .attr("y", function (d) { return y(d.doc_count); })
            .attr("height", function (d) { return h - y(d.doc_count); })
            .on("mouseover", function (d) {
                cord = d3.mouse(this);
                d3.select(this).style("fill", "#66cdaa");
                d3.select("#tip")
                    .style("left", cord[0] + "px")
                    .style("top", cord[1] + "px")
                    .style("opacity", 1);
                d3.select("#value").text(d.doc_count);
                d3.select("#tip").select("#date").text(d.key_as_string);
            })
            .on("mouseout", function (d) {
                d3.select(this).style("fill", "#078770");
                d3.select("#tip")
                    .style("left", 0 + "px")
                    .style("top", 2000 + "px")
                    .style("opacity", 0);
            })
            .on("click", function (d, i) {
                getDate(JSON.stringify(d.key_as_string), JSON.stringify(a.data()[i + 1].key_as_string));
            })
            .style("fill", "#078770");

        function getDate(date, date2) {
            var aux_format = d3.time.format("%Y-%m-%d %H:%M:%S");
            date = JSON.parse(date);
            date2 = JSON.parse(date2);
            aux_startdate = new Date(date);
            aux_enddate = new Date(date2);
            scope.$apply(function () {
                scope.startdate = aux_format(aux_startdate);
                scope.enddate = aux_format(aux_enddate);
                scope.update_list(1);
            })
        }


        var startdate = String(brush_values[0].toISOString().slice(0, 19)).replace("T", " ");
        var enddate = String(brush_values[1].toISOString().slice(0, 19)).replace("T", " ");

        scope.$apply(function () {
            scope.startdate = startdate;
            scope.enddate = enddate;
            scope.update_list(1);
        })
    }

    function addBucket(granularity, data) {

        if (granularity == 'hour') {
            offdate = new Date(data[data.length - 1].key_as_string);
            offdate.setHours(offdate.getHours() + 1);
            data.push({ doc_count: 0, key_as_string: offdate, key: offdate.getTime() });
        }
        if (granularity == 'day') {
            offdate = new Date(data[data.length - 1].key_as_string);
            offdate.setDate(offdate.getDate() + 1);
            data.push({ doc_count: 0, key_as_string: offdate, key: offdate.getTime() });
        }
        if (granularity == 'month') {
            offdate = new Date(data[data.length - 1].key_as_string);
            offdate.setMonth(offdate.getMonth() + 1);
            data.push({ doc_count: 0, key_as_string: offdate, key: offdate.getTime() });
        }
        if (granularity == 'year') {
            offdate = new Date(data[data.length - 1].key_as_string);
            offdate.setFullYear(offdate.getFullYear() + 1);
            data.push({ doc_count: 0, key_as_string: offdate, key: offdate.getTime() });
        }
        return data;
    }
}
