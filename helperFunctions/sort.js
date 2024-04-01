/*
------------------------
METHOD: sort data to use after a dropdown is selected
------------------------
  */
function sortList(data, property, order) {
    if (order !== 'asc' && order !== 'desc') {
        throw new Error('Invalid sort order. Must be "asc" or "desc"');
    }

    const transformData = (player) => {
        // Check if the player object needs transformation
        if (player.playerId) {
            // Return a new object with the structure expected by your D3 code
            return {
            Country: player.abbrevName,
                abbrevName: player.abbrevName,
                fullName: player.playerFullName,
                lastName: player.player,
                singles: player["1B"],
                doubles: player["2B"],
                triples: player["3B"],
                homeRuns: player["HR"],
                wave1: player['batsHand'],
                wave2: player['throwsHand'],
            };
        }
        // If the player object does not need transformation, return it as is
        return player;
    };

    const sortedList = data.sort((a, b) => {
        // Apply transformation to both a and b
        const transformedA = transformData(a);
        const transformedB = transformData(b);

        // Special case for 'Country' property
        if (property === 'Country') {
            if (order === 'asc') {
                return transformedA[property].localeCompare(transformedB[property]);
            } else {
                return transformedB[property].localeCompare(transformedA[property]);
            }
        }

        // For other properties, convert string to number and compare
        const aValue = Number(transformedA[property]);
        const bValue = Number(transformedB[property]);

        if (order === 'asc') {
            return aValue - bValue;
        } else {
            return bValue - aValue;
        }
    });

    return sortedList;
}

  
  
  /*
  ------------------------
  METHOD: add the button handler to the side panel button
  ------------------------
  */
  function sortDropdownHandler(orderDropdown, globalDataSet) {
    var sortDropdown = d3.select("#sortDropdown");
    let value = sortDropdown.property("value")
    let newData = []
    //first, check if the orderDropdown is set to asc or desc, then call the sort function you created above
    if (orderDropdown.property("value") === "asc") {
      newData = sortList(globalDataSet, value, "asc")
    } else {
      newData = sortList(globalDataSet, value, "desc")
    }
    return newData;
  }
  
  // Exporting variables and functions
  export { sortList, sortDropdownHandler };