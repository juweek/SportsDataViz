import { showClicked, createSearchResults } from './helperFunctions/searchFilter.js';
import { svgToJpegDownload } from './helperFunctions/takeScreenshot.js';
import { sortList, sortDropdownHandler } from './helperFunctions/sort.js';
import { showTooltip, hideTooltip } from './helperFunctions/tooltip.js';

/*
------------------------
METHOD: set the dimensions of the graph
------------------------
*/
var margin = { top: 10, right: 30, bottom: 0, left: 120 },
    width = 640 - margin.left - margin.right,
    height = 1320 - margin.top - margin.bottom;

var globalDataSet
/*
------------------------
METHOD: append the svg to the body
------------------------
  */
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//select xAxisDiv element from the html page
var xAxisDiv = d3.select("#xAxisDiv");

/*
------------------------
METHOD: //select all the dropdowns 
------------------------
*/
var orderDropdown = d3.select("#orderDropdown");

/*
------------------------
METHOD: //detect the current browser you're using
------------------------
*/
if (navigator.userAgent.includes('Windows')) {
    document.body.classList.add('windows-os');
}

/*
------------------------
METHOD: create the d3 chart. set the y axis to the countries
------------------------
*/
function createChart(svg, data) {

    if (data.length == 0) {
        data = globalDataSet
    }
    // Define the transformation logic as a separate function for clarity
    const transformData = (player) => {

        // Check if the player object needs transformation based on a distinctive property
        if ('playerId' in player) {
            return {
                Country: player.abbrevName,
                abbrevName: player.abbrevName,
                fullName: player.playerFullName,
                lastName: player.player,
                singles: player["1B"],
                doubles: player["2B"],
                triples: player["3B"],
                homeRuns: player["HR"],
                batHand: player['batsHand'],
                throwHand: player['throwsHand'],
            };
        }
        // If the player object does not need transformation, return it as is
        return player;
    };

    // Apply the transformation to each item in the dataset
    data = data.map(transformData);

    //clear out the svg,  set the height relative to the length of the data
    var width = svg.attr("width")
    var height = data.length * 30;
    svg.selectAll("*").remove();


    //change the height of the svg to the height of the data. IS THIS IMPOSSIBLE
    d3.select("#my_dataviz").style("height", (height + 40) + "px");
    d3.select("#my_dataviz svg").attr("height", height + 40);

    // Remove the current x-axis element
    svg.select("#xAxis").remove();
    xAxisDiv.select("#xAxis2").remove();

    // Create a new x-axis element
    var x = d3.scaleLinear()
        .domain([0, 180])
        .range([0, width - 20]);

    // Append the second x-axis to the div element with id "xAxisDiv". make sure it matches the x and y of the first x-axis
    var xAxis2 = d3.axisBottom(x)
        .tickFormat(function (d) {
            return d + "";
        });

    var gX = xAxisDiv.append("g")
        .attr("id", "xAxis2")
        .attr("transform", "translate(" + 120 + ",0)")
        .call(xAxis2);

    // Select all text within the xAxis2 and adjust their position
    gX.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "1em")
        .attr("dy", "1em")
        .attr("font-family", "PT Sans")
        .attr("font-size", "11.5px")

    var graphData = [...data];  // Start with a copy of your original data

    // Y axis
    var y = d3.scaleBand()
        .range([-20, height + 10])
        .domain(graphData.map(function (d) { return d.Country; }))
        .padding(1);

        svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .each(function(d) {
            var matchingObject = data.find(obj => obj.Country === d);
            var fillColor = "#7c7eb6"; // Default fill color
    
            if (matchingObject) {
                fillColor = matchingObject.batHand == 'R' ? "#96557c" : fillColor;
                
                // Assuming you want to set the data-batHand attribute on the rect
                d3.select(this.parentNode)
                  .insert("rect", "text")
                  .attr("x", '-250px')
                  .attr("y", -10)
                  .attr("height", "20px")
                  .attr("width", '250px')
                  .attr('class', 'yaxistextbar')
                  .attr("fill", fillColor)
                  .attr("opacity", 0.2)
                  .attr("data-batHand", matchingObject.batHand); // Set data-batHand attribute
            }

            // clear existing text
            var text = d3.select(this);
            text.text(d);
        })

        .style("text-anchor", "end")
        .attr('class', 'yAxisText')
        .style("font-family", "PT Sans")
        .style("fill", "#333");

    // Append a group to hold the line
    var yAxisLine = svg.append("g");

    // Append the line to the group
    yAxisLine.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height)
        .style("stroke", "black")
        .style("stroke-width", 2);

    // Move the text to the right of the ticks
    yAxisLine.attr("transform", "translate(" + y.bandwidth() + ",0)");

    //create a loop that creates a vertical zebra background for the chart that alternates between grey and white every 10 points on the x axis
    var zebra = 0;
    for (var i = 0; i < 180; i++) {
        svg.append("rect")
            .attr("x", x(i))
            .attr("y", 0)
            .attr("width", x(10))
            .attr("height", height)
            .attr("fill", function () {
                if (zebra == 0) {
                    zebra = 1;
                    return "#F6F2F4";
                } else {
                    zebra = 0;
                    return "#fff";
                }
            });
        i = i + 9;
    }

    //give each line a tooltip
    svg.selectAll("myline")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", function (d) { return x(d.triples); })
        .attr("x2", function (d) { return x(d.singles); })
        .attr("y1", function (d) { return y(d.Country); })
        .attr("y2", function (d) { return y(d.Country); })
        .attr("class", "lineChartElement")
        .attr("data-batHand", function (d) { return d.batHand })
        .attr("stroke-width", "2.3px")
        .style("stroke", "black")
        .on("mouseenter", showTooltip)
        .on("mouseleave", hideTooltip);

    // Rectangles of homeRuns
    svg.selectAll("mycircle")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.homeRuns); })
        .attr("y", function (d) { return y(d.Country) - 8; })
        .attr("width", "4")
        .attr("height", "16")
        .style("fill", "#010101")
        .on("mouseenter", showTooltip)
        .on("mouseleave", hideTooltip);


    // Circles of the triples variable
    svg.selectAll("mycircle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.triples); })
        .attr("cy", function (d) { return y(d.Country); })
        .attr("r", "4")
        .style("fill", "#fff")
        .attr("stroke", "#010101")
        .attr("stroke-width", "2px")
        .on("mouseenter", showTooltip)
        .on("mouseleave", hideTooltip);

    // Circles of the doubles variable
    svg.selectAll("mycircle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.doubles); })
        .attr("cy", function (d) { return y(d.Country); })
        .attr("r", "4")
        .style("fill", "#87322E")
        .on("mouseenter", showTooltip)
        .on("mouseleave", hideTooltip);

    // Circles of the singles variable
    svg.selectAll("mycircle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.singles); })
        .attr("cy", function (d) { return y(d.Country); })
        .attr("r", "4")
        .style("fill", "#C28838")
        .attr("stroke", "#981924")
        .attr("stroke-width", "2px")
        .on("mouseenter", showTooltip)
        .on("mouseleave", hideTooltip);

    //change the height of dataChart to match the height of the svg
    let dataChart = d3.select("#my_dataviz")
    var holderSVG = d3.select("#my_dataviz").select("svg");
    dataChart.attr("height", height)
    dataChart.style("overflow", "scroll-x")
    holderSVG.attr("height", height + 10);
    holderSVG.attr("width", width);
}

/*
------------------------
METHOD: Set up event listeners on both divs to update the scroll position of the other when it's scrolled
------------------------
*/
var myDataviz = document.getElementById("my_dataviz");
var datavizCopy = document.getElementById("datavizCopy");

myDataviz.addEventListener("scroll", function () {
    datavizCopy.scrollTop = myDataviz.scrollTop;
});

datavizCopy.addEventListener("scroll", function () {
    myDataviz.scrollTop = datavizCopy.scrollTop;
});


/*
------------------------
METHOD: create a click event listener for datavizCopy that prints out the graph
------------------------
*/
document.getElementById('downloadButton1').addEventListener('click', function () {
    const svgElement = document.querySelector('#my_dataviz svg');
    svgToJpegDownload(svgElement, 'TruMediaMLBStats.png');
});

/*
------------------------
METHOD: read in the data and create the axes
------------------------
*/
document.addEventListener('DOMContentLoaded', function () {
    const loadData = async () => {
        try {
            const tokenUrl = 'https://project.trumedianetworks.com/api/token';
            const apiUrl = 'https://project.trumedianetworks.com/api/mlb/dataviz-data-aggregate';
            const apiKey = '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d';

            // Fetch temporary token
            const tokenResponse = await fetch(tokenUrl, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'apiKey': apiKey
                }
            });
            if (!tokenResponse.ok) throw new Error('Failed to fetch tempToken');
            const { token: tempToken } = await tokenResponse.json();

            // Fetch data using the temporary token
            const dataResponse = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'temptoken': tempToken
                }
            });
            if (!dataResponse.ok) throw new Error('Failed to fetch MLB data');
            const data = await dataResponse.json();

            // Process and visualize data
            processAndVisualizeData(data);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    loadData();
});

/*
------------------------
METHOD: read in the data and create the axes
------------------------
*/

function processAndVisualizeData(data) {
    // Assuming apiData is an array of objects and needs to be transformed to fit the visualization

    globalDataSet = data.map(player => {
        // Transform each player data into the format expected by your D3 code
        return {
            Country: player.abbrevName,
            abbrevName: player.abbrevName,
            fullName: player.playerFullName,
            lastName: player.player,
            singles: player["1B"],
            doubles: player["2B"],
            triples: player["3B"],
            homeRuns: player["HR"],
            batHand: player['batsHand'],
            throwHand: player['throwsHand'],
        };
    });

    var x = d3.scaleLinear()
        .domain([0, 180])
        .range([0, width]);
    /*
    ------------------------
    METHOD: create the dropdowns that determine if we will sort asc or desc
    ------------------------
    */
    d3.selectAll(".dropdownMenu").on("change", function () {
        let newData = sortDropdownHandler(orderDropdown, globalDataSet)
        globalDataSet = newData
        createChart(svg, newData);
        handleCheckboxChange();
    })

    /*
    ------------------------
    METHOD: Set up event listener for the check box to toggle the visibility of the different waves
    ------------------------
    */
    var checkbox1 = document.getElementById('option1');
    var checkbox2 = document.getElementById('option2');

    function filterDataSet(dataSet, checkbox1, checkbox2) {
        // Case when both checkboxes are unchecked
        if (!checkbox1.checked && !checkbox2.checked) {
            return [];
        }
        // Case when both checkboxes are checked or each one is checked individually
        else if ((checkbox1.checked && checkbox2.checked) || (checkbox1.checked || checkbox2.checked)) {
            // Filter based on which checkboxes are checked
            return dataSet.filter(d => {
                if (checkbox1.checked && checkbox2.checked) {
                    return true; // Return all players when both are checked
                } else if (checkbox1.checked && !checkbox2.checked) {
                    return d.batHand == 'L'; // Return only left-handed players
                } else if (!checkbox1.checked && checkbox2.checked) {
                    return d.batHand == 'R'; // Return only right-handed players
                }
            });
        }
    }
    
    

    checkbox1.addEventListener('change', function () {
        handleCheckboxChange();
    });

    checkbox2.addEventListener('change', function () {
        handleCheckboxChange();
    });

    function handleCheckboxChange() {
        let filteredData = filterDataSet(globalDataSet, checkbox1, checkbox2);
        createChart(svg, filteredData);
    }

    /*
    ------------------------
    METHOD: populate the search input with the list of countries and called createSearchResults whenever an input event is fired
    ------------------------
    */
    //push the doublesercase version of the country into the array
    let players = []
    data.forEach(country => {
        players.push(country.playerFullName.toLowerCase())
    })

    // Get references to the search input and the results dropdown
    const searchInput = document.querySelector('#searchBarSelector');
    const resultsDropdown = document.querySelector('#resultsSelector');
    let currentClickedButtons = [];

    // Add an event listener to the search input that filters the results whenever the input value changes
    searchInput.addEventListener('input', event => {
        const inputValue = event.target.value;
        createSearchResults(data, inputValue, players, resultsDropdown);

        /*
        ------------------------
        SEARCH RESULTS BUTTONS: Select all buttons in the searchResults area. attach a click event listener to each button so, when clicked, it adds the country to the currentlySelectedCountries section, then redraws the chart
        ------------------------
        */
        const searchResultsButtons = d3.selectAll('.resultButton');
        searchResultsButtons.on('click', function () {
            let currentlySelectedCountriesDataset = []
            let button = d3.select(this);

            currentClickedButtons.push(button._groups[0][0].textContent);
            button.classed("resultButtonSelected", true);

            // For each country in currentClickedButtons, go through the data array and find the entry where its Country property matches country
            currentClickedButtons.forEach(function (country) {
                let lowercasePlayerName = country.toLowerCase();
                let index = data.findIndex(d => d.playerFullName.toLowerCase() === lowercasePlayerName);
                currentlySelectedCountriesDataset.push(data[index])
            })

            //call the function to filter the buttons that have been clicked, then call the createChart function
            showClicked(currentClickedButtons, data);

            //attach the click event to the clear selections button that will erase all the buttons. it's made during the showClicked function
            d3.select("#clearSelections")
                .on("click", function () {
                    //remove the buttons from the div
                    d3.select("#searchBarResults").selectAll("*").remove();
                    createChart(svg, data);
                    globalDataSet = data;
                    currentlySelectedCountriesDataset = data;
                    currentClickedButtons = [];
                    d3.selectAll('.resultButton').classed('resultButtonSelected', false);
                    d3.select('.dropdownMenu').dispatch('change');
                    handleCheckboxChange();
                })

            createChart(svg, currentlySelectedCountriesDataset);
            globalDataSet = currentlySelectedCountriesDataset;
            d3.select('.dropdownMenu').dispatch('change');
            handleCheckboxChange();

            /*
             ------------------------
             SELECTED COUNTRIES BUTTONS: Select all buttons in the selectedCountries area. attach a click event listener to each button so, when clicked, it removes the country from the currentlySelectedCountries section, then redraws the chart
             ------------------------
             */
            const selectedResultsButtons = d3.selectAll('.selectedCountry');
            selectedResultsButtons.on('click', function () {

                //get the name of the current button clicked
                let currentCountryButton = d3.select(this);
                let currentCountryButtonName = currentCountryButton._groups[0][0].textContent;

                // Remove the currently selected country from the currentClickedButtons list
                let index = currentClickedButtons.indexOf(currentCountryButtonName);
                if (index > -1) {
                    currentClickedButtons.splice(index, 1);
                }
    
                //Remove the country that was clicked from the currentlySelectedCountriesDataset 
                let currentlySelectedCountriesDataset = [];
                console.log(data)
                currentClickedButtons.forEach(function (country) {
                    var newlyTransformedData = data.map(item => {
                        return {
                            Country: item.playerFullName, // Assuming you want to use playerFullName for country comparison
                            abbrevName: item.abbrevName,
                            fullName: item.playerFullName,
                            lastName: item.player,
                            singles: item["1B"],
                            doubles: item["2B"],
                            triples: item["3B"],
                            homeRuns: item["HR"],
                            batHand: item['batsHand'],
                            throwHand: item['throwsHand'],
                        };
                    });
                    let index = newlyTransformedData.findIndex(d => 
                        d.Country.trim().toLowerCase() === country.trim().toLowerCase());
                    currentlySelectedCountriesDataset.push(newlyTransformedData[index]);
                })

                //Remove the currently selected country from the currentlySelectedCountries section
                const selectedElements = document.querySelectorAll('.selectedCountry');
                selectedElements.forEach(element => {
                    if (element.id.includes(currentCountryButtonName)) {
                        element.remove();
                    }
                });

                //remove '.resultButtonSelected' class from the button in the results div'
                let searchBarResults = document.querySelectorAll('.resultButton');
                for (let i = 0; i < searchBarResults.length; i++) {
                    if (searchBarResults[i].id == currentCountryButtonName) {
                        searchBarResults[i].classList.remove('resultButtonSelected');
                    }
                }

                //if currentlySelectedCountries is empty, redraw createChart with the data from the data array
                if (currentlySelectedCountriesDataset.length != 0) {
                    createChart(svg, currentlySelectedCountriesDataset);
                    globalDataSet = currentlySelectedCountriesDataset;
                    d3.select('.dropdownMenu').dispatch('change');
                    handleCheckboxChange();
                } else {
                    createChart(svg, data);
                    globalDataSet = data;
                    //remove the #clearSelections button
                    d3.select("#clearSelections").remove()
                    d3.select('.dropdownMenu').dispatch('change');
                    handleCheckboxChange();
                }
            })
        })
    })


    /*
  ------------------------
  CLICK EVENT TO CLOSE SEARCH RESULTS: Listen for clicks on the entire document
  ------------------------
  */
    let ignoreNextDocumentClick = false;

    // Existing code for the 'focus' event on searchInput
    searchInput.addEventListener('focus', function () {
        resultsDropdown.style.display = 'block'; // Adjust as per your CSS
        ignoreNextDocumentClick = true;  // Set the flag
    });

    // Existing code for the 'click' event on document
    document.addEventListener('click', function (event) {
        if (ignoreNextDocumentClick) { // If the flag is set, do not hide the dropdown
            ignoreNextDocumentClick = false; // Reset the flag
            return;
        }

        const isClickInsideSearchBar = searchInput.contains(event.target);
        const isClickInsideResults = resultsDropdown.contains(event.target);
        const isResultButton = event.target.classList.contains('selectedCountry');

        // If clicked outside search bar, resultsDropdown, or a resultButton, hide the dropdown
        if (!isClickInsideSearchBar && !isClickInsideResults && !isResultButton) {
            resultsDropdown.style.display = 'none';
        }
    });

    /*
    ------------------------
    METHOD: make width the half the size of the viewport width, until it gets down to mobile, where it should be 100% of the width
    ------------------------
    */
    function reportWindowSize() {
        if (window.innerWidth > 968) {
            width = 640;
            height = 900;
        }
        else if (window.innerWidth > 728) {
            width = 520;
            height = 900;
        }
        else {
            width = window.innerWidth - 60;
            height = 900;
        }
        //set the new width and height of the svg, set the new width and height of the x-axis
        svg.attr("width", width)
        svg.attr("height", height);
        xAxisDiv.attr("width", width)
        xAxisDiv.attr("height", 50);
        createChart(svg, globalDataSet);
        handleCheckboxChange();
    }

    window.onresize = reportWindowSize;
    //fire resize event on load
    reportWindowSize();
};