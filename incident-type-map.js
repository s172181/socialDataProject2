function getSortedKeys(obj) {
        var keys = []; for(var key in obj) keys.push(key);
        return keys.sort(function(a,b){return obj[b]-obj[a]});
    }
    function getIncidentNumber(incident_type_desc){
        var strWithoutQuotes = incident_type_desc.replace(/['"]+/g, '');
        return strWithoutQuotes.substr(0,strWithoutQuotes.indexOf(' '));
    }
    function getIncidentDesc(incident_type_desc){
        var strWithoutQuotes = incident_type_desc.replace(/['"]+/g, '');
        return strWithoutQuotes.substr(strWithoutQuotes.indexOf('-')+2);
    }

    //var formatDate = d3.timeFormat("%Y-%m-%d %H:%M:%S"); // and vice versa
    var incidentType = function(row){
                return{
                    INCIDENT_DATE_TIME: row.INCIDENT_DATE_TIME,
                    ZIP_CODE: row.ZIP_CODE,
                    INCIDENT_TYPE_NUM: getIncidentNumber(row.INCIDENT_TYPE_DESC),
                    INCIDENT_TYPE_DESC: getIncidentDesc(row.INCIDENT_TYPE_DESC),
                    INCIDENT_COUNT: row.Group_Count
                }   
            }
    // Load the csv and get incident type with total number of incidents
    var listTypesData;
    var allTypesData = {};
    d3.csv("incident_type_data/incident_type_all_years.csv", incidentType, function(data){
        
        allTypesData['2013'] = data.filter(ab => ab.INCIDENT_DATE_TIME.toString() === "2013");
        allTypesData['2014'] = data.filter(ab => ab.INCIDENT_DATE_TIME.toString() === "2014");
        allTypesData['2015'] = data.filter(ab => ab.INCIDENT_DATE_TIME.toString() === "2015");
        allTypesData['2016'] = data.filter(ab => ab.INCIDENT_DATE_TIME.toString() === "2016");
        allTypesData['2017'] = data.filter(ab => ab.INCIDENT_DATE_TIME.toString() === "2017");
        listTypesData = d3.nest()
            .key(function(d){ return d.INCIDENT_TYPE_NUM; })
            .key(function(d){ return d.INCIDENT_TYPE_DESC; })
            .rollup(function(d){
              return d3.sum(d, function(g){return g.INCIDENT_COUNT;});
            })
            .entries(data);
        // Load list of incident types
        loadTypesData();
//        console.log('max: ', d3.max(allTypesData, function(d) { return d.INCIDENT_COUNT; }));
        loadOneIncidentData();
        displayOneTypeData(0, 0);
    })


    function loadTypesData(){
      var incidentsList = d3.select("#incidentslist")
      //Create bars
      // console.log(listTypesData[0]);
      incidentsList.selectAll("a")
          .data(listTypesData)
          .enter()
          .append("a")
          .attr("class", function(d) { 
            if (parseInt(d.key) == 300) {return "list-group-item active"}
            return "list-group-item" })
          .attr("id", function(d) { return d.key; })
          .text(function(d) { return d.values[0].key; })
          .on("click", function() {
            incidentsList.selectAll("a")
              .attr("class", "list-group-item");
            d3.select(this)
              .attr("class", "list-group-item active");
            d3.select("#selectedtype")
              .attr( "data-value", d3.select(this).attr("id") )
              .text( d3.select(this).text() );
            displayOneTypeData(d3.select(this).attr("id"), 0);
          });
    }

    function loadOneIncidentData(){
      var map2 = d3.select("#incidentslist")
      //Create bars
      // console.log(listTypesData[0]);
      map2.selectAll("a")
          .data(listTypesData)
          .enter()
          .append("a")
          .attr("class", "list-group-item")
          .text(function(d) { return d.key; })
    }

    function displayOneTypeData(id, year){
      if (id == 0){
        var id = document.getElementById("selectedtype").getAttribute("data-value");
      }
      if (year == 0) {
        var year = document.getElementById("listyear2").getElementsByClassName("selected")[0].text;
      } else {
        d3.select("#listyear2").selectAll("a").attr("class", "listyears");
        var ss = "#l" + year;
        d3.select("#listyear2").select(ss).attr("class", "listyears selected");
      }
//      console.log("id: ", id, "year: ", year);
//      console.log(allTypesData);
      loaddatamap20(id, year);

    }


// -------------------------------------------------------------------------------------------------------------------------
// Displaying the map ------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------

    //Width and height
    var w = 600;
    var h = 500;
                   
    //Create SVG element
    var svg2 = d3.select("#mapgraph2")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    // Spinner while the data is loading
    var opts = {
        lines: 9, // The number of lines to draw
        length: 9, // The length of each line
        width: 5, // The line thickness
        radius: 18, // The radius of the inner circle
        color: '#EE3624', // #rgb or #rrggbb or array of colors
        speed: 1.9, // Rounds per second
        trail: 40, // Afterglow percentage
        className: 'spinner', // The CSS class to assign to the spinner
    };
    var targetMap20 = document.getElementById('mapgraph2');
    var spinner20 = new Spinner(opts).spin(targetMap20);

    var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S"); //convert strings to dates in Date format

    console.log(listTypesData);
    // d3.csv("full_csv_year_files/biggestincidentsalltime.csv", unitsNumbers, function(data){
    //  severestdata = data; // much simpler here as all data is already in csv
    // })
    // Define the div for the tooltip
    var div = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);
    var nymap20;
    //Load in GeoJSON data
    function loaddatamap20 (id, year) {
      var dataset20 = allTypesData[year].filter(ab => parseInt(ab.INCIDENT_TYPE_NUM) == parseInt(id) && parseInt(ab.ZIP_CODE) != 99999);
//      console.log('id: ', id);
//      console.log('year: ', year)
//      console.log("res: ", dataset20.find(ab => parseInt(ab.ZIP_CODE) == parseInt("10314") && parseInt(ab.INCIDENT_TYPE_NUM) == parseInt(id)) );

      console.log(dataset20[0].INCIDENT_COUNT);
      console.log(d3.max(dataset20, function(d){ return parseInt(d.INCIDENT_COUNT); }));
      var typesScale = d3.scaleLinear()
          .domain([0, d3.max(dataset20, function(d){ return parseInt(d.INCIDENT_COUNT); })])
          .range([0,1]);

      nymap20 = svg2.selectAll("path");
      if (nymap20.empty()) {
        setNYMap20(dataset20, id, year);
      } else {
        changeNYMap20(dataset20, id, year);
      }

      function setNYMap20(dataset20, id, year){
        d3.json("nyc-zip-code.json", function(json) {
         spinner20.stop();
          var center = d3.geoCentroid(json); // need this to center the projection correctly

          var projection = d3.geoMercator()
          .center(center)
          .scale(50000)
          .translate([(w) / 2, (h)/2]);

          var path = d3.geoPath() //translating GeoJSON coordinates into SVG path codes
          .projection(projection);

          
          
          //Bind data and create one path per GeoJSON feature
          //Each one of these Features represents a NYC zip code
          //This attribute, d, contains a series of commands and parameters in the SVG Path Mini-Language.
          // nymap20 = svg2.selectAll("path");
          nymap20.data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .style("fill", "#EF6C00")
          .style("opacity",function(d) {
                 //Get data value
                 //console.log(dataset20[0].INCIDENT_COUNT);
                 var value = d.properties.postalCode;
                 //console.log('val: ', value, ' , dataset20: ', dataset20.find(x => parseInt(x.ZIP_CODE) === value));
                 try{
                  var units = 0;
                  if (dataset20.find(ab => parseInt(ab.ZIP_CODE) == parseInt(value)) === "undefind")
                    units = 0;
                  else
                    units = dataset20.find(ab => parseInt(ab.ZIP_CODE) == parseInt(value)).INCIDENT_COUNT;
//                  console.log('val: ', value, ' , units: ', dataset20.find(ab => parseInt(ab.ZIP_CODE) == parseInt(value)));
                }
                catch (e){
                    //zipcode is not in the maxunitsdata for the currently selected dataset
                    //so no info available, set units to 0 to have white colored zone
                    units = 0;
                   }
                // return (units/100000)*60;
                return typesScale(units);
              })
          .on("mouseover", function(d) {        
            div.transition()        
            .duration(200)      
            .style("opacity", .9);
              //Here we add what we what to put on the tip
              var value = d.properties.postalCode;
              var units;
              try{
                units = dataset20.find(ab => parseInt(ab.ZIP_CODE) == parseInt(value)).INCIDENT_COUNT;
              }
              catch (e){
                //zipcode is not in maxunitsdata - it's fine, just go on
            }
            div .html("<h3>Zip code</h3>"+d.properties.postalCode+"<br>"+"<h3>N of incidents</h3>"
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
              div.transition()      // I have uncommented these lines as tooltips did not otherwise disappear...
              .duration(350)        
              .style("opacity", 0); 
              var currentState = this;
              var value = d.properties.postalCode;
              var units;
              try{
                units = dataset20.find(ab => parseInt(ab.ZIP_CODE) == parseInt(value)).INCIDENT_COUNT;
              }
              catch (e){
                //zipcode is not in maxunitsdata - set units to 0 to have white colored zone
                units = 0;
            }
            d3.select(this).style('stroke', "none");
              // d3.select(this).style('opacity',  (units/10000)*120);
              d3.select(this).style('opacity', typesScale(units));
              d3.select(this).style('fill', "#EF6C00");
            });


//          console.log(dataset20);




        });
      }

      function changeNYMap20(dataset20, id, year) {
        nymap20.style("fill", "#EF6C00")
          .style("opacity",function(d) {
                 //Get data value
                 //console.log(dataset20[0].INCIDENT_COUNT);
                 var value = d.properties.postalCode;
                 //console.log('val: ', value, ' , dataset20: ', dataset20.find(x => parseInt(x.ZIP_CODE) === value));
                 try{
                  var units = 0;
                  if (dataset20.find(ab => parseInt(ab.ZIP_CODE) == parseInt(value)) === "undefind")
                    units = 0;
                  else
                    units = dataset20.find(ab => parseInt(ab.ZIP_CODE) == parseInt(value)).INCIDENT_COUNT;
//                  console.log('val: ', value, ' , units: ', dataset20.find(ab => parseInt(ab.ZIP_CODE) == parseInt(value) && parseInt(ab.INCIDENT_TYPE_NUM) == parseInt(id)));
                }
                catch (e){
                  //zipcode is not in the maxunitsdata for the currently selected dataset
                  //so no info available, set units to 0 to have white colored zone
                  units = 0;
                 }
                // return (units/100000)*60;
                return typesScale(units);
              })
          .on("mouseover", function(d) {    
            div.transition()    
            .duration(200)    
            .style("opacity", .9);
              //Here we add what we what to put on the tip
              var value = d.properties.postalCode;
              var units;
              try{
                units = dataset20.find(ab => parseInt(ab.ZIP_CODE) == parseInt(value)).INCIDENT_COUNT;
              }
              catch (e){
              //zipcode is not in maxunitsdata - it's fine, just go on
            }
            div .html("<h3>Zip code</h3>"+d.properties.postalCode+"<br>"+"<h3>N of incidents</h3>"
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
              div.transition()    // I have uncommented these lines as tooltips did not otherwise disappear...
              .duration(350)    
              .style("opacity", 0); 
              var currentState = this;
              var value = d.properties.postalCode;
              var units;
              try{
                units = dataset20.find(ab => parseInt(ab.ZIP_CODE) == parseInt(value)).INCIDENT_COUNT;
              }
              catch (e){
              //zipcode is not in maxunitsdata - set units to 0 to have white colored zone
              units = 0;
            }
            d3.select(this).style('stroke', "none");
              // d3.select(this).style('opacity',  (units/10000)*120);
              d3.select(this).style('opacity', typesScale(units));
              d3.select(this).style('fill', "#EF6C00");
            });
      }
    }