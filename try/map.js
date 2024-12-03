function drawMap(container, geoData, mapData, year, type) {
    const width = 800, height = 600;

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    //Background for Lake
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#87CEEB") 
        .lower();

    //Illinois 
    svg.selectAll(".surrounding")
        .data(surroundingGeoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "#999")
        .attr("fill", "#999");

    //Chicago Police Districts
    svg.selectAll(".chicago")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "#333")
        .attr("fill", "#ccc");

    updateMap(mapData, geoData, year, type, svg);

    return svg;
}

function updateMap(mapData, geoData, year, type, svg) {
    const filteredData = mapData.filter(d => d.year === year && d.contactType === type);

    const counts = new Map(filteredData.map(d => [d.district, d.count]));
    const maxCount = d3.max(filteredData.map(d => d.count)) || 0;
    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, maxCount]);

    svg.selectAll(".chicago")
        .data(geoData.features)
        .join("path")
        .attr("d", d3.geoPath().projection(d3.geoMercator().fitSize([800, 600], geoData)))
        .attr("stroke", "#333")
        .attr("fill", d => {
            const district = +d.properties.dist_num;
            const count = counts.get(district) || 0;
            return colorScale(count);
        })
        .on("mouseover", function (event, d) {
            const district = +d.properties.dist_num;
            const count = counts.get(district) || 0;

            d3.select("#tooltip")
                .style("display", "block")
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`)
                .html(
                    `<strong>District:</strong> ${district}<br>
                     <strong>Stops:</strong> ${count}<br>
                     <strong>Year:</strong> ${year}<br>
                     <strong>Type:</strong> ${type}`
                );
        })
        .on("mouseout", () => d3.select("#tooltip").style("display", "none"));

    addLegend(svg, colorScale, maxCount);
}

function addLegend(svg, colorScale, maxCount) {
    const legendWidth = 250;
    const legendHeight = 10;
  
    //Replace
    svg.selectAll(".legend").remove();
  
    //Legend
    const legendGroup = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(50, 550)`);
  
    //Gradient Legend (cite:https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient/)
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(0)); 
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(maxCount));
  
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
  
    const legendAxis = d3.axisBottom(legendScale).ticks(6);
  
    //Axis
    legendGroup
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis);
  }
  