// Naive K-Means

d3.csv("data/public_schools_short.csv", d => ({
    lon: +d.LON,
    lat: +d.LAT
  })).then(rawData => {
    const width        = 800,
          height       = 600,
          naiveMeansSvg          = d3.select("#naive-means-svg"),

          // naive k-Means controls
          kNaiveMeansInput      = d3.select("#k-naive-means"),
          resetNaiveMeansBtn    = d3.select("#reset-naive-means"),
          finishNaiveMeansBtn = d3.select("#finish-naive-means"),
          nextNaiveMeansBtn     = d3.select("#next-naive-means"),
          playNaiveMeansBtn     = d3.select("#play-naive-means"),
          pauseNaiveMeansBtn    = d3.select("#pause-naive-means");
    const projection = d3.geoAlbersUsa()
                         .translate([width/2, height/2])
                         .scale(1000);
    const color = d3.schemeCategory10;

    // function to cluster data points based on closest centroid (used to assign colors later)
    function clusterData(data, centroids) {
      data.forEach(p => {
        let best = 0, bestDist = Infinity;
        centroids.forEach((c,i) => {
          const dx = p.x - c.x,
                dy = p.y - c.y,
                dist = dx*dx + dy*dy;
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        p.cluster = best;
      });
      return data;
    }

    const data = rawData
      .map(d => {
        const xy = projection([d.lon, d.lat]);
        return xy ? { x: xy[0], y: xy[1] } : null;
      })
      .filter(d => d);
      
    // --- Naive k-Means implementation ---
    

    let centroids,
      k = +kNaiveMeansInput.property("value"),
      intervalId = null,
      intervalDelay = 700;
      naiveData      = data.slice(0, 50),
      allCombos = null,
      stepIndex      = 0,
      bestAverage     = Infinity,
      bestCenters    = null;
    
    
    function distance(a,b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function kCombinations(arr,k) {
      if (k===0) return [[]];
      if (!arr.length) return [];
      const [f,...rest] = arr;
      const withF = kCombinations(rest, k-1).map(c=>[f,...c]);
      return withF.concat(kCombinations(rest, k));
    }
    
    // function to calculate average 

    // goal of naive k-means is to minimize the sum of squared distances 
    // of every point to its closest centroid

    // this function calculates and returns that value for a given set of points and centroids
    function getAverageSquaredDistance(points, centroids) {
      let totalDistance = 0;
      points.forEach(p => {
        let minDistance = Infinity;
        centroids.forEach(c => {
          const d = distance(p, c);
          if (d < minDistance) {
            minDistance = d;
          }
        });
        totalDistance += (minDistance * minDistance); // square the distance
      });
      return totalDistance / points.length; // average squared distance
    } 

    // draws the points and centroids on the svg
    // optional ability to draw average distance around centroids
    function draw(svg, data, centroids, average) {
      const color = d3.schemeCategory10;
  
      // Points
      svg.selectAll("circle.point").remove();
      svg.selectAll("circle.point")
         .data(data)
         .join("circle")
           .attr("class","point")
           .attr("r",3)
           .attr("cx", d=>d.x)
           .attr("cy", d=>d.y)
           .attr("fill", d=>color[d.cluster]);
      
      console.log("drew points");
      // Centroids
      svg.selectAll("circle.centroid").remove();
      svg.selectAll("circle.centroid")
         .data(centroids)
         .join("circle")
           .attr("class","centroid")
           .attr("r",8)
           .attr("cx", d=>d.x)
           .attr("cy", d=>d.y)
           .attr("fill", (_,i)=>color[i]);
      
      // Optional radius of average distance around centroids
      svg.selectAll("circle.average").remove();
      if (average){
        console.log("drew average distance");
        svg.selectAll("circle.average")
           .data(centroids)
           .join("circle")
             .attr("class","average")
             .attr("r", average)
             .attr("cx", d=>d.x)
             .attr("cy", d=>d.y)
             .attr("stroke", "black")
             .attr("fill", "none");
      }

      console.log(naiveMeansSvg);
      console.log("centroids,", centroids);
      console.log(data);
    }

    function initNaiveMeans() {
      resetNaiveMeans();
      draw(naiveMeansSvg, naiveData, bestCenters);  // no centers
      console.log("Naive means initialized");
      }
  
    function stepNaiveMeans(drawStep=true) {
      if (stepIndex >= allCombos.length) {
        console.log("Finished naive means");
        if (intervalId) clearInterval(intervalId), intervalId = null;
        playNaiveMeansBtn.attr("disabled", null);
        pauseNaiveMeansBtn.attr("disabled", true);
        return  
        }
      
      const combo = allCombos[stepIndex++];
      const averageSquaredDistance = getAverageSquaredDistance(naiveData, combo);
      if (averageSquaredDistance < bestAverage) bestAverage = averageSquaredDistance, bestCenters = combo;
      // square root of average squared distance
      const avgDistance = Math.sqrt(averageSquaredDistance);
      clusterData(naiveData, combo);
      if (drawStep){
        draw(naiveMeansSvg, naiveData, combo, avgDistance);
      }
      d3.select("#step-naive-means").text(`${stepIndex} / ${allCombos.length}`);
      d3.select("#avg-distance-naive-means").text(averageSquaredDistance.toFixed(2));
      d3.select("#best-average-naive-means").text(bestAverage.toFixed(2));
    }

    function resetNaiveMeans(){
      k = +kNaiveMeansInput.property("value");
      stepIndex = 0;
      console.log("k", k);
      allCombos = kCombinations(naiveData, k);
      bestAverage = Infinity;
      bestCenters = [];
      draw(naiveMeansSvg, naiveData, []);  // no centers
      d3.select("#step-naive-means").text(`0 / ${allCombos.length}`);
      d3.select("#avg-distance-naive-means").text("N/A");
      d3.select("#best-average-naive-means").text("N/A");
    }

    function finishNaiveMeans(){ 
      resetNaiveMeans();
      for (let i = 0; i < allCombos.length; i++) {
        console.log("step," + i);
        stepIndex = i;
        stepNaiveMeans(false);
    }

    console.log("Finished naive means");
    clusterData(naiveData, bestCenters);
    draw(naiveMeansSvg, naiveData, bestCenters, Math.sqrt(bestAverage));
    d3.select("#step-naive-means").text(`${stepIndex} / ${allCombos.length}`);
    d3.select("#avg-distance-naive-means").text(bestAverage.toFixed(2));
    d3.select("#best-average-naive-means").text(bestAverage.toFixed(2));
    }
  
    initNaiveMeans();

    // event listeners
    resetNaiveMeansBtn.on("click", initNaiveMeans);

    finishNaiveMeansBtn.on("click", finishNaiveMeans);
    nextNaiveMeansBtn.on("click", () => {
      stepNaiveMeans();
    });
    playNaiveMeansBtn.on("click", () => {
      if (intervalId) return;
      intervalId = setInterval(stepNaiveMeans, intervalDelay);
      playNaiveMeansBtn.attr("disabled", true);
      pauseNaiveMeansBtn.attr("disabled", null);
    });

    pauseNaiveMeansBtn.on("click", () => {
      if (intervalId) clearInterval(intervalId), intervalId = null;
      playNaiveMeansBtn.attr("disabled", null);
      pauseNaiveMeansBtn.attr("disabled", true);
    });
  })
  


// ----- (1) Lloyd’s k-Means & Naive k-Centers -----
d3.csv("data/public_schools_short.csv", d => ({
    lon: +d.LON,
    lat: +d.LAT
  })).then(rawData => {
    const width        = 800,
          height       = 600,
          svg    = d3.select("#lloyd-svg"),
          // k-Means controls
          kInput       = d3.select("#k"),
          resetBtn     = d3.select("#reset"),
          nextBtn      = d3.select("#next"),
          playBtn      = d3.select("#play"),
          pauseBtn     = d3.select("#pause"),
          // Naive k-Centers controls & svg
          naiveSvg         = d3.select("#naive-svg"),
          kNaiveInput      = d3.select("#k-naive"),
          resetNaiveBtn    = d3.select("#reset-naive"),
          stepZeroNaiveBtn = d3.select("#step-zero-naive"),
          nextNaiveBtn     = d3.select("#next-naive"),
          playNaiveBtn     = d3.select("#play-naive"),
          pauseNaiveBtn    = d3.select("#pause-naive");
  
    const projection = d3.geoAlbersUsa()
                         .translate([width/2, height/2])
                         .scale(1000);
  
    function clusterData(data, centroids) {
      data.forEach(p => {
        let best = 0, bestDist = Infinity;
        centroids.forEach((c,i) => {
          const dx = p.x - c.x,
                dy = p.y - c.y,
                dist = dx*dx + dy*dy;
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        p.cluster = best;
      });
      return data;
    }
  
    const data = rawData
      .map(d => {
        const xy = projection([d.lon, d.lat]);
        return xy ? { x: xy[0], y: xy[1] } : null;
      })
      .filter(d => d);
  
    // --- Lloyd’s k-Means implementation ---
    let centroids,
        intervalId   = null,
        intervalDelay= 700;
  
    function init() {
      const k = +kInput.property("value");
      centroids = d3.shuffle(data)
                    .slice(0, k)
                    .map(d => ({ x: d.x, y: d.y }));
      draw(svg, clusterData(data, centroids), centroids);
    }
  
    function step() {
      data.forEach(p => {
        let best = 0, bestDist = Infinity;
        centroids.forEach((c,i) => {
          const dx = p.x - c.x,
                dy = p.y - c.y,
                dist = dx*dx + dy*dy;
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        p.cluster = best;
      });
      centroids = centroids.map((c,i) => {
        const members = data.filter(p => p.cluster === i);
        return {
          x: d3.mean(members, p => p.x),
          y: d3.mean(members, p => p.y)
        };
      });
      draw(svg, data, centroids);
    }
  
    function draw(svg, data, centroids, maxPair) {
      const color = d3.schemeCategory10;
  
      // Points
      svg.selectAll("circle.point").remove();
      svg.selectAll("circle.point")
         .data(data)
         .join("circle")
           .attr("class","point")
           .attr("r",3)
           .attr("cx", d=>d.x)
           .attr("cy", d=>d.y)
           .attr("fill", d=>color[d.cluster]);
  
      // Centroids
      svg.selectAll("circle.centroid").remove();
      svg.selectAll("circle.centroid")
         .data(centroids)
         .join("circle")
           .attr("class","centroid")
           .attr("r",8)
           .attr("cx", d=>d.x)
           .attr("cy", d=>d.y)
           .attr("fill", (_,i)=>color[i]);
  
      // Optional max-pair highlight
      svg.selectAll("line.max-pair").remove();
      svg.selectAll("circle.max-pair-point").remove();
      if (maxPair) {
        svg.append("line")
           .attr("class", "max-pair")
           .attr("x1", maxPair.point.x)
           .attr("y1", maxPair.point.y)
           .attr("x2", maxPair.center.x)
           .attr("y2", maxPair.center.y)
           .attr("stroke", "red")
           .attr("stroke-width", 2);
        svg.append("circle")
           .attr("class", "max-pair-point")
           .attr("r", 5)
           .attr("cx", maxPair.point.x)
           .attr("cy", maxPair.point.y)
           .attr("stroke", "black")
           .attr("stroke-width", 1);
      }
    }
  
    resetBtn.on("click", () => { stopAuto(); init(); });
    nextBtn.on("click", () => { stopAuto(); step(); });
    playBtn.on("click", () => {
      if (intervalId) return;
      intervalId = setInterval(step, intervalDelay);
      playBtn.attr("disabled", true);
      pauseBtn.attr("disabled", null);
    });
    pauseBtn.on("click", stopAuto);
    function stopAuto() {
      if (intervalId) clearInterval(intervalId), intervalId = null;
      playBtn.attr("disabled", null);
      pauseBtn.attr("disabled", true);
    }
  
    init();
    console.log('initializing lloyds')
  
    // --- Naive k-Centers demo ---
    let naiveData      = data.slice(0, 50),
        naiveCentroids,
        allCombos,
        stepIndex      = 0,
        bestRadius     = Infinity,
        bestCenters    = null;
  
    function distance(a,b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }
    function kCombinations(arr,k) {
      if (k===0) return [[]];
      if (!arr.length) return [];
      const [f,...rest] = arr;
      const withF = kCombinations(rest, k-1).map(c=>[f,...c]);
      return withF.concat(kCombinations(rest, k));
    }
    function maxDistToCenters(sd, centers) {
      let maxD = -Infinity, pair=null;
      sd.forEach(p => {
        let minD=Infinity, nc=null;
        centers.forEach(c => {
          const d = distance(p,c);
          if (d < minD) { minD = d; nc = c; }
        });
        if (minD > maxD) { maxD = minD; pair = {point:p, center:nc}; }
      });
      return { maxDistance: maxD, maxPair: pair };
    }
    function bruteForceSearch(sd,k) {
      const combos = kCombinations(sd, k);
      let br=Infinity, bc=null;
      combos.forEach(c => {
        const r = maxDistToCenters(sd, c).maxDistance;
        if (r < br) { br = r; bc = c; }
      });
      sd.forEach(p => {
        let md=Infinity, idx=-1;
        bc.forEach((c,i) => {
          const d = distance(p,c);
          if (d < md) { md=d; idx=i; }
        });
        p.cluster = idx;
      });
      return bc;
    }
  
    function initNaive() {
      const k = +kNaiveInput.property("value");
      allCombos = kCombinations(naiveData, k);
      bestCenters = bruteForceSearch(naiveData, k);
      draw(naiveSvg, naiveData, bestCenters);
      d3.select("#total-points-naive").text(naiveData.length);
      d3.select("#num-clusters-naive").text(k);
      d3.select("#step-naive").text(`Finished: ${allCombos.length} combinations`);
    }
    function stepZeroNaive(){
      stepIndex = 0;
      const k = +kNaiveInput.property("value");
      allCombos = kCombinations(naiveData, k);
      bestRadius = Infinity;
      bestCenters = [];
      draw(naiveSvg, naiveData, []);  // no centers
      d3.select("#step-naive").text(`0 / ${allCombos.length}`);
      d3.select("#max-distance-naive").text("N/A");
      d3.select("#best-distance-naive").text("N/A");
      d3.select("#total-points-naive").text(naiveData.length);
      d3.select("#num-clusters-naive").text(k);
    }
    function stepNaive(){
      const combo = allCombos[stepIndex++];
      const { maxDistance, maxPair } = maxDistToCenters(naiveData, combo);
      if (maxDistance < bestRadius) bestRadius = maxDistance, bestCenters = combo;
      naiveData.forEach(p => {
        let md=Infinity, ci=-1;
        combo.forEach((c,i) => {
          const d=distance(p,c);
          if (d<md) { md=d; ci=i; }
        });
        p.cluster = ci;
      });
      draw(naiveSvg, naiveData, combo, maxPair);
      d3.select("#step-naive").text(`${stepIndex} / ${allCombos.length}`);
      d3.select("#max-distance-naive").text(maxDistance.toFixed(2));
      d3.select("#best-distance-naive").text(bestRadius.toFixed(2));
    }
  
    resetNaiveBtn.on("click", initNaive);
    stepZeroNaiveBtn.on("click", stepZeroNaive);
    nextNaiveBtn.on("click", stepNaive);
    playNaiveBtn.on("click", () => {
      if (intervalId) return;
      intervalId = setInterval(stepNaive, intervalDelay);
      playNaiveBtn.attr("disabled", true);
      pauseNaiveBtn.attr("disabled", null);
    });

    pauseNaiveBtn.on("click", () => {
      if (intervalId) clearInterval(intervalId), intervalId = null;
      playNaiveBtn.attr("disabled", null);
      pauseNaiveBtn.attr("disabled", true);
    });
  
    initNaive();
  });
  
  // ----- (2) Gonzalez’s k-Centers -----
  d3.csv("data/public_schools_short.csv", d=>({lon:+d.LON,lat:+d.LAT}))
    .then(rawData => {
      const width   = 800,
            height  = 600,
            svg     = d3.select("#gonzalez-svg"),
            resetBtn= d3.select("#gonzalez-reset"),
            nextBtn = d3.select("#gonzalez-next");
  
      const projection = d3.geoAlbersUsa()
                           .translate([width/2, height/2])
                           .scale(1000);  
      
      const marginT = { top: 20, right: 20, bottom: 40, left: 70 };
const widthT = 600 - marginT.left - marginT.right;
const heightT = 450 - marginT.top - marginT.bottom;

// Create SVG container with full dimensions
const svgContainer = d3.select("#gonzalez-iteration-graph")
  .attr("width", widthT + marginT.left + marginT.right)
  .attr("height", heightT + marginT.top + marginT.bottom);

const svgTime = svgContainer
  .append("g")
  .attr("transform", `translate(${marginT.left},${marginT.top})`);

// Scales
const xScaleT = d3.scaleLinear()
  .domain([0, 100])
  .range([0, widthT]);

const yScaleT = d3.scaleLinear()
  .domain([0, 10000])
  .range([heightT, 0]);

// Axes
const xAxisT = d3.axisBottom(xScaleT).ticks(5);
const yAxisT = d3.axisLeft(yScaleT).ticks(5);

svgTime.append("g")
  .attr("transform", `translate(0,${heightT})`)
  .call(xAxisT);

svgTime.append("g")
  .call(yAxisT);

// Labels
svgTime.append("text")
  .attr("x", widthT / 2)
  .attr("y", heightT + 35)
  .attr("text-anchor", "middle")
  .attr("font-size", "12px")
  .text("Number of Points");

svgTime.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -heightT / 2)
  .attr("y", -50)
  .attr("text-anchor", "middle")
  .attr("font-size", "14px")
  .attr("fill", "#333")
  .text("Number of Operations");

// Data and line
const dataT = d3.range(0, 101).map(n => ({ n, value: n * n }));

const lineT = d3.line()
  .x(d => xScaleT(d.n))
  .y(d => yScaleT(d.value));

svgTime.append("path")
  .datum(dataT)
  .attr("fill", "none")
  .attr("stroke", "crimson")
  .attr("stroke-width", 2)
  .attr("d", lineT);

      //Point class that is used to store the associated info of every given element in the data

      class Point {
        constructor(x,y,id){
          this.x=x; 
          this.y=y; 
          this.pointId=id;
          this.isCenter=false;
          this.closestCenter=null;
          this.closestCenterDist=Infinity;
          this.furthestPoint=null;
        }
      }
      
  
      const rawPoints = rawData
        .map((d,i)=>{
          const p = projection([d.lon,d.lat]);
          return p ? new Point(p[0],p[1],i) : null;
        })
        .filter(d => d);
  
      let centers=[], count=0, globalFurthest=null, globalFurthestArray = null;

      //Computes the euclidean distance between two elements of the Point class

      function euclidean(point1, point2){
        return Math.hypot(point1.x - point2.x, point1.y - point2.y);
      }

      //Updates the MaxDistance of any point, over all points, to its closest center.

      function updateMaxDistance(reset){
        const maxDistance = d3.select("#gonzalez-center-distances");
        maxDistance.text(reset 
          ? "Max distance of all points to nearest center: N/A"
          : `Max distance of all points to nearest center: ${globalFurthest.closestCenterDist.toFixed(2)}`);
      }
  
      //Visualizes a particular iteration in Gonzalez's Algorithm

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    function drawGonzalez() {
       svg.selectAll("circle.point")
          .data(rawPoints)
          .join("circle")
          .attr("class", "point")
          .attr("r", 3)
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("fill", d => {
        const centerIndex = centers.indexOf(d.closestCenter);
        return centerIndex !== -1 ? colorScale(centerIndex) : "black";
    });

  svg.selectAll("circle.center, circle.radius").remove();

  centers.forEach((c, i) => {
    svg.append("circle")
      .attr("class", "center")
      .attr("cx", c.x)
      .attr("cy", c.y)
      .attr("r", 6)
      .attr("fill", colorScale(i));

    if (c.furthestPoint) {
      svg.append("circle")
        .attr("class", "radius")
        .attr("cx", c.x)
        .attr("cy", c.y)
        .attr("r", euclidean(c, c.furthestPoint))
        .attr("stroke", "green")
        .attr("fill", "none");
    }
  });
}
  
      //Resets all the progress of the algorithm and sets everything back to the inital state

      function resetGonzalez(){
        centers=[]; count=0; globalFurthest=null;
        rawPoints.forEach(p => {
          p.isCenter=false;
          p.closestCenter=null;
          p.closestCenterDist=Infinity;
          p.furthestPoint=null;
        });
        drawGonzalez(); 
        updateMaxDistance(true);
      }
  
      //Runs an iteration of Gonzalez's Algorithm

      function stepGonzalez(){
        if(count >= rawPoints.length) {
          return;
        }
        if(count === 0) {
          const first = rawPoints[0];
          first.isCenter=true; 
          centers.push(first);
          let maxPoint = first;
          rawPoints.forEach(p=>{
            p.closestCenter = first;
            p.closestCenterDist = euclidean(first,p);
            if(p.closestCenterDist > maxPoint.closestCenterDist) {
              maxPoint = p;
            }
          });
          first.furthestPoint = maxPoint;
          globalFurthest = maxPoint;
        } else {
          globalFurthest.isCenter=true; centers.push(globalFurthest);
          rawPoints.forEach(p=>{
            const d = euclidean(globalFurthest,p);
            if(d <p.closestCenterDist){
              p.closestCenter = globalFurthest;
              p.closestCenterDist = d ;
            }
          });
          const maxMap = new Map();
          rawPoints.forEach(p =>{
            const c = p.closestCenter;
            if(!maxMap.has(c) || maxMap.get(c).closestCenterDist<p.closestCenterDist){
              maxMap.set(c,p);
            }
          });
          maxMap.forEach((p,c) => c.furthestPoint = p);
          globalFurthest=[...maxMap.values()].reduce((a,b)=>
            a.closestCenterDist>b.closestCenterDist ? a : b
          );
        }
        count++;
        drawGonzalez();
        updateMaxDistance(false);
      }
  
      resetBtn.on("click", resetGonzalez);
      nextBtn.on("click", stepGonzalez);
      drawGonzalez(); 
      updateMaxDistance(true);
    });  