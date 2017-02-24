function generate_stackedbar(data) {

    /*
        data = []
        var mediaNameList = [];
        input.forEach(function (d) {
            d.articlesByPressMedia.buckets.forEach(function (d) {
                mediaNameList.indexOf(d.key) != -1 ? {} : mediaNameList.push(d.key);
            })
            data.push({
                'total': d.doc_count,
                'date': new Date(d.key_as_string),
                'buckets': d.articlesByPressMedia.buckets
            });
        }) */

    var colorScale = d3.scale.category20c();
    var w = 800;
    var h = 300;
    var margin = { top: 20, right: 30, bottom: 50, left: 50 }

    var stacked = d3.select("#stackedbar")
        .append("svg")
        .attr("id", "selectedHistogram")
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


    var x = d3.time.scale()
        .range([0, w]);

    var y = d3.scale.linear()
        .range([h, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(10)
        .tickSize(8, 1)
        .tickPadding(8)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(10, "%")
        .tickPadding(8)
        .tickSize(8, 1)
        .orient("left")

    stacked.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    stacked.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis);

    //y.domain([0, d3.max(data, function (d) { return d.total; })]);
    //

    var data = data.map(function (d) {
        var bucket = d.result_over_time.buckets.map(function (d) {
            return { 'x': new Date(d.key_as_string), 'y': d.doc_count }
        })
        return { bucket }
    })

    n_e = data[0].bucket.length - 1;
    x.domain([d3.min(data, function (d) { return d.bucket[0].x; }), d3.max(data, function (d) { return d.bucket[d.bucket.length - 1].x; })]);
    //y.domain([0, d3.max(data, function (d) { return d.total; })]);
    stacked.select("g.x.axis").call(xAxis);

    var stack = d3.layout.stack();
    stack(data.map(function (d) {
        return d.bucket
    }));

}