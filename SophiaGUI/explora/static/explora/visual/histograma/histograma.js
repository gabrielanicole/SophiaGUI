function generate_histogram(width, height, data_json) {

    var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse

    var margin = { top: 20, right: 40, bottom: 50, left: 100 };
    var margin2 = { top: 20, right: 40, bottom: 50, left: 100 };

    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;
    var h2 = height / 2 - margin2.top - margin2.bottom;

    var chart = d3.select("#histogram")
        .append("svg")
        .attr("class", "chart")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var minichart = d3.select("#histogram")
        .append("svg")
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
        .ticks(10)
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

    //The input data is stored in data variable, this should change later...
    data = data_json;
    var m_e = data.length;
    //console.log(m_e);

    data.forEach(function (d) {
        d.key_as_string = d.key_as_string.substring(0, 19);
        d.key_as_string = parseDate(d.key_as_string);
        d.doc_count = +d.doc_count;
    });

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
        .filter(function (d) {
            return d.key_as_string >= x2_min && d.key_as_string <= x2_max;
        })
        .attr("class", "bar")
        .attr("x", function (d) { return x2(d.key_as_string); })
        .attr("width", function (d) {
            return w / (m_e - 1);
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
        brush.extent([new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), new Date()]);
        brush(d3.select(".brush"));
        brushed();
    }
    default_brush();

    function brushed() {

        var brush_values = brush.extent();
        //Cambiar el dominio para que sean solo dentro de los valores del selected data
        //x.domain([brush_values[0],brush_values[1]]);

        selected_data = data.filter(function (d) {
            return d.key_as_string >= brush_values[0] && d.key_as_string <= brush_values[1];
        });

        var n_e = selected_data.length;

        x.domain([d3.min(selected_data, function (d) { return d.key_as_string; }),
        d3.max(selected_data, function (d) { return d.key_as_string; })]);

        chart.selectAll(".bar2").remove();

        var ymax = 0;
        chart.selectAll(".bar2")
            .data(data)
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
            .attr("x", function (d) {
                return x(d.key_as_string);
            })
            .attr("width", function (d) {
                e = Object.keys(d).length;
                return w / (n_e - 1);
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
            .on("click", function (d) {
                console.log(d);
            })
            .style("fill", "#078770");

        chart.select("g.y.axis").call(yAxis);
        chart.select("g.x.axis").call(xAxis);

        var startdate = String(brush_values[0].toISOString().slice(0, 19)).replace("T", " ");
        var enddate = String(brush_values[1].toISOString().slice(0, 19)).replace("T", " ");

        var scope = angular.element($("#angularController")).scope();
        scope.$apply(function () {
            scope.startdate = startdate;
            scope.enddate = enddate;
            scope.update_list(1);
        })
    }
}
