function generate_histogram(width, height){


  var parseDate = d3.time.format("%Y-%m-%d").parse,
   formatDate = d3.time.format("%Y");

  var margin = {top:40, right:40, bottom:40, left: 100};
  var margin2 = {top:40, right:40, bottom:20, left:100};

  var w = width - margin.left - margin.right;
  var h = height - margin.top - margin.bottom;
  var h2 = height/2 - margin2.top - margin2.bottom;


  var chart = d3.select("#histograma")
              .append("svg")
              .attr("class","chart")
              .attr("width",w + margin.left + margin.right)
              .attr("height",h + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   var minichart = d3.select("#histograma")
              .append("svg")
              .attr("class","chart")
              .attr("width",w + margin2.left + margin2.right)
              .attr("height",h2 + margin2.top + margin2.bottom)
              .append("g")
              .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


    var x = d3.time.scale()
      //	.ticks(d3.time.day,1)
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
         .attr("x",w/2)
         .attr("y",h+40)
         .style("text-anchor", "middle")
         .text("Fecha");

    chart.append("text")
             .attr("x",-(margin.left - 25))
             .attr("y",h/2)
             .style("text-anchor", "middle")
             .text("Cantidad");

    d3.csv("/static/explora/visual/histograma/readme-flights.csv", function(error, data) {


      var brush = d3.svg.brush()
                        .x(x2)
                        .on("brush",brushed);

      minichart.append("g")
                       .attr("class","brush")
                       .call(brush)
                       .selectAll('rect')
                       .attr("height",h2);


      data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.value = +d.value;
        });

      x.domain([d3.min(data, function(d){ return d.date;}),
                d3.max(data, function(d){ return d.date;})]);

      y.domain([0, d3.max(data, function(d){ return d.value;})]);

      x2.domain([d3.min(data, function(d){ return d.date;}),
                 d3.max(data, function(d){ return d.date;})]);
      y2.domain([0, d3.max(data, function(d){ return d.value;})]);

      chart.select("g.y.axis").call(yAxis);
      chart.select("g.x.axis").call(xAxis);

      minichart.select("g.y.axis").call(yAxis2);
      minichart.select("g.x.axis").call(xAxis2);

      var area = d3.svg.area()
           .x(function(d) { return x2(d.date); })
           .y0(h2)
           .y1(function(d) { return y2(d.value); });

        minichart.append("path")
          .datum(data)
          .attr("class", "area")
          .attr("d", area);

      minichart.append("g")
               .attr("class","brush")
               .call(brush)
               .selectAll('rect')
               .attr("height",h2);

      function brushed(){

          var val = brush.extent();

          x.domain([val[0],val[1]]);

          chart.selectAll(".bar2").remove();

          var ymax = 0;
          chart.selectAll(".bar2")
                  .data(data)
                  .enter()
                  .append("rect")
                  .filter(function(d){
                     return d.date > val[0] && d.date < val[1];
                  })
                  .each(function(d){
                    if (d.value > ymax){
                      ymax = d.value;
                      y.domain([0,ymax]);
                    }
                  })
                  .attr("class", "bar2")
                  .attr("x", function(d) { return x(d.date); })
                  .attr("width", function(d){
                    //Calculate the diference between days
                    var dif = Math.abs(val[0] - val[1]);
                    var days = Math.ceil(dif / (1000 * 3600 * 24));
                    return w/days;
                  })
                  .attr("y", function(d) { return y(d.value); })
                  .attr("height", function(d) { return h - y(d.value); })
                  .on("mouseover",function(d){
                   var coord = [0,0];
                   cord = d3.mouse(this);
                   d3.select(this).style("fill","#66cdaa");
                   d3.select("#tip")
                        .style("left", cord[0]+ "px")
                        .style("top", cord[1]+ "px")
                        .style("opacity", 1);
                    d3.select("#value").text(d.value);
                    d3.select("#tip").select("#date").text(d.date);
                  })
                  .on("mouseout",function(d){
                     d3.select(this).style("fill","#078770");
                     d3.select("#tip")
                     .style("left", 0 + "px")
                     .style("top", 0 + "px")
                     .style("opacity", 0);
                    })
                  .style("fill","#078770");

          chart.select("g.y.axis").call(yAxis);
          chart.select("g.x.axis").call(xAxis);
          }

  });
}
