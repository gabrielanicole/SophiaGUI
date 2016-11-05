function generate_histogram(width, height, data_json){


  var parseDate = d3.time.format("%Y-%m-%d").parse

  var margin = {top:20, right:40, bottom:50, left: 100};
  var margin2 = {top:20, right:40, bottom:50, left:100};

  var w = width - margin.left - margin.right;
  var h = height - margin.top - margin.bottom;
  var h2 = height/2 - margin2.top - margin2.bottom;

  var chart = d3.select("#histogram")
              .append("svg")
              .attr("class","chart")
              .attr("width",w + margin.left + margin.right)
              .attr("height",h + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   var minichart = d3.select("#histogram")
              .append("svg")
              .attr("class","chart")
              .attr("width",w + margin2.left + margin2.right)
              .attr("height",h2 + margin2.top + margin2.bottom)
              .append("g")
              .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    var x = d3.time.scale()
        .range([0, w]);

    var xordinal = d3.scale.ordinal()
              .rangeRoundBands([0, w], 0, 0);

    var x2ordinal = d3.scale.ordinal()
              .rangeRoundBands([0, w], 0, 0);

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
         .attr("x",w/2)
         .attr("y",h+40)
         .style("text-anchor", "middle")
         .text("Fecha");

    chart.append("text")
             .attr("x",-(margin.left - 25))
             .attr("y",h/2)
             .style("text-anchor", "middle")
             .text("Cantidad");



    var brush = d3.svg.brush()
                     .x(x2)
                     .on("brushend",brushed);

      //The input data is stored in data variable, this should change later...
      data = data_json;

      //Using ordinal for rangeBand
      x2ordinal.domain(data.map(function(d) {
          return d.key_as_string;
      }))

      data.forEach(function(d) {
            d.key_as_string = d.key_as_string.substring(0, 10);
            d.key_as_string = parseDate(d.key_as_string);
            d.doc_count = +d.doc_count;
        });

      x.domain([d3.min(data, function(d){ return d.key_as_string;}),
                d3.max(data, function(d){ return d.key_as_string;})]);

      y.domain([0, d3.max(data, function(d){ return d.doc_count;})]);


      x2_min = d3.min(data, function(d){ return d.key_as_string;});
      x2_max = d3.max(data, function(d){ return d.key_as_string;});
      x2.domain([x2_min,x2_max]);

      y2.domain([0, d3.max(data, function(d){ return d.doc_count;})]);

      chart.select("g.y.axis").call(yAxis);
      chart.select("g.x.axis").call(xAxis);


      minichart.append("g")
               .attr("class","brush")
               .call(brush)
               .selectAll('rect')
               .attr("height",h2);

      minichart.selectAll(".bar")
              .data(data)
              .enter()
              .append("rect")
              .filter(function(d){
                 return d.key_as_string >= x2_min && d.key_as_string < x2_max;
              })
              .attr("class", "bar")
              .attr("x", function(d) { return x2(d.key_as_string); })
              .attr("width", function(d){ //Change here for days, month, seconds, etc.
                         //Calculate the diference between days
                         return x2ordinal.rangeBand();
                       })
               .attr("y", function(d) { return y2(d.doc_count); })
               .attr("height", function(d) { return h2 - y2(d.doc_count); })
               .style("fill","#078770");

      minichart.select("g.y.axis").call(yAxis2);
      minichart.select("g.x.axis").call(xAxis2);

      minichart.append("g")
               .attr("class","brush")
               .call(brush)
               .selectAll('rect')
               .attr("height",h2);


      function brushed(){

          var brush_values = brush.extent();

          //Cambiar el dominio para que sean solo dentro de los valores del selected data
          //x.domain([brush_values[0],brush_values[1]]);

          selected_data = data.filter(function(d){
             return d.key_as_string >= brush_values[0] && d.key_as_string < brush_values[1];
          });
          xordinal.domain(selected_data.map(function(d) {
              return d.key_as_string;
          }))

          x.domain([d3.min(selected_data, function(d){ return d.key_as_string;}),
                    d3.max(selected_data, function(d){ return d.key_as_string;})]);

          chart.selectAll(".bar2").remove();

          var ymax = 0;
          chart.selectAll(".bar2")
                  .data(data)
                  .enter()
                  .append("rect")
                  .filter(function(d){
                     return d.key_as_string >= brush_values[0] && d.key_as_string < brush_values[1];
                  })
                  .each(function(d){
                    if (d.doc_count > ymax){
                      ymax = d.doc_count;
                      y.domain([0,ymax]);
                    }
                  })
                  .attr("class", "bar2")
                  .attr("x", function(d) { return x(d.key_as_string); })
                  .attr("width", function(d){
                     return xordinal.rangeBand();
                  })
                  .attr("y", function(d) { return y(d.doc_count); })
                  .attr("height", function(d) { return h - y(d.doc_count); })
                  .on("mouseover",function(d){

                   cord = d3.mouse(this);
                   d3.select(this).style("fill","#66cdaa");
                   d3.select("#tip")
                        .style("left",cord[0] - 100  + "px")
                        .style("top", cord[1] - 100 + "px")
                        .style("opacity", 1);
                    d3.select("#value").text(d.doc_count);
                    d3.select("#tip").select("#date").text(d.key_as_string);
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


          //brush brush_values converted into date format yyyy-MM-dd
          var startdate = brush_values[0].toISOString().slice(0,10);
          var enddate = brush_values[1].toISOString().slice(0,10);

          //Get the CSRF taken from Django documentation
          //https://docs.djangoproject.com/en/1.8/ref/csrf/#ajax

          function getCookie(name) {
              var cookieValue = null;
              if (document.cookie && document.cookie != '') {
                  var cookies = document.cookie.split(';');
                  for (var i = 0; i < cookies.length; i++) {
                      var cookie = jQuery.trim(cookies[i]);
                      // Does this cookie string begin with the name we want?
                      if (cookie.substring(0, name.length + 1) == (name + '=')) {
                          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                          break;
                      }
                  }
              }
              return cookieValue;
          }
          var csrftoken = getCookie('csrftoken');

          var opts = {
            lines: 15 // The number of lines to draw
          , length: 23 // The length of each line
          , width: 8 // The line thickness
          , radius: 15 // The radius of the inner circle
          , color: '#18bc9c' // #rgb or #rrggbb or array of colors
          , className: 'spinner' // The CSS class to assign to the spinner
          , position: 'relative'
         }

          var target = document.getElementById('spinner');
          var spinner = new Spinner(opts).spin(target);

          $.ajax({
          	    url: 'get_data/articles/articles-list',
          	    type: 'POST',
                data:{startdate: startdate,
                      enddate: enddate,
                      csrfmiddlewaretoken: csrftoken },
          	    success: function(data) {
                        $('#article-list').remove();
                        $('#articles-container').append(data);
                        spinner.stop();
          				    },
          				    failure: function(data) {
          				        alert('Error de conexión');
          				    },
          				    crossDomain: true
          });
    }
}
