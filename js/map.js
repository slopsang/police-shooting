// Function to draw your map
var drawMap = function() {
  	// Create map and set view
	var map = L.map('container').setView([40, -100], 4);
  	// Create a tile layer variable using the appropriate url
	var layer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'slopsang.cifrngxb40jzbshm61m6zgf7t',
    accessToken: 'pk.eyJ1Ijoic2xvcHNhbmciLCJhIjoiY2lmcm5neXM5MGtiaHM2bTY2a2tqc3B1cCJ9.lIi9zEO60FeLzG4JwDZg9A'
	});
  	// Add the layer to your map
 	layer.addTo(map);
  	// Execute your function to get data
 	getData(map);
}

// Function for getting data
var getData = function(map) {
	var data;
	$.ajax({
		url:'./data/response.json',
		type:'get',
		success:function(dat) {
			data = dat;
			// When your request is successful, call your customBuild function
			customBuild(data, map);
		},
		dataType:'json'
	});
}

var customBuild = function(data, map) {
	// defines each layer groups
	var unknown = new L.layerGroup([]);
	var white = new L.layerGroup([]);
	var black = new L.layerGroup([]);
	var asian = new L.layerGroup([]);
	var americanIndian = new L.layerGroup([]);
	var nativeHawaiian = new L.layerGroup([]);
	// defines different values that I need to build a Cross-Tabulation
	var whiteMale = 0;
	var nonWhiteMale = 0;
	var whiteFemale = 0;
	var nonWhiteFemale = 0;
	// Loop through your data and add the appropriate layers and points
	data.forEach(function(d) {
		var race = d["Race"];
	  	var age = d["Victim's Age"];
	  	var name = d["Victim Name"];
	  	var gender = d["Victim's Gender"];
	  	var killed = d["Hit or Killed?"];
	  	var armed = d["Armed or Unarmed?"];
	  	var source = d["Source Link"];
	  	var summary = d["Summary"];
	  	// creats a circle for each data point
		var circle = new L.circle(
			[d.lat, d.lng], 400, {
			color: 'white',
			fillColor: 'white',
			opacity: 1.0,
			fillOpacity: 1
		});
		// manipulates the color of each circle based on whether or not victim is killed
		if (killed == "Killed") {
			circle.setStyle({color:'red', fillColor:'red'});
		} else if (killed == "Hit") {
			circle.setStyle({color:'LightSlateGray', fillColor:'LightSlateGray'});
		} else {
			circle.setStyle({color:'white', fillColor:'white'});
		}
		// manipulates the size of each circle based on whether or not victim is armed
		if (armed == "Armed") {
			circle.setRadius(4000);
		}

		if (race == "White") {
			circle.addTo(white);
		} else if (race == "Black or African American") {
			circle.addTo(black);
		} else if (race == "Asian") {
			circle.addTo(asian);
		} else if (race == "American Indian or Alaska Native") {
			circle.addTo(americanIndian);
		} else if (race == "Native Hawaiian or Other Pacific Islander") {
			circle.addTo(nativeHawaiian);
		} else { // Unknown & Blank 
			race = "Unknown";
			circle.addTo(unknown);
		}
		// calculates numbers to build a Cross-Tabulation
		if (race == "White" && gender == "Male") {
			whiteMale++;
		} else if (race != "White" && gender == "Male") {
			nonWhiteMale++;
		} else if (race == "White" && gender != "Male") {
			whiteFemale++;
		} else {
			nonWhiteFemale++;
		}
		// hovers text to each data point based on its description
		circle.bindPopup("<b>Victim's Name: </b>" + name + "<br><b>Victim's Age: </b>" + age + 
  						"<br><b>Victim's Race: </b>" + race + "<br><b>Victim's Gender: </b>" + gender +
  					 	"<br><b>Hit or Killed: </b>" + killed + "<br><b>Armed or unarmed?: </b>" + armed + 
  					 	"<br><b>Summary: </b>" + summary + "<a href='" + source + "' target='_blank'> (link)</a>"
  		);
	});
	// creates cross-tabulation table
	$('#dynamictable').append('<table style="width:100%" class="table table-striped"></table>');
	var table = $('#dynamictable').children();
	table.append("<tr><td></td><td><b>Men</b></td><td><b>Women/unspecified</b></td></tr>");
	table.append("<tr><td><b>White</b></td><td>"+whiteMale+"</td><td>"+whiteFemale+"</td></tr>");
	table.append("<tr><td><b>Non-white</b></td><td>"+nonWhiteMale+"</td><td>"+nonWhiteFemale+"</td></tr>");
	// controls the visibility of layers in the map
	var layers = {
		"White" : white,
		"Black or African American" : black,
		"Asian" : asian,
		"American Indian or Alaska Native" : americanIndian,
		"Native Hawaiian or Other Pacific Islander" : nativeHawaiian,
		"Unknown" : unknown
	};
	L.control.layers(null, layers).addTo(map);
}