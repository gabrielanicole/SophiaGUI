
var width = $(window).width();
var height = $(window).height();;

$("#mapid").height(549);
$("#mapid").width(width - 63);

$(function () {
    $("body").on("shown.bs.tab", "#maptab", function () {
        map.invalidateSize(false);
    });
});

var map = new L.Map("mapid", { center: [0, 0], zoom: 2 })
    .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

var color = d3.scale.linear()
    .domain([0, 100])
    .range(["yellow", "red"]);

var transform = d3.geo.transform({ point: projectPoint }),
    path = d3.geo.path().projection(transform);

$.get("articles/getGeoJSON/", function (collection) {

    var feature = g.selectAll("path")
        .attr("pointer-events", "all")
        .data(collection.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill-opacity", 0.2)
        .attr("stroke", "#fff")
        .attr("stroke-width", "1.5px")
        .attr("pointer-events", "all")
        .attr("fill", function () {
            return color(Math.floor(Math.random() * 100));
        })
        .on("mouseover", function (d, i) {
            //var asd = Math.floor(Math.random() * 100)
            d3.select(this).style("fill-opacity", .4);
        })
        .on("mouseout", function (d, i) {
            d3.select(this).style("fill-opacity", .2);
        });

    map.on("zoomend", reset);
    reset();
    // Reposition the SVG to cover the features.
    function reset() {
        var bounds = path.bounds(collection),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        feature.attr("d", path);
    }
});



