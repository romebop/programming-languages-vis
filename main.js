var margin = {top: 50, right: 100, bottom: 100, left: 100},
  width = 800 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

var chart = d3.select('#chart')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// compute the set of all paradigms in the data set
d3.json('data.json', function(error, dataset) {

  var allParadigms = _.map(dataset, function(d) {
    return d['paradigms'];
  });

  allParadigms = _.flatten(allParadigms);
  allParadigms = _.uniq(allParadigms);

  // add all paradigms to HTML select element
  d3.select('body').select('#paradigmSelect').selectAll('option').data(allParadigms).enter().append('option')
    .text(function(d){ return d; })
    .attr('value', function(d){ return d; });

  var selected_paradigm = allParadigms[0];

  // code for interaction with paradigm selection
  document.getElementById('paradigmSelect').onchange = function () {

    var selected_paradigm = this.value;

    // filter dataset according to selected paradigm membership
    var filtered_data = dataset.filter(function(d) {
      return d['paradigms'].indexOf(selected_paradigm) > -1;
    });

    var x_min = d3.min(filtered_data, function(d) { return d['year']} );
    var x_max = d3.max(filtered_data, function(d) { return d['year']} );
    var x_length = x_max - x_min;
    var x_buffer = x_length ? x_length * 0.1 : 3;

    var y_min = d3.min(filtered_data, function(d) { return d['nbRepos'] });
    var y_max = d3.max(filtered_data, function(d) { return d['nbRepos'] });
    var y_length = y_max - y_min;
    var y_buffer = 2;

    // set up the scale for x and y dimensions
    var xScale = d3.scale.linear()
      .domain([ x_min - x_buffer, x_max + x_buffer ])
      .range([0, width]);

    var yScale = d3.scale.log()
      .domain([ y_min / y_buffer, y_max * y_buffer ])
      .range([height, 0]);

    // bind circle data here
    var circle = chart.selectAll('circle').data(filtered_data, function(d) {
        return d['name'];
      });

    circle.transition().duration(500).delay(500)
      .attr('cx', function(d) {
        return xScale(d['year']);
      })
      .attr('cy', function(d) {
        return yScale(d['nbRepos']);
      });

    circle.enter().append('circle').style('opacity', 0).transition().duration(500).delay(1000).style('opacity', 1)
      .attr('cx', function(d) {
        return xScale(d['year']);
      })
      .attr('cy', function(d) {
        return yScale(d['nbRepos']);
      })
      .attr('r', 5)
      .attr('fill', '#3498db');

    var name = chart.selectAll('.name').data(filtered_data, function(d){
      return d['name'];
    });

    name.transition().duration(500).delay(500)
      .attr('x', function(d) {
        return xScale(d['year']) + (width * 0.008);
      })
      .attr('y', function(d) {
        return yScale(d['nbRepos']);
      });

    name.enter().append('text').style('opacity', 0).transition().duration(500).delay(1000).style('opacity', 1)
      .text(function(d) {
        return d['name'];
      })
      .attr('x', function(d) {
        return xScale(d['year']) + (width * 0.008);
      })
      .attr('y', function(d) {
        return yScale(d['nbRepos']);
      })
      .attr('font-family', 'sans-serif')
      .attr('font-size', '14px')
      .attr('fill', '#2c3e50')
      .attr('class', 'name');

    circle.exit().transition().duration(500).delay(0).style('opacity', 0).remove();
    name.exit().transition().duration(500).delay(0).style('opacity', 0).remove();

    // axis stuff

    var axis = chart.selectAll('.axis');
    axis.transition().duration(500).delay(500).style('opacity', 0).remove();

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .ticks(7);

    chart.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + height + ')')
      .style('opacity', 0)
      .transition().duration(500).delay(500).style('opacity', 1)
      .call(xAxis);

    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(15);

    chart.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0, 0)')
      .style('opacity', 0)
      .transition().duration(500).delay(500).style('opacity', 1)
      .call(yAxis);

    chart.append('text')
      .attr('text-anchor', 'middle')  // this makes it easy to center the text as the transform is applied to the anchor
      .attr('transform', 'translate(' + -margin.left/1.5 + ',' + (height/2) + ')rotate(-90)')  // text is drawn off the screen top left, move down and out and rotate
      .attr('fill', '#2c3e50')
      .text('Number of Repositories (log scale)');

    chart.append('text')
      .attr('text-anchor', 'middle')  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr('transform', 'translate(' + (width/2) + ',' + (height + (margin.bottom/2)) + ')')  // centre below axis
      .attr('fill', '#2c3e50')
      .text('Year of First Appearance');

  };

  document.getElementById('paradigmSelect').onchange();

});