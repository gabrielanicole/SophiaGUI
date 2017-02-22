function generate_chart(data, width, total_found) {
    var width = width,
        height = 300,
        radius = Math.min(width, height) / 2;

    data = data.slice(0, 10);
    var sum = 0;
    data.forEach(function(d){
        sum = sum + d.doc_count;
    })
    var dif = total_found - sum;
    data.push({key:"otros medios", doc_count:dif});
    var colorScale = d3.scale.category20c();

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelArc = d3.svg.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40)

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) { return d.doc_count; });

    var svg = d3.select("#piechart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function (d) {
            return colorScale(d.data.doc_count); })
        .style("opacity",0.6)
        .on("mouseover", function(d){
            d3.select(this).style("opacity",0.7);
        })
        .on("mouseout", function(d){
            d3.select(this).style("opacity",0.5);
        });

    g.append("text")
        .attr("transform", function (d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text(function (d) { return d.data.key; })

}