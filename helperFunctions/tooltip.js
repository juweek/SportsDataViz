/*
------------------------
METHOD: show the tooltip wth the approrpiate info
------------------------
*/
function showTooltip(d) {
    let currentCountry = d.Country;
    let currentSingles = d.singles;
    let currentDoubles = d.doubles;
    let currentHomeRuns = d.homeRuns;
    let currentTriples = d.triples;
    let tooltip = d3.select("#tooltip");

    tooltip.style("display", "block");
    //set the text of html to a summary of the data points
    tooltip.html(`<h3>${currentCountry}</h3>
            <p># Home Runs: ${Math.round(currentHomeRuns)}</p>
            <p># of Triples: ${Math.round(currentTriples)}</p>
            <p># of Doubles: ${Math.round(currentDoubles)}</p>
            <p># of Singles: ${Math.round(currentSingles)}</p>`)
    tooltip.style("left", (d3.event.pageX + 10) + "px")
    tooltip.style("top", (d3.event.pageY - 40) + "px")
    tooltip.style("opacity", 1);
    //remove 'active' from all line elements, then add 'active' to the current line element not using classed
    var svg = d3.select("#my_dataviz")
    svg.selectAll(".lineChartElement").classed("active", false);
    let currentLine = event.target;
    currentLine.classList.add("active");
  }

  function hideTooltip() {
    var svg = d3.select("#my_dataviz")
    let tooltip = d3.select("#tooltip");
    svg.selectAll(".lineChartElement").classed("active", false);
    tooltip.style("display", "none");
  }

  export {showTooltip, hideTooltip};