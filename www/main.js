let currentYear = 2016;
let contactType = "INVSTG";
let mapData, geoData, svg, surroundingGeoData;
let maxCountInvestg, maxCountGangltr;
let colorScaleInvestg, colorScaleGangltr;

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

  //Global Maximum for INVSTG and GANGLTR
  maxCountInvestg = d3.max(mapData.filter((d) => d.contactType === "INVSTG"), (d) => d.count);
  maxCountGangltr = d3.max(mapData.filter((d) => d.contactType === "GANGLTR"), (d) => d.count);

  colorScaleInvestg = d3.scaleSequential(d3.interpolateReds).domain([0, maxCountInvestg]);
  colorScaleGangltr = d3.scaleSequential(d3.interpolateReds).domain([0, maxCountGangltr]);

  if (geoData && surroundingGeoData) {
    initializeMap();
  }
});

function initializeMap() {
  svg = drawMap("#map", geoData, mapData, currentYear, contactType);

  addLegend(svg, getColorScale(), getMaxCount());

  //Year slider
  d3.select("#yearSlider").on("input", function () {
    currentYear = +d3.select("#yearSlider").node().value;
    d3.select("#yearDisplay").text(currentYear);
    updateMap(mapData, geoData, currentYear, contactType, svg);
  });

  //Buttons
  d3.selectAll("#controls button").on("click", function () {
    d3.selectAll("#controls button").classed("active", false);
    d3.select(this).classed("active", true);

    //Update the contact type
    contactType = d3.select(this).attr("data-type");
    updateMap(mapData, geoData, currentYear, contactType, svg);
  });

  //Highlight the default selected button (Investigatory Stops)
  d3.select("#invstgButton").classed("active", true);
}

//Helper functions
function getColorScale() {
  return contactType === "INVSTG" ? colorScaleInvestg : colorScaleGangltr;
}

function getMaxCount() {
  return contactType === "INVSTG" ? maxCountInvestg : maxCountGangltr;
}
