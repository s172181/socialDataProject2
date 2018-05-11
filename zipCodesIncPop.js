      
    //I have to go through population and divide per population in zone (now is for 2013)
    // then I have to do the brushline for every year
    // then I have to do same for incident types
    var zipPopulation = [];
    d3.csv("NYC_zip_codes_population_2015.csv", function(data){
    iii = 0;
            data.map(function(d){
                codestring = d.zip;
                zipPopulation[codestring.toString()] = parseInt(d.population_2015);  
            });
    })

    //read number of zip codes
    //Zip codes and number of incidents
    var zipcodesaux = [];
    var currentyear = "2013";
    var zipcodesAll = {};
    var totalincAll = {};
    var maxV = [], minV = [];
    var whatzip = 0;
    loadtimeline2013();
    /*
     * This creates an array for every year containing the scale, distribution of incidents per zip code, per year
     */
    d3.csv("incidents_year/zipcodesAll.csv", function(data){
            indexincidents = 0;
            zipcodesAll[currentyear] = {};
            maxV[currentyear] = 0;
            minV[currentyear] = 9999;
            //zipcodesN is an associative array of "zipcode" => total of number of incidents
            //total incidents contains the sum of all incidents
            data.map(function(d){
                   codestring = d.ZIP_CODE;
                   condestring2 = codestring.match(/[^.]*/i)[0];
                   year = d.INCIDENT_DATE_TIME.replace(/\s+/g, '');
                   
                   if (year != currentyear) {
                       zipcodesAll[year] = {};
                       maxV[year] = 0;
                       minV[year] = 9999;
                       currentyear = year;
                   }
                   
                   //if zip conde donest have population data
                   if (typeof zipPopulation[condestring2.toString()] === "undefined") {
                    zipcodesAll[year][condestring2.toString()] = -1;
                   }
                   else {
                    incidentsPerson = parseInt(d.Group_Count)/zipPopulation[condestring2.toString()];
                    incidentsPerson2 = incidentsPerson*1000;
                    zipcodesAll[year][condestring2.toString()] = +incidentsPerson2.toFixed(2);
                   }
                   //if (year=="2013")
                   //console.log("zip heere "+condestring2.toString()+" - "+zipcodesAll[year][condestring2.toString()]);
                   if (zipcodesAll[year][condestring2.toString()] > maxV[year]) {
                        maxV[year] = zipcodesAll[year][condestring2.toString()];
                        whatzip = condestring2.toString();
                    }
                   if (zipcodesAll[year][condestring2.toString()] < minV[year] && zipcodesAll[year][condestring2.toString()] >= 0) {
                        minV[year] = zipcodesAll[year][condestring2.toString()];;
                   }
                   indexincidents += 1;
            });
            for(var key in zipcodesAll) {
                    totalincAll[key] = {};
                    for(var subkey in zipcodesAll[key])
                    {
                        //console.log("min "+minV[key]+" max "+maxV[key]);
                        var normalize = (zipcodesAll[key][subkey] - minV[key])/(maxV[key]-minV[key]);
                        //console.log("Year "+key+"Zip code "+subkey+" - "+normalize);
                        
                        totalincAll[key][subkey] =  normalize*2;
                    }
            }
            loaddatamap(zipcodesAll["2013"],totalincAll["2013"]);
    })
    
    var incidentsMonthYear = {};
    var mindate = {};
    var maxdate = {};
    /*
     *  This is to obtain the number of incidents per year, per date. This is for the timeline
     */
    function loadtimeline2013() {
            
            //Row convertion of date
            var rowConverter = function(d) {
                    var aux = new Date(d.INCIDENT_DATE_TIME);
                    var datet = aux.getFullYear()+'/'+(aux.getMonth()+1)+'/'+aux.getDate(); 
                    return {
                        //Make a new Date object for each year + month
                        IM_INCIDENT_KEY: d.IM_INCIDENT_KEY,
                        INCIDENT_DATE_TIME: new Date(datet),
                        ZIP_CODE: d.ZIP_CODE
                    };
                }
            d3.csv("incidents_year/allincidents2013.csv", rowConverter, function(data){
               /* data.map(function(d){
                });*/
               incidentsMonthYear["2013"] = {};
               //Data for the time line, group by date and count 
                incidentsMonthYear["2013"] = d3.nest()
                .key(function(d) { return d.INCIDENT_DATE_TIME })
                .rollup(function(v) { return v.length })
                .entries(data);
                
                mindate["2013"] = d3.min(data, function(d) { return d.INCIDENT_DATE_TIME; });
                maxdate["2013"] = d3.max(data, function(d) { return d.INCIDENT_DATE_TIME; });
                
                painttimeline(incidentsMonthYear["2013"],mindate["2013"],maxdate["2013"]);
            });
            d3.csv("incidents_year/allincidents2014.csv", rowConverter, function(data){
               /* data.map(function(d){
                });*/
               incidentsMonthYear["2014"] = {};
               //Data for the time line, group by date and count 
                incidentsMonthYear["2014"] = d3.nest()
                .key(function(d) { return d.INCIDENT_DATE_TIME })
                .rollup(function(v) { return v.length })
                .entries(data);
                
                mindate["2014"] = d3.min(data, function(d) { return d.INCIDENT_DATE_TIME; });
                maxdate["2014"] = d3.max(data, function(d) { return d.INCIDENT_DATE_TIME; });
            });
            d3.csv("incidents_year/allincidents2015.csv", rowConverter, function(data){
               /* data.map(function(d){
                });*/
               incidentsMonthYear["2015"] = {};
               //Data for the time line, group by date and count 
                incidentsMonthYear["2015"] = d3.nest()
                .key(function(d) { return d.INCIDENT_DATE_TIME })
                .rollup(function(v) { return v.length })
                .entries(data);
                
                mindate["2015"] = d3.min(data, function(d) { return d.INCIDENT_DATE_TIME; });
                maxdate["2015"] = d3.max(data, function(d) { return d.INCIDENT_DATE_TIME; });
            });
            d3.csv("incidents_year/allincidents2016.csv", rowConverter, function(data){
               /* data.map(function(d){
                });*/
               incidentsMonthYear["2016"] = {};
               //Data for the time line, group by date and count 
                incidentsMonthYear["2016"] = d3.nest()
                .key(function(d) { return d.INCIDENT_DATE_TIME })
                .rollup(function(v) { return v.length })
                .entries(data);
                
                mindate["2016"] = d3.min(data, function(d) { return d.INCIDENT_DATE_TIME; });
                maxdate["2016"] = d3.max(data, function(d) { return d.INCIDENT_DATE_TIME; });
            });
             d3.csv("incidents_year/allincidents2017.csv", rowConverter, function(data){
               /* data.map(function(d){
                });*/
               incidentsMonthYear["2017"] = {};
               //Data for the time line, group by date and count 
                incidentsMonthYear["2017"] = d3.nest()
                .key(function(d) { return d.INCIDENT_DATE_TIME })
                .rollup(function(v) { return v.length })
                .entries(data);
                
                mindate["2017"] = d3.min(data, function(d) { return d.INCIDENT_DATE_TIME; });
                maxdate["2017"] = d3.max(data, function(d) { return d.INCIDENT_DATE_TIME; });
            });
    }
    
    /*
     * This function changes the timeline (year)
     * */
    function changetimeline(year) {
        $(".listyears").removeClass("selected");
        $("#l"+year).addClass("selected");
        loaddatamap(zipcodesAll[year],totalincAll[year]);
        painttimeline(incidentsMonthYear[year],mindate[year],maxdate[year]);
    }
    