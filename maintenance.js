var api_key = ""; // add your API key here
var api_url = "http://api.edmunds.com/api/vehicle/v2/";
function show_tables() {
  var tables = document.getElementsByTagName("table");
  for(var i=0; i<tables.length; i++) {
    tables[i].style = "visibility:visible";
  }
}
function resetBelow(id) {
  var select_elements = document.getElementsByTagName("select");
  var deleteMe = false;
  for(var i=0; i<select_elements.length; i++) {
    if(deleteMe) {
      //remove stuff
      var first = select_elements[i].options[0];

      // remove all options
      while(select_elements[i].firstChild) {
        select_elements[i].removeChild(select_elements[i].firstChild);
      }
      // add back first one
      select_elements[i].appendChild(first);
    } 
    else if(select_elements[i].id === id) {
      deleteMe = true;
    }
  }
}
function calculateInterval(mileage) {
  if(mileage <= 24999) {
    return 0;
  } else if(mileage <= 49999) {
    return 1;
  } else if(mileage <= 74999) {
    return 2;
  } else if(mileage <= 99999) {
    return 3;
  } else {
    return 4;
  } 
}
function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}
document.getElementById("year").addEventListener("change", function() {
  resetBelow("year");
  // populate make
  var url = api_url + "makes?fmt=json&state=new&year=" + document.getElementById("year").value + "&api_key=" + api_key;
  var make_select = document.getElementById("make");
  httpGetAsync(url, function(response) {
    response = JSON.parse(response);
    if(response.error) {
     document.getElementById("make_error").innerHTML = response.error.message; 
    } else {
      response.makes.forEach(function(make) {
        var opt = document.createElement("option"); 
        opt.value = make.niceName;
        opt.innerHTML = make.name;
        make_select.appendChild(opt);
      });
      make_select.disabled = false;
    }  
  });
});
document.getElementById("make").addEventListener("change", function() {

  resetBelow("make");
  // populate model
  var url = api_url + document.getElementById("make").value + "/models?fmt=json&year=" + document.getElementById("year").value + "&api_key=" + api_key;
  var model_select = document.getElementById("model");
  httpGetAsync(url, function(response) {
    response = JSON.parse(response);
    if(response.error) {
      document.getElementById("model_error").innerHTML = response.error.message;
    } else {
      response.models.forEach(function(model) {
        var opt = document.createElement("option"); 
        opt.value = model.niceName;
        opt.innerHTML = model.name;
        model_select.appendChild(opt);
      });
      model_select.disabled = false;
    }  
  });
});
document.getElementById("model").addEventListener("change", function() {
  // enable trim in styles
  resetBelow("model");
  var url = api_url + document.getElementById("make").value + "/" + document.getElementById("model").value + "/" + document.getElementById("year").value + "/styles?fmt=json&api_key=" + api_key;
  var trim_select = document.getElementById("trim");
  httpGetAsync(url, function(response) {
    response = JSON.parse(response);
    if(response.error) {
      document.getElementById("trim_error").innerHTML = response.error.message;
    } else {
      response.styles.forEach(function(style) {
        var opt = document.createElement("option"); 
        opt.value = style.id;
        opt.innerHTML = style.name;
        trim_select.appendChild(opt);
      });
      trim_select.disabled = false;
    } 
  });
});
document.getElementById("trim").addEventListener("change", function() {
  // enable engine and trans
  resetBelow("trim");
  var trans_url = api_url + "/styles/" + document.getElementById("trim").value + "/transmissions?fmt=json&api_key=" + api_key;
  var engine_url = api_url + "/styles/" + document.getElementById("trim").value + "/engines?fmt=json&api_key=" + api_key;
  var trans_select = document.getElementById("transmission");
  var engine_select = document.getElementById("engine");
  httpGetAsync(trans_url, function(response) {
    response = JSON.parse(response);
    if(response.error) {
      document.getElementById("transmission_error").innerHTML = response.message.error;
    } else {
      response.transmissions.forEach(function(transmission) {
        var opt = document.createElement("option"); 
        opt.value = transmission.id;
        opt.innerHTML = transmission.transmissionType;
        trans_select.appendChild(opt);
      });
      trans_select.disabled = false;
    }  
  });
  httpGetAsync(engine_url, function(response) {
    response = JSON.parse(response);
    if(response.error) {
      document.getElementById("engine_error").innerHTML = response.error.message;
    } else {
      response.engines.forEach(function(engine) {
        var opt = document.createElement("option"); 
        opt.value = engine.id;
        opt.innerHTML = engine.cylinder + " Cyl " + engine.size + " Liter";
        engine_select.appendChild(opt);
      });
      engine_select.disabled = false;
      document.getElementById("submit").disabled = false;
    }  
  });
});
// handle form submission
document.getElementById("submit").addEventListener("click", function() {
  show_tables();
  var zip_url = "https://api.edmunds.com/v1/api/maintenance/ziplaborrate/" + document.getElementById("zip_code").value + "?fmt=json&api_key=" + api_key;
  httpGetAsync(zip_url, function(response) {
    var labor_rate = JSON.parse(response).zipLaborRateHolder[0].laborRate; // what if there is more than 1?

    var url = api_url + document.getElementById("make").value + "/" + document.getElementById("model").value +  "/years?fmt=json&api_key=" + api_key;
    httpGetAsync(url, function(response) {
      // find model year ID -- probably a better way
      JSON.parse(response).years.forEach(function(year) {
        if(year.year.toString() === document.getElementById("year").value) {
          httpGetAsync("https://api.edmunds.com/v1/api/maintenance/actionrepository/findbymodelyearid?modelyearid=" + year.id +"&fmt=json&api_key=" + api_key, function(response) {
            var row;
            var part;
            var cost;
            var labor;
            response = JSON.parse(response);
            if(response.error) {
              document.getElementById("table_error").innerHTML = response.error.message;
            } else if(response.actionHolder.length === 0) {
              document.getElementById("table_error").innerHTML = "No maintenance records available";
            } else {
              response.actionHolder.forEach(function(action) {
                if(calculateInterval(parseInt(action.intervalMileage)) === calculateInterval(parseInt(document.getElementById("current_mileage").value))) {
                  // if there is a part cost list under part panel
                  if(action.partUnits > 0) {
                    row = document.getElementById("parts_table").insertRow(-1);
                    part = row.insertCell(0);
                    cost = row.insertCell(1);
                    part.innerHTML = action.item;
                    cost.innerHTML = (action.partUnits * action.partCostPerUnit).toFixed(2);
                  }
                  row = document.getElementById("labor_table").insertRow(-1);
                  labor = row.insertCell(0);
                  part = row.insertCell(1);
                  cost = row.insertCell(2);
                  labor.innerHTML = action.action;
                  part.innerHTML = action.item;
                  cost.innerHTML = (action.laborUnits * labor_rate).toFixed(2); 
                }
              });
              part = document.getElementById("cost_table").rows[1].insertCell(-1);
              labor = document.getElementById("cost_table").rows[2].insertCell(-1);
              cost = document.getElementById("cost_table").rows[3].insertCell(-1);
              // calculate total parts cost
              var parts_table = document.getElementById("parts_table").rows;
              var labor_table = document.getElementById("labor_table").rows;
              var parts_total = 0;
              var labor_total = 0;
              for(var i=1; i<parts_table.length;i++) {
                parts_total += parseFloat(parts_table[i].cells[1].innerHTML);
              }
              for(var i=1; i<labor_table.length;i++) {
                labor_total += parseFloat(labor_table[i].cells[2].innerHTML);
              }
              part.innerHTML = (Math.floor(parts_total * 100) / 100).toFixed(2);
              labor.innerHTML = (Math.floor(labor_total * 100) / 100).toFixed(2);
              cost.innerHTML = (parseFloat(part.innerHTML) + parseFloat(labor.innerHTML)).toFixed(2);
            }
          });
        }
      });
    });  
  });  
});

