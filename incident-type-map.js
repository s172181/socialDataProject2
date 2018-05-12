//Width and height
var w = 600;
var h = 500;
               
//Create SVG element
var svg = d3.select("#mapgraph2")
            .append("svg")
            .attr("width", w)
            .attr("height", h);
            
function getSortedKeys(obj) {
    var keys = []; for(var key in obj) keys.push(key);
    return keys.sort(function(a,b){return obj[b]-obj[a]});
}

var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S"); //convert strings to dates in Date format
//var formatDate = d3.timeFormat("%Y-%m-%d %H:%M:%S"); // and vice versa
var unitsNumbers = function(row){
            return{
                INCIDENT_DATE_TIME: parseDate(row.INCIDENT_DATE_TIME),
                ZIP_CODE: row.ZIP_CODE,
                UNITS_ONSCENE: +row.UNITS_ONSCENE
            }   
        }
// Load the csv and get out the max UNITS_ONSCENE per ZIP_CODE via some magic
var maxunitsdata;
d3.csv("full_csv_year_files/2017full.csv", unitsNumbers, function(data){
    maxunitsdata = d3.nest()
        .key(function(d){return d.ZIP_CODE;})
        .rollup(function(d){
            return d3.max(d, function(g){return g.UNITS_ONSCENE;});
        }).entries(data);
        loaddatamap();
})

//Load in GeoJSON data
function loaddatamap () {
d3.json("nyc-zip-code.json", function(json) {

    var center = d3.geoCentroid(json); // need this to center the projection correctly

    var projection = d3.geoMercator()
                    .center(center)
                    .scale(50000)
                    .translate([(w) / 2, (h)/2]);

    var path = d3.geoPath() //translating GeoJSON coordinates into SVG path codes
            .projection(projection);
            
    
    // Define the div for the tooltip
    var div = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);
    //Bind data and create one path per GeoJSON feature
    //Each one of these Features represents a NYC zip code
    //This attribute, d, contains a series of commands and parameters in the SVG Path Mini-Language.
    var nymap = svg.selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "#EF6C00")
       .style("opacity",function(d) {
           //Get data value
           var value = d.properties.postalCode;
           try{
             var units = maxunitsdata.find(ab=>ab.key === value.toString()).value;
           }
           catch (e){
            //zipcode is not in the maxunitsdata for the currently selected dataset
            //so no info available, set units to 0 to have white colored zone
            units = 0;
           }
           return (units/10000)*120;
       })
    .on("mouseover", function(d) {      
        div.transition()        
            .duration(200)      
            .style("opacity", .9);
        //Here we add what we what to put on the tip
        var value = d.properties.postalCode;
        var units;
        try{
          units = maxunitsdata.find(ab=>ab.key === value.toString()).value;
        }
        catch (e){
            //zipcode is not in maxunitsdata - it's fine, just go on
        }
        div .html("<h3>Zip code</h3>"+d.properties.postalCode+"<br>"+"<h3>Max num of units on scene</h3>"
                    +units) 
            .style("left", (d3.event.pageX) + "px")     
            .style("top", (d3.event.pageY - 28) + "px");    
       // this.style("fill", "#909090");
        var currentState = this;
        d3.select(this).style('fill', "#e1e1e1");
        d3.select(this).style('stroke', "#333333");
        d3.select(this).style('stroke-opacity',  "1");
        })            
    .on("mouseout", function(d) {       
        div.transition()        // I have uncommented these lines as tooltips did not otherwise disappear...
            .duration(350)      
            .style("opacity", 0);   
        var currentState = this;
        var value = d.properties.postalCode;
        var units;
        try{
          units = maxunitsdata.find(ab=>ab.key === value.toString()).value;
        }
        catch (e){
            //zipcode is not in maxunitsdata - set units to 0 to have white colored zone
            units = 0;
        }
        d3.select(this).style('stroke', "none");
        d3.select(this).style('opacity',  (units/10000)*120);
        d3.select(this).style('fill', "#EF6C00");
    });
       
   
    

});
}