function drawMap(container, geoData, mapData, year, type) {
    const width = 800,
      height = 600;
  
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);
  
    //leftover (which will me the lake)
    svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#87CEEB") //Light blue for the lake but why does it not fill the whole map???
    .lower();
    
    //Illinios
    svg
      .selectAll(".surrounding")
      .data(surroundingGeoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke", "#999")
      .attr("fill", "#999");
  
    //Chicago police districts
    svg
      .selectAll(".chicago")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke", "#333")
      .attr("fill", "#ccc");
  
    //Initialize the map with default data
    updateMap(mapData, geoData, year, type, svg);
    return svg;
  }
  
  
  function updateMap(mapData, geoData, year, type, svg) {
    //Filter data by year and contact type
    const filteredData = mapData.filter(
      (d) => d.year === year && d.contactType === type
    );
  
    console.log("Filtered Data for Year and Type:", filteredData); //Debugging
  
    //Get stop counts by district
    const counts = d3.rollup(
      filteredData,
      (v) => v.length, //number of stops
      (d) => d.district //based on distrct
    );
  
    console.log("Counts by District:", counts); //Debugging
  
    //Choropleth 
    const maxCount = d3.max(Array.from(counts.values())) || 0; 
    const colorScale = d3.scaleSequential(d3.interpolateBuPu).domain([0, maxCount]);
  
    //Update 
    svg
      .selectAll(".chicago")
      .data(geoData.features)
      .join("path") 
      .attr("d", d3.geoPath().projection(d3.geoMercator().fitSize([800, 600], geoData)))
      .attr("stroke", "#333")
      .attr("fill", (d) => {
        const district = +d.properties.dist_num; 
        const count = counts.get(district) || 0; 
        return colorScale(count);
      })

      .on("mouseover", function (d) {
        const district = +d.properties.dist_num;
        const count = counts.get(district) || 0;
      
        const tooltip = d3.select("#tooltip");
        tooltip
          .style("display", "block")
          .style("left", "100px") 
          .style("top", "100px")
          .html(
            `<strong>District:</strong> ${district}<br>
             <strong>Stops:</strong> ${count}<br>
             <strong>Year:</strong> ${year}<br>
             <strong>Type:</strong> ${type}`
          );
      })
      .on("mouseout", function () {
        d3.select("#tooltip").style("display", "none"); 
      });
  
    //Legend
    addLegend(svg, colorScale, maxCount);
  }
  
  function addLegend(svg, colorScale, maxCount) {
    const legendWidth = 300;
    const legendHeight = 10;
  
    const legendGroup = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(50, 550)`); 
  
    //Gradiant Legend
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
  
    //Low and High 
    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(0)); 
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(maxCount)); 
  
    //Legend
    legendGroup
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")
      .style("stroke", "#000");
  
    //Scale
    const legendScale = d3
      .scaleLinear()
      .domain([0, maxCount])
      .range([0, legendWidth]);
  
    const legendAxis = d3.axisBottom(legendScale).ticks(5);
  
    //Axis
    legendGroup
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis);
  }