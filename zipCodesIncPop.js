      
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
                        var normalize = (zipcodesAll[key][subkey] - minV[key])/(maxV[key]-minV[key]);
                        
                        totalincAll[key][subkey] =  normalize*1.5;
                    }
            }
            loaddatamap(zipcodesAll["2013"],totalincAll["2013"]);
            loadtimeline2013();
    })
    
    var incidentsMonthYear = {};
    var incidentsMonthYear_zip = {};
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
                        INCIDENT_DATE_TIME: new Date(datet),
                        ZIP_CODE: d.ZIP_CODE,
                        Group_Count: d.Group_Count
                    };
                }
            d3.csv("incidents_year/incidentsGroup2013.csv", rowConverter, function(data){
               /* data.map(function(d){
                });*/
               incidentsMonthYear["2013"] = {};
               incidentsMonthYear_zip["2013"] = {};
               //Data for the time line, group by date and count 
                /*incidentsMonthYear["2013"] = d3.nest()
                .key(function(d) { return d.INCIDENT_DATE_TIME })
                .rollup(function(v) { return v.length })
                .entries(data);*/
                
                incidentsMonthYear["2013"]  = d3.nest()
                .key(function(d) { return d.INCIDENT_DATE_TIME })
                .rollup(function(v) {return d3.sum(v, function(d) { return d.Group_Count; })})
                .entries(data);
                
                data.map(function(d){
                    var aux = new Date(d.INCIDENT_DATE_TIME);
                    var datet = aux.getFullYear()+'/'+(aux.getMonth()+1)+'/'+aux.getDate(); 
                    var codestring = d.ZIP_CODE;
                    var condestring2 = codestring.match(/[^.]*/i)[0];
                    if (typeof incidentsMonthYear_zip["2013"][datet] === "undefined" )
                        incidentsMonthYear_zip["2013"][datet] = [];
                    incidentsMonthYear_zip["2013"][datet].push([condestring2,d.Group_Count]);
                });
                
                mindate["2013"] = d3.min(data, function(d) { return d.INCIDENT_DATE_TIME; });
                maxdate["2013"] = d3.max(data, function(d) { return d.INCIDENT_DATE_TIME; });
                
                painttimeline(incidentsMonthYear["2013"],mindate["2013"],maxdate["2013"],incidentsMonthYear_zip["2013"]);
            });
            d3.csv("incidents_year/incidentsGroup2014.csv", rowConverter, function(data){
               /* data.map(function(d){
                });*/
               incidentsMonthYear["2014"] = {};
               incidentsMonthYear_zip["2014"] = {};
               //Data for the time line, group by date and count 
                incidentsMonthYear["2014"]  = d3.nest()
                .key(function(d) { return d.INCIDENT_DATE_TIME })
                .rollup(function(v) {return d3.sum(v, function(d) { return d.Group_Count; })})
                .entries(data);
                
                data.map(function(d){
                    var aux = new Date(d.INCIDENT_DATE_TIME);
                    var datet = aux.getFullYear()+'/'+(aux.getMonth()+1)+'/'+aux.getDate(); 
                    var codestring = d.ZIP_CODE;
                    var condestring2 = codestring.match(/[^.]*/i)[0];
                    if (typeof incidentsMonthYear_zip["2014"][datet] === "undefined" )
                        incidentsMonthYear_zip["2014"][datet] = [];
                    incidentsMonthYear_zip["2014"][datet].push([condestring2,d.Group_Count]);
                });
                
                mindate["2014"] = d3.min(data, function(d) { return d.INCIDENT_DATE_TIME; });
                maxdate["2014"] = d3.max(data, function(d) { return d.INCIDENT_DATE_TIME; });
            });
            d3.csv("incidents_year/incidentsGroup2015.csv", rowConverter, function(data){
               /* data.map(function(d){
                });*/
               incidentsMonthYear["2015"] = {};
               incidentsMonthYear_zip["2015"] = {};
               //Data for the time line, group by date and count 
                incidentsMonthYear["2015"]  = d3.nest()
                .key(function(d) { return d.INCIDENT_DATE_TIME })
                .rollup(function(v) {return d3.sum(v, function(d) { return d.Group_Count; })})
                .entries(data);
                
                data.map(function(d){
                    var aux = new Date(d.INCIDENT_DATE_TIME);
                    var datet = aux.getFullYear()+'/'+(aux.getMonth()+1)+'/'+aux.getDate(); 
                    var codestring = d.ZIP_CODE;
                    var condestring2 = codestring.match(/[^.]*/i)[0];
                    if (typeof incidentsMonthYear_zip["2015"][datet] === "undefined" )
                        incidentsMonthYear_zip["2015"][datet] = [];
                    incidentsMonthYear_zip["2015"][datet].push([condestring2,d.Group_Count]);
                });
                
                mindate["2015"] = d3.min(data, function(d) { return d.INCIDENT_DATE_TIME; });
                maxdate["2015"] = d3.max(data, function(d) { return d.INCIDENT_DATE_TIME; });
            });
            d3.csv("incidents_year/incidentsGroup2016.csv", rowConverter, function(data){
               /* data.map(function(d){
                });*/
               incidentsMonthYear["2016"] = {};
               incidentsMonthYear_zip["2016"] = {};
               //Data for the time line, group by date and count 
                incidentsMonthYear["2016"]  = d3.nest()
                .key(function(d) { return d.INCIDENT_DATE_TIME })
                .rollup(function(v) {return d3.sum(v, function(d) { return d.Group_Count; })})
                .entries(data);
                
                data.map(function(d){
                    var aux = new Date(d.INCIDENT_DATE_TIME);
                    var datet = aux.getFullYear()+'/'+(aux.getMonth()+1)+'/'+aux.getDate(); 
                    var codestring = d.ZIP_CODE;
                    var condestring2 = codestring.match(/[^.]*/i)[0];
                    if (typeof incidentsMonthYear_zip["2016"][datet] === "undefined" )
                        incidentsMonthYear_zip["2016"][datet] = [];
                    incidentsMonthYear_zip["2016"][datet].push([condestring2,d.Group_Count]);
                });
                
                mindate["2016"] = d3.min(data, function(d) { return d.INCIDENT_DATE_TIME; });
                maxdate["2016"] = d3.max(data, function(d) { return d.INCIDENT_DATE_TIME; });
            });
             d3.csv("incidents_year/incidentsGroup2017.csv", rowConverter, function(data){
               /* data.map(function(d){
                });*/
               incidentsMonthYear["2017"] = {};
               incidentsMonthYear_zip["2017"] = {};
               //Data for the time line, group by date and count 
                incidentsMonthYear["2017"]  = d3.nest()
                .key(function(d) { return d.INCIDENT_DATE_TIME })
                .rollup(function(v) {return d3.sum(v, function(d) { return d.Group_Count; })})
                .entries(data);
                
                data.map(function(d){
                    var aux = new Date(d.INCIDENT_DATE_TIME);
                    var datet = aux.getFullYear()+'/'+(aux.getMonth()+1)+'/'+aux.getDate(); 
                    var codestring = d.ZIP_CODE;
                    var condestring2 = codestring.match(/[^.]*/i)[0];
                    if (typeof incidentsMonthYear_zip["2017"][datet] === "undefined" )
                        incidentsMonthYear_zip["2017"][datet] = [];
                    incidentsMonthYear_zip["2017"][datet].push([condestring2,d.Group_Count]);
                });
                
                mindate["2017"] = d3.min(data, function(d) { return d.INCIDENT_DATE_TIME; });
                maxdate["2017"] = d3.max(data, function(d) { return d.INCIDENT_DATE_TIME; });
            });
    }
    
    /*
     * This function changes the timeline (year)
     * */
    function changetimeline(year) {
        $("#listyear .listyears").removeClass("selected");
        $("#l"+year).addClass("selected");
        yearsection1 = year;
        loadinfomap(zipcodesAll[year],totalincAll[year]);
        painttimeline(incidentsMonthYear[year],mindate[year],maxdate[year]);
    }
    
    /*
     * section 3
     * 
     */
    var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S"); //convert strings to dates in Date format
    var dateToString = d3.timeFormat("%Y-%m-%d"); // and vice versa (ditch the time though)
    var maxunitsdata; // currently displayed
    var maxunitsdata13;
    var maxunitsdata14;
    var maxunitsdata15;
    var maxunitsdata16;
    var maxunitsdata17;
    var unitsNumbers = function(row){
                                    return{
                                            INCIDENT_DATE_TIME: parseDate(row.INCIDENT_DATE_TIME),
                                            ZIP_CODE: row.ZIP_CODE,
                                            UNITS_ONSCENE: +row.UNITS_ONSCENE,
                                            URL: row.URL
                                    }	
                            }

    function changeseverity(year){
        
        $("#listyear3 .listyears").removeClass("selected");
        $("#lsev"+year).addClass("selected");
        if (year==='2013') {
            maxunitsdata = maxunitsdata13;
            loadinfomap3();
        }
        else if (year==='2014'){
            maxunitsdata = maxunitsdata14;
            loadinfomap3();
        }
        else if (year==='2015'){
            maxunitsdata = maxunitsdata15;
            loadinfomap3();
        }
        else if (year==='2016'){
            maxunitsdata = maxunitsdata16;
            loadinfomap3();
        }
        else if (year==='2017'){
            maxunitsdata = maxunitsdata17;
            loadinfomap3();
        }


    }                        

    d3.csv("full_csv_year_files/2013full.csv", unitsNumbers, function(data){
        
            maxunitsdata = d3.nest()
                    .key(function(d){return d.ZIP_CODE;})
                    .rollup(function(d){
                            return d3.max(d, function(g){return g.UNITS_ONSCENE;});
                    }).entries(data);
            maxunitsdata13 = maxunitsdata; // store
                    loadinfomap3();
        });
    d3.csv("full_csv_year_files/2014full.csv", unitsNumbers, function(data){
        
            maxunitsdata14 = d3.nest()
                    .key(function(d){return d.ZIP_CODE;})
                    .rollup(function(d){
                            return d3.max(d, function(g){return g.UNITS_ONSCENE;});
                    }).entries(data);
                    loadinfomap3();
        });
    d3.csv("full_csv_year_files/2015full.csv", unitsNumbers, function(data){
        
            maxunitsdata15 = d3.nest()
                    .key(function(d){return d.ZIP_CODE;})
                    .rollup(function(d){
                            return d3.max(d, function(g){return g.UNITS_ONSCENE;});
                    }).entries(data);
                    loadinfomap3();
        });
    d3.csv("full_csv_year_files/2016full.csv", unitsNumbers, function(data){
        
            maxunitsdata16 = d3.nest()
                    .key(function(d){return d.ZIP_CODE;})
                    .rollup(function(d){
                            return d3.max(d, function(g){return g.UNITS_ONSCENE;});
                    }).entries(data);
                    loadinfomap3();
        });
    d3.csv("full_csv_year_files/2017full.csv", unitsNumbers, function(data){
        
            maxunitsdata17 = d3.nest()
                    .key(function(d){return d.ZIP_CODE;})
                    .rollup(function(d){
                            return d3.max(d, function(g){return g.UNITS_ONSCENE;});
                    }).entries(data);
                    loadinfomap3();
        });
    
    // Load the csv with the most severe incidents
    var severestdata;
    d3.csv("full_csv_year_files/biggestincidentsalltime.csv", unitsNumbers, function(data){
        severestdata = data; // much simpler here as all data is already in csv
    })
    