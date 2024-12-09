let currentYear = 2016;
let contactType = "INVSTG";
let mapData, geoData, svg, surroundingGeoData;

//Load Data
d3.json("Data/IL.geojson").then((geo) => {
  surroundingGeoData = geo;
  if (geoData && mapData) {
    initializeMap();
  }
});

d3.json("Data/Police_Districts.geojson").then((geo) => {
  geoData = geo;
  if (surroundingGeoData && mapData) {
    initializeMap();
  }
});

d3.csv("Data/base_data.csv").then((data) => {
  mapData = data.map((d) => ({
    year: +d.year,
    contactType: d.contact_type_cd,
    district: +d.district,
    count: +d.count,
  }));

  if (geoData && surroundingGeoData) {
    initializeMap();
  }
});

function initializeMap() {
  svg = drawMap("#map", geoData, mapData, currentYear, contactType);

  //Year slider
  d3.select("#yearSlider").on("input", function () {
    currentYear = +d3.select("#yearSlider").node().value;
    d3.select("#yearDisplay").text(currentYear);
    updateMap(mapData, geoData, currentYear, contactType, svg);
  });

  //Buttons
  d3.selectAll("#controls button").on("click", function () {
    //Note: https://www.codecademy.com/resources/docs/d3/interactivity/classed
    d3.selectAll("#controls button").classed("active", false);
    d3.select(this).classed("active", true);

    //Update the contact type
    contactType = d3.select(this).attr("data-type");
    updateMap(mapData, geoData, currentYear, contactType, svg);
  });

  //Highlight the default selected button (Investigatory Stops)
  d3.select("#invstgButton").classed("active", true);
}
