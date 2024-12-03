let currentYear = 2016;
let contactType = "INVSTG"; 
let mapData, geoData, svg; 
let surroundingGeoData;

//Data
d3.json("data/IL.geojson").then((geo) => {
    surroundingGeoData = geo;
    if (geoData && mapData) {
      initializeMap(); 
    }
  })

d3.json("data/Police_Districts.geojson").then((geo) => {
    geoData = geo;
    if (surroundingGeoData && mapData) {
      initializeMap(); 
    }
  })

d3.csv("data/clean.csv").then((data) => {
    mapData = data.map((d) => ({
      year: +d.year, 
      contactType: d.contact_type_cd, 
      district: +d.district,
      count: +d.count 
    }));
    if (geoData && surroundingGeoData) {
      initializeMap(); 
    }
  })

//Initialize
function initializeMap() {
  //Default
  svg = drawMap("#map", geoData, mapData, currentYear, contactType);

  //Year slider
  d3.select("#yearSlider").on("input", function () {
    currentYear = +d3.select("#yearSlider").node().value;
    d3.select("#yearDisplay").text(currentYear); 
    updateMap(mapData, geoData, currentYear, contactType, svg); 
  });

  //INVSTG button
  d3.select("#invstgButton").on("click", function () {
    contactType = "INVSTG"; 
    updateMap(mapData, geoData, currentYear, contactType, svg);
  });

  //GANGLTR button
  d3.select("#gangltrButton").on("click", function () {
    contactType = "GANGLTR"; 
    updateMap(mapData, geoData, currentYear, contactType, svg); 
  });
}