/*
 * PROJECTION WIZARD v2.0
 * Map Projection Selection Tool
 * 
 * Author: Bojan Savric
 * Date: August, 2019
 * 
 */

/***MAIN OUTPUT FUNCTION***/
function makeOutput(currentlyDragging) {
	currentlyDragging = currentlyDragging || false;

	//computing a scale of the map
	var scale = 720. / (lonmax - lonmin) / (Math.sin(latmax * Math.PI / 180.) - Math.sin(latmin * Math.PI / 180.));
	//reading the passed distortion
	var distortion = $('input[name=distortion]:checked').val();
	//getting a center of the map
	var center = rectangle.getBounds().getCenter();
	
	//var printoutTEXT = $("#printout").empty();
	//printoutTEXT.append("<p>Ratio/scale: " + scale + ", center latitude: " + center.lat + ", center longitude: " + center.lng + "</p>");

	if (scale < 1.5) {
		//locking Conformal map
		var radioConformal = document.getElementById("Conformal");
		if (radioConformal.checked) {
			document.getElementById("Equalarea").checked = true;
			distortion = "Equalarea";
		}
		radioConformal.disabled = true;
		document.getElementById("Label2").style.color = "#BDBDBD";

		//unlocking compromise
		var radioCompromise = document.getElementById("Compromise");
		if (radioCompromise.disabled) {
			radioCompromise.disabled = false;
			document.getElementById("Label4").style.color = "#000000";
		}

		//World (small-scale) map
		printWorld(distortion, center, currentlyDragging);

	} else if (scale < 6) {
		//locking Conformal map
		var radioConformal = document.getElementById("Conformal");
		if (radioConformal.checked) {
			document.getElementById("Equalarea").checked = true;
			distortion = "Equalarea";
		}
		radioConformal.disabled = true;
		document.getElementById("Label2").style.color = "#BDBDBD";

		//locking compromise map
		var radioCompromise = document.getElementById("Compromise");
		if (radioCompromise.checked) {
			document.getElementById("Equalarea").checked = true;
			distortion = "Equalarea";
		}
		radioCompromise.disabled = true;
		document.getElementById("Label4").style.color = "#BDBDBD";

		//Hemisphere (medium-scale) map
		printHemisphere(distortion, center, scale);
		addMapPreview(center, currentlyDragging);
	} else {
		//locking compromise map
		var radioCompromise = document.getElementById("Compromise");
		if (radioCompromise.checked) {
			document.getElementById("Equalarea").checked = true;
			distortion = "Equalarea";
		}
		radioCompromise.disabled = true;
		document.getElementById("Label4").style.color = "#BDBDBD";

		//unlocking conformal
		var radioConformal = document.getElementById("Conformal");
		if (radioConformal.disabled) {
			radioConformal.disabled = false;
			document.getElementById("Label2").style.color = "#000000";
		}

		//Continent or a smaller area (large-scale) map
		printSmallerArea(distortion, center, scale);
		addMapPreview(center, currentlyDragging);
	}
}

/***PRINTING WOLRD MAP PROJECTIONS***/

/*Global list of world map projections*/
var listWorld = [
//Equal-area world map projections with poles represented as points
{
	projection : "Mollweide",
	PROJ4 : "moll"
}, {
	projection : "Hammer (or Hammer-Aitoff)",
	PROJ4 : "hammer"
},
//Equal-area world map projections with poles represented as lines
{
	projection : "Equal Earth",
	PROJ4 : "eqearth"
}, {
	projection : "Eckert IV",
	PROJ4 : "eck4"
}, {
	projection : "Wagner IV (or Putnins P2&#96;)",
	PROJ4 : "wag4"
}, {
	projection : "Wagner VII (or Hammer-Wagner)",
	PROJ4 : "wag7"
},
//Compromise world map projections
{
	projection : "Robinson",
	PROJ4 : "robin"
}, {
	projection : "Natural Earth",
	PROJ4 : "natearth"
}, {
	projection : "Winkel Tripel",
	PROJ4 : "wintri"
}, {
	projection : "Patterson",
	PROJ4 : "patterson"
}, {
	projection : "Plate Carrée",
	PROJ4 : "latlong"
}, {
	projection : "Miller cylindrical I",
	PROJ4 : "mill"
}];

/*Main small-scale output function*/
function printWorld(property, center, currentlyDragging) {
	//cleaning the output
	var outputTEXT = $("#result").empty();
	
	//formating coordinates of the center
	var lng = Math.round(center.lng * 100.) / 100.
	var lat = Math.round(center.lat * 100.) / 100.
	
	//formating the output text
	if (property == 'Equalarea') {
		addWorldMapPreview(center, "Equal Earth", currentlyDragging);
		
		outputTEXT.append("<p><b>Equal-area world map projections with poles represented as points</b></p>");
		//loop through global data
		for (var i = 0; i < 2; i++) {
			outputTEXT.append("<p class='outputText'><span onmouseover='updateWorldMap(\"" + listWorld[i].projection + "\")'>" + listWorld[i].projection + stringLinks(listWorld[i].PROJ4, NaN, NaN, NaN, NaN, lng, NaN) + "<\span></p>");
		}

		outputTEXT.append("<p><b>Equal-area world map projections with poles represented as lines</b></p>");
		//loop through global data
		for (var i = 2; i < 6; i++) {
			outputTEXT.append("<p class='outputText'><span onmouseover='updateWorldMap(\"" + listWorld[i].projection + "\")'>" + listWorld[i].projection + stringLinks(listWorld[i].PROJ4, NaN, NaN, NaN, NaN, lng, NaN) + "<\span></p>");
		}
		
		worldCM(lng, outputTEXT);
	}
	else if (property == 'Equidistant') {
		outputTEXT.append("<p><b>Equidistant world map projections</b></p>");
		
		outputTEXT.append("<p class='outputText'>Polar azimuthal equidistant (centered on a pole)" + 
			stringLinks("aeqd", NaN, 90.0, NaN, NaN, lng, NaN) + "</p>");
			
		outputTEXT.append("<p class='outputText'>Oblique azimuthal equidistant (centered on arbitrary point)" + 
			stringLinks("aeqd", NaN, lat, NaN, NaN, lng, NaN) + "</p>");
			
		outputTEXT.append("<p class='outputText'>Two-point equidistant (relative to two arbitrary points)" + 
			stringLinks("tpeqd", NaN, lat, lng, 45.5, 90.5, NaN) + "</p>");
		
		// clear the canvas context and the projection name display in this condition
		clearCanvasMap();
	}
	else {
		outputTEXT.append("<p><b>Compromise world map projections</b></p>");
		
		addWorldMapPreview(center, "Natural Earth", currentlyDragging);
		//loop through global data
		for (var i = 6; i < 9; i++) {
			outputTEXT.append("<p class='outputText'><span onmouseover='updateWorldMap(\"" + listWorld[i].projection + "\")'>" + listWorld[i].projection + stringLinks(listWorld[i].PROJ4, NaN, NaN, NaN, NaN, lng, NaN) + "<\span></p>");
		}
		outputTEXT.append("<p><b>Compromise rectangular world map projections</b></p>");
		//loop through global data
		for (var i = 9; i < 12; i++) {
			outputTEXT.append("<p class='outputText'><span onmouseover='updateWorldMap(\"" + listWorld[i].projection + "\")'>" + listWorld[i].projection + stringLinks(listWorld[i].PROJ4, NaN, NaN, NaN, NaN, lng, NaN) + "<\span></p>");
		}
		
		worldCM(lng, outputTEXT);
		outputTEXT.append("<p><b>Note:</b> Rectangular projections are not generally recommended for most world maps.</p>");
	}
}

/***PRINTING HEMISPHERE MAP PROJECTIONS***/
function printHemisphere(property, center, scale) {
	//cleaning the output
	var outputTEXT = $("#result").empty();

	//formating coordinates of the center
	var lon = Math.round(center.lng * 100.) / 100., lat, lonS, latS;

	if (center.lat > 85.) {
		lat = 90.0;
	} else if (center.lat < -85.) {
		lat = -90.0;
	} else {
		lat = Math.round(center.lat * 100.) / 100.;
	}

	//formating coordinates of the center - strings
	if  ( angUnit == "DMS" ){
		if (lat < 0)
			latS = Math.abs(lat) + "º S";
		else
			latS = lat + "º N";
		if (lon < 0)
			lonS = Math.abs(lon) + "º W";
		else
			lonS = lon + "º E";
	} else {
		latS = lat;
		lonS = lon;
	}	

	//formating center text
	var center_text = "Center latitude: " + latS + "<br>Center longitude: " + lonS;

	//formating the output text
	if (property == 'Equalarea') {
		outputTEXT.append("<p><b>Equal-area projection for maps showing a hemisphere</b></p>");
		outputTEXT.append("<p class='outputText'><b>Lambert azimuthal equal-area projection</b>" +
			stringLinks("laea", NaN, lat, NaN, NaN, lon, NaN) +
			"<br>" + center_text + "</p>");
		previewMapProjection = "Azimuthal equal area";
		previewMapLat0 = lat;
	} else {
		outputTEXT.append("<p><b>Equidistant projection for maps showing a hemisphere</b></p>");
		outputTEXT.append("<p class='outputText'><b>Azimuthal equidistant</b>" +
			stringLinks("aeqd", NaN, lat, NaN, NaN, lon, NaN) +
			"<br>" + center_text + "</p>");
		previewMapProjection = "Azimuthal equidistant";
		previewMapLat0 = lat;
	}
}

/***PRINTING LARGE-SCALE MAP PROJECTIONS***/

/*Main large-scale output function*/

function printSmallerArea(property, center, scale) {
	//cleaning the output
	var outputTEXT = $("#result").empty();
	//computing longitude extent
	var dlon = (lonmax - lonmin);
	//reading central meridian
	var lng = outputLON(center.lng, false);

	//formating the output text
	if (property == 'Equidistant') {
		outputTEXT.append("<p><b>Regional map projection with correct scale along some lines.</b></p>");

		//case: close to poles
		if (((center.lat > 67.5 && scale < 8) || center.lat > 70)) {
			outputTEXT.append("<p><b>Polar azimuthal equidistant</b>" + 
				stringLinks("aeqd", NaN, 90.0, NaN, NaN, center.lng, NaN) + 
				" - distance correct along any line passing through the pole (i.e., meridian)<br>Central meridian: " + lng + "</p>");
			previewMapProjection = "Azimuthal equidistant";
			previewMapLat0 = 90;
		}
		else if ((center.lat < -67.5 && scale < 8) || center.lat < -70) {
			outputTEXT.append("<p><b>Polar azimuthal equidistant</b>" + 
				stringLinks("aeqd", NaN, -90.0, NaN, NaN, center.lng, NaN) + 
				" - distance correct along any line passing through the pole (i.e., meridian)<br>Central meridian: " + lng + "</p>");
			previewMapProjection = "Azimuthal equidistant";
			previewMapLat0 = -90;
		}
		
		//case: close to equator
		else if (center.lat > -15. && center.lat < 15.) {
			outputTEXT.append("<p><b>Plate Carrée</b>" + 
				stringLinks("latlong", NaN, NaN, NaN, NaN, center.lng, NaN) + 
				" (or equidistant cylindrical) - distance correct along meridians<br>Central meridian: " + lng + "</p>");
			previewMapProjection = "Plate Carrée";
			previewMapLat0 = 0;
		}
		
		//case: between pole and equator
		else {
			//computing standard paralles
			var interval = (latmax - latmin) / 6;
			var latOr = outputLAT(center.lat,        false);
			var latS1 = outputLAT(latmin + interval, false);
			var latS2 = outputLAT(latmax - interval, false);

			//formating the output
			outputTEXT.append("<p class='outputText'><b>Equidistant conic</b>" +
				stringLinks("eqdc", NaN, center.lat, latmin + interval, latmax - interval, center.lng, NaN) +
				" - distance correct along meridians</p>");
			outputTEXT.append("<p class='outputText'>Latitude of origin: " + latOr + "<br>Standard parallel 1: " + latS1 + "<br>Standard parallel 2: " + latS2 + "<br>Central meridian: " + lng + "</p>");
			
			outputTEXT.append("<p class='outputText'><br><b>Oblique azimuthal equidistant</b>" + 
				stringLinks("aeqd", NaN, center.lat, NaN, NaN, center.lng, NaN) +
				" - distance correct along any line passing through the center of the map (i.e., great circle)</p>");
			outputTEXT.append("<p class='outputText'>Center latitude: " + outputLAT(center.lat, false) + "<br>Center longitude: " + lng + "</p>");
			
			previewMapProjection = "Conic equidistant";
			previewMapLat0 = center.lat;
		}
		outputTEXT.append('<p><b>Note:</b> In some rare cases, it is useful to retain scale along great circles in regional and large-scale maps. Map readers can make precise measurements along these lines that retain scale. It is important to remember that no projection is able to correctly display all distances and that only some distances are retained correctly by these "equidistant" projections.</p>');

	} 
	
	//case: very large scale, Universal Polar Stereographic - North Pole
	else if ((latmin >= 84.) && (property == "Conformal")) {
		//formating the output
		outputTEXT.append("<p><b>Conformal projection at very large map scale</b></p>");
		outputTEXT.append("<p class='outputText'><b>Polar stereographic</b>" + 
				stringLinks("stere", NaN, 90.0, NaN, NaN, center.lng, 0.994) + "</p>");
		outputTEXT.append("<p class='outputText'>Central meridian: " + lng + "</p>");
		outputTEXT.append("<p class='outputText'>Scale factor: 0.994</p>");
		
		previewMapProjection = "Stereographic";
        previewMapLat0 = 90;
	}
	
	//case: very large scale, Universal Polar Stereographic - South Pole
	else if ((latmax <= -80.) && (property == "Conformal")) {
		//formating the output
		outputTEXT.append("<p><b>Conformal projection at very large map scale</b></p>");
		outputTEXT.append("<p class='outputText'><b>Polar stereographic</b>" + 
				stringLinks("stere", NaN, -90.0, NaN, NaN, center.lng, 0.994) + "</p>");
		outputTEXT.append("<p class='outputText'>Central meridian: " + lng + "</p>");
		outputTEXT.append("<p class='outputText'>Scale factor: 0.994</p>");
		
		previewMapProjection = "Stereographic";
        previewMapLat0 = -90;
	} 
	
	//case: very large scale, like on "state plane" coord. sys.
	else if ((dlon <= 3.) && (property == "Conformal")) {
		//formating the output
		outputTEXT.append("<p><b>Conformal projection at very large map scale</b></p>");
		outputTEXT.append("<p class='outputText'><b>Transverse Mercator</b>" + 
				stringLinks("tmerc", 500000.0, NaN, NaN, NaN, center.lng, 0.9999) + "</p>");
		outputTEXT.append("<p class='outputText'>False easting: 500000.0</p>");
		outputTEXT.append("<p class='outputText'>Central meridian: " + lng + "</p>");
		outputTEXT.append("<p class='outputText'>Scale factor: 0.9999</p>");
		
		previewMapProjection = "Transverse Mercator";
        previewMapLat0 = 0;
	} 
	
	//case: very large scale, like Universal Transverse Mercator
	else if ( (dlon <= 6.) && (property == "Conformal")) {
		//formating the output
		outputTEXT.append("<p><b>Conformal projection at very large map scale</b></p>");
		outputTEXT.append("<p class='outputText'><b>Transverse Mercator</b>" + 
				stringLinks("tmerc", 500000.0, NaN, NaN, NaN, center.lng, 0.9996) + "</p>");
		outputTEXT.append("<p class='outputText'>False easting: 500000.0</p>");
		outputTEXT.append("<p class='outputText'>Central meridian: " + lng + "</p>");
		outputTEXT.append("<p class='outputText'>Scale factor: 0.9996</p>");
		
		previewMapProjection = "Transverse Mercator";
        previewMapLat0 = 0;
	} 
	
	else {
		//getting the height-to-width ratio
		var ratio = (latmax - latmin) / dlon;
		if (latmin > 0.0) {
			ratio /= Math.cos (latmin * Math.PI / 180) 
		} else if (latmax < 0.0) {
			ratio /= Math.cos (latmax * Math.PI / 180) 
		} 

		if (ratio > 1.25) {
			//Regional maps with an north-south extent
			printNSextent(property, center);
		} else if (ratio < 0.8) {
			//Regional maps with an east-west extent
			printEWextent(property, center, scale);
		} else {
			//Regional maps in square format
			printSquareFormat(property, center);
		}
	}
	if (scale > 260) {
		//general note for maps showing a smaller area
		outputTEXT.append("<p class='outputText'>_________________________________________<br>For maps at this scale, one can also use the state’s official projection. Most countries use a conformal projection for their official large-scale maps.</p>");
	}
}

/*Funcion for regional maps in square format*/
function printSquareFormat(property, center) {
	//cleaning the output
	var outputTEXT = $("#result").empty();

	//computing central meridian
	var lng = outputLON(center.lng, false);

	//formating the output
	if (property == "Conformal") {
		outputTEXT.append("<p><b>Conformal projection for regional maps in square format</b></p>");
		previewMapProjection = "Stereographic";
	} else if (property == 'Equalarea') {
		outputTEXT.append("<p><b>Equal-area projection for regional maps in square format</b></p>");
		previewMapProjection = "Azimuthal equal area";
	}
	//case: close to poles
	if (center.lat > 75.) {
		previewMapLat0 = 90;
		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Polar stereographic</b>" + 
				stringLinks("stere", NaN, 90.0, NaN, NaN, center.lng, NaN) + "</p>");
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Polar Lambert azimuthal equal-area</b>" + 
				stringLinks("laea", NaN, 90.0, NaN, NaN, center.lng, NaN) + "</p>");
		}
		outputTEXT.append("<p class='outputText'>Central meridian: " + lng + "</p>");
	}
	else if (center.lat < -75.) {
		previewMapLat0 = -90;
		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Polar stereographic</b>" + 
				stringLinks("stere", NaN, -90.0, NaN, NaN, center.lng, NaN) + "</p>");
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Polar Lambert azimuthal equal-area</b>" + 
				stringLinks("laea", NaN, -90.0, NaN, NaN, center.lng, NaN) + "</p>");
		}
		outputTEXT.append("<p class='outputText'>Central meridian: " + lng + "</p>");
	}
	//case: close to equator
	else if (center.lat > -15. && center.lat < 15.) {
		previewMapLat0 = 0;
		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Equatorial stereographic</b>"
				+ stringLinks("stere", NaN, 0.0, NaN, NaN, center.lng, NaN) + "</p>");
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Equatorial Lambert azimuthal equal-area</b>"
				+ stringLinks("laea", NaN, 0.0, NaN, NaN, center.lng, NaN) + "</p>");
		}
		outputTEXT.append("<p class='outputText'>Central meridian: " + lng + "</p>");
	}
	//case: between pole and equator
	else {
		//formating coordinates of the center
		var center_text = "Center latitude: " + outputLAT(center.lat, false) + "<br>Center longitude: " + lng;
		previewMapLat0 = center.lat;

		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Oblique stereographic</b>" 
				+ stringLinks("stere", NaN, center.lat, NaN, NaN, center.lng, NaN) + "</p>");
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Oblique Lambert azimuthal equal-area</b>"
				+ stringLinks("laea", NaN, center.lat, NaN, NaN, center.lng, NaN) + "</p>");
		}
		outputTEXT.append("<p class='outputText'>" + center_text + "</p>");
	}
	printScaleFactorNote(outputTEXT, property);
}

/*Funcion for regional maps with an north-south extent*/
function printNSextent(property, center) {
	//cleaning the output
	var outputTEXT = $("#result").empty();

	//computing central meridian
	var lng = outputLON(center.lng, false);

	//formating the output
	if (property == "Conformal") {
		outputTEXT.append("<p><b>Conformal projection for regional maps with an north-south extent</b></p>");
		outputTEXT.append("<p class='outputText'><b>Transverse Mercator</b>" + 
				stringLinks("tmerc", NaN, NaN, NaN, NaN, center.lng, NaN) + "</p>");
		previewMapProjection = "Transverse Mercator";
	} else if (property == 'Equalarea') {
		outputTEXT.append("<p><b>Equal-area projection for regional maps with an north-south extent</b></p>");
		outputTEXT.append("<p class='outputText'><b>Transverse cylindrical equal-area</b>" + 
				stringLinks("tcea", NaN, NaN, NaN, NaN, center.lng, NaN) + "</p>");
		previewMapProjection = "Transverse cylindrical equal area";
	}
	outputTEXT.append("<p class='outputText'>Central meridian: " + lng + "</p>");
	previewMapLat0 = 0;

	//formating the output note
	printScaleFactorNote(outputTEXT, property);
	if (property == "Equalarea") {
		outputTEXT.append("<p><b>Note:</b> To reduce overall distortion on the map, one can also compress the map in the north-south direction (with a factor <i>s</i>) and expand the map in east-west direction (with a factor 1 / <i>s</i>). The factor <i>s</i> can be determined with a trial-and-error approach, comparing the distortion patterns along the center and at the border of the map.</p>");
	}
}

/*Funcion for regional maps with an east-west extent*/
function printEWextent(property, center, scale) {
	//cleaning the output
	var outputTEXT = $("#result").empty();

	//computing central meridian
	var lng = outputLON(center.lng, false);

	//formating the output
	if (property == "Conformal") {
		outputTEXT.append("<p><b>Conformal projection for regional maps with an east-west extent</b></p>");
	} else if (property == 'Equalarea') {
		outputTEXT.append("<p><b>Equal-area projection for regional maps with an east-west extent</b></p>");
	}

	//case: close to poles
	if ((center.lat > 67.5 && scale < 8) || center.lat > 70) {
		previewMapLat0 = 90;
		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Polar stereographic</b>" + 
				stringLinks("stere", NaN, 90.0, NaN, NaN, center.lng, NaN) + "</p>");
			previewMapProjection = "Stereographic";
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Polar Lambert azimuthal equal-area</b>" + 
				stringLinks("laea", NaN, 90.0, NaN, NaN, center.lng, NaN) + "</p>");
			previewMapProjection = "Azimuthal equal area";
		}
	}
	else if ((center.lat < -67.5 && scale < 8) || center.lat < -70) {
		previewMapLat0 = -90;
		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Polar stereographic</b>" + 
				stringLinks("stere", NaN, -90.0, NaN, NaN, center.lng, NaN) + "</p>");
			previewMapProjection = "Stereographic";
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Polar Lambert azimuthal equal-area</b>" + 
				stringLinks("laea", NaN, -90.0, NaN, NaN, center.lng, NaN) + "</p>");
			previewMapProjection = "Azimuthal equal area";
		}
	}
	
	//case: close to equator
	else if (center.lat > -15. && center.lat < 15.) {
		previewMapLat0 = 0;
		
		var interval = (latmax - latmin) / 4.;
		var latS1 = center.lat + interval, latS2 = center.lat - interval, latS;

		if ((latS1 > 0. && latS2 > 0.) || (latS1 < 0. && latS2 < 0.))
			latS = Math.max(Math.abs(latmax), Math.abs(latmin)) / 2.;
		else
			latS = 0.;

		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Mercator</b>" + 
				stringLinks("merc", NaN, NaN, latS, NaN, center.lng, NaN) + "</p>");
			previewMapProjection = "Mercator";
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Cylindrical equal-area</b>" + 
				stringLinks("cea", NaN, NaN, latS, NaN, center.lng, NaN) + "</p>");
			previewMapProjection = "Cylindrical equal area";
		}
		
		outputTEXT.append("<p class='outputText'>Standard parallel: " + outputLAT(latS, false) + "</p>");
	}

	//case: mid-latitudes, with long strip in east-west direction
	else if ( (Math.abs(lonmax - lonmin) > 200.) && (property == "Equalarea") ) {	
		outputTEXT.append("<p class='outputText'><b>Oblique Lambert azimuthal equal-area</b>" + 
			stringLinks("laea", NaN, center.lat, NaN, NaN, center.lng, NaN) + "</p>");
		
		outputTEXT.append("<p class='outputText'>Latitude of origin: " + outputLAT(center.lat, false) + "</p>");
		
		previewMapProjection = "Azimuthal equal area";
		previewMapLat0 = center.lat;
	}	
	
	//case: between pole and equator
	else {
		//formating coordinates of the center
		var interval = (latmax - latmin) / 6.;
		var latOr = outputLAT(center.lat,        false);
		var latS1 = outputLAT(latmin + interval, false);
		var latS2 = outputLAT(latmax - interval, false);
		previewMapLat0 = center.lat;

		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Lambert conformal conic</b>" + 
				stringLinks("lcc", NaN, center.lat, latmin + interval, latmax - interval, center.lng, NaN) + '</p>');
			previewMapProjection = "Lambert conic conformal";
		} else if (property == 'Equalarea') {
			outputTEXT.append('<p class="outputText"><b>Albers equal-area conic</b>' + 
				stringLinks("aea", NaN, center.lat, latmin + interval, latmax - interval, center.lng, NaN) + '</p>');
			previewMapProjection = "Albers conic equal area";
		}
		outputTEXT.append("<p class='outputText'>Latitude of origin: " + latOr + "<br>Standard parallel 1: " + latS1 + "<br>Standard parallel 2: " + latS2 + "</p>");
	}
	
	outputTEXT.append("<p class='outputText'>Central meridian: " + lng + "</p>");

	//printing the scale factor note when case is close to pole or equator
	if (Math.abs(center.lat) < 15. || Math.abs(center.lat) > 75.) {
		printScaleFactorNote(outputTEXT, property);
	}
}

/*Funcion that prints scale factor note*/
function printScaleFactorNote(outputTEXT, property) {
	if (property == "Conformal") {
		outputTEXT.append("<p><b>Note:</b> To reduce overall area distortion on the map, one can also apply a scale factor <i>k</i>. Various values for <i>k</i> can be applied and the area distortion patterns along the center and at the border of the map are compared to select most appropriate value.</p>");
	}
}

/***OTHER RELAVANT FUNTIONS***/

/*Funtion that formats the PROJ.4 link*/
function stringLinks(prj, x0, lat0, lat1, lat2, lon0, k0) {
	var PROJstr = "+proj=";
	var WKTstr = 'PROJCS[\\\"ProjWiz_Custom_';

	// FORMATING GEOGRAPHIC\GEODETIC DATUM
	var datum = document.getElementById("datum").value, datum_str, gcs_str;

	// PROJ and WKT strings
	switch (datum) {
		case "WGS84":
			datum_str = (" +datum=" + datum);
			gcs_str = '</br>&nbsp;GEOGCS[\\\"GCS_WGS_1984\\\",</br>&nbsp;&nbsp;DATUM[\\\"D_WGS_1984\\\",</br>&nbsp;&nbsp;&nbsp;SPHEROID[\\\"WGS_1984\\\",6378137.0,298.257223563]],</br>&nbsp;&nbsp;PRIMEM[\\\"Greenwich\\\",0.0],</br>&nbsp;&nbsp;UNIT[\\\"Degree\\\",0.0174532925199433]],';
			break;
		case "ETRS89":
			datum_str = " +ellps=GRS80";
			gcs_str ='</br>&nbsp;GEOGCS[\\\"GCS_ETRS_1989\\\",</br>&nbsp;&nbsp;DATUM[\\\"D_ETRS_1989\\\",</br>&nbsp;&nbsp;&nbsp;SPHEROID[\\\"GRS_1980\\\",6378137.0,298.257222101]],</br>&nbsp;&nbsp;PRIMEM[\\\"Greenwich\\\",0.0],</br>&nbsp;&nbsp;UNIT[\\\"Degree\\\",0.0174532925199433]],';
			break;
		case "NAD83":
			datum_str = (" +datum=" + datum);
			gcs_str ='</br>&nbsp;GEOGCS[\\\"GCS_North_American_1983\\\",</br>&nbsp;&nbsp;DATUM[\\\"D_North_American_1983\\\",</br>&nbsp;&nbsp;&nbsp;SPHEROID[\\\"GRS_1980\\\",6378137.0,298.257222101]],</br>&nbsp;&nbsp;PRIMEM[\\\"Greenwich\\\",0.0],</br>&nbsp;&nbsp;UNIT[\\\"Degree\\\",0.0174532925199433]],';
			break;

		// Default
		default:
			return "";
	}
	// END of FORMATING GEOGRAPHIC\GEODETIC DATUM


	// FORMATING PROJECTION
	// PROJ string
	PROJstr += prj;

	// WKT string
	switch (prj) {
		// Azimuthal equidistant
		case "aeqd":
			WKTstr += 'Azimuthal_Equidistant\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Azimuthal_Equidistant\\\"],';
			break;
		// Lambert azimuthal
		case "laea":
			WKTstr += 'Lambert_Azimuthal\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Lambert_Azimuthal_Equal_Area\\\"],';
			break;
		// Stereographic
		case "stere":
			WKTstr += 'Stereographic\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Stereographic\\\"],';
			break;
		// Albers
		case "aea":
			WKTstr += 'Albers\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Albers\\\"],';
			break;
		// Equidistant conic
		case "eqdc":
			WKTstr += 'Equidistant_Conic\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Equidistant_Conic\\\"],';
			break;
		// Lambert conformal conic
		case "lcc":
			WKTstr += 'Lambert_Conformal_Conic\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Lambert_Conformal_Conic\\\"],';
			break;
		// Cylindrical equal-area
		case "cea":
			WKTstr += 'Cylindrical_Equal_Area\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Cylindrical_Equal_Area\\\"],';
			break;
		// Mercator
		case "merc":
			WKTstr += 'Mercator\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Mercator\\\"],';
			break;
		// Equidistant cylindrical
		case "eqc":
			WKTstr += 'Equidistant_Cylindrical\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Equidistant_Cylindrical\\\"],';
			break;
		// Transverse cylindrical equal-area
		case "tcea":
			WKTstr += 'Transverse_Cylindrical_Equal_Area\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Transverse_Cylindrical_Equal_Area\\\"],';
			break;
		// Transverse Mercator
		case "tmerc":
			WKTstr += 'Transverse_Mercator\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Transverse_Mercator\\\"],';
			break;
		// Mollweide
		case "moll":
			WKTstr += 'Mollweide\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Mollweide\\\"],';
			break;
		// Hammer
		case "hammer":
			WKTstr += 'Hammer_Aitoff\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Hammer_Aitoff\\\"],';
			break;
		// Eckert IV
		case "eck4":
			WKTstr += 'Eckert_IV\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Eckert_IV\\\"],';
			break;
		// Equal Earth
		case "eqearth":
			WKTstr += 'Equal_Earth\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Equal_Earth\\\"],';
			break;
		// Wagner IV
		case "wag4":
			WKTstr += 'Wagner_IV\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Wagner_IV\\\"],';
			break;
		// Wagner VII
		case "wag7":
			WKTstr += 'Wagner_VII\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Wagner_VII\\\"],';
			break;
		// Robinson
		case "robin":
			WKTstr += 'Robinson\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Robinson\\\"],';
			break;
		// Natural Earth
		case "natearth":
			WKTstr += 'Natural_Earth\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Natural_Earth\\\"],';
			break;
		// Winkel Tripel
		case "wintri":
			WKTstr += 'Winkel_Tripel\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Winkel_Tripel\\\"],';
			break;
		// Patterson
		case "patterson":
			WKTstr += 'Patterson\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Patterson\\\"],';
			break;
		// Plate Carrée
		case "latlong":
			WKTstr += 'Plate_Carree\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Plate_Carree\\\"],';
			break;
		// Miller cylindrical I
		case "mill":
			WKTstr += 'Miller_Cylindrical\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Miller_Cylindrical\\\"],';
			break;
		// Two-point azimuthal equidistant
		case "tpeqd":
			WKTstr += 'Two_Point_Equidistant\\\",' + gcs_str + '</br>&nbsp;PROJECTION[\\\"Two_Point_Equidistant\\\"],';
			break;

		// Default
		default:
			return "";
	}
	// END of FORMATING PROJECTION


	// FORMATING PROJECTION PARAMETERS
	// False Easting and False Northing
	if ( !isNaN(x0) ) {
		PROJstr += (" +x_0=" + x0);
		WKTstr  += '</br>&nbsp;PARAMETER[\\\"False_Easting\\\",' + x0 + '],</br>&nbsp;PARAMETER[\\\"False_Northing\\\",0.0],'
	}
	else {
		WKTstr  += '</br>&nbsp;PARAMETER[\\\"False_Easting\\\",0.0],</br>&nbsp;PARAMETER[\\\"False_Northing\\\",0.0],'
	}

	//Format output values
	lat0 = Math.round(lat0 * 1e7) / 1e7;
	lat1 = Math.round(lat1 * 1e7) / 1e7;
	lat2 = Math.round(lat2 * 1e7) / 1e7;
	lon0 = Math.round(lon0 * 1e7) / 1e7;

	// Other proj parameters
	switch (prj) {
		// Azimuthal equidistant
		case "aeqd":
		// Lambert azimuthal
		case "laea":
			PROJstr += (" +lon_0=" + lon0 + " +lat_0=" + lat0);
			WKTstr  += ('</br>&nbsp;PARAMETER[\\\"Central_Meridian\\\",' + lon0 + '],</br>&nbsp;PARAMETER[\\\"Latitude_Of_Origin\\\",' + lat0 + '],');
			break;

		// Stereographic
		case "stere":
			if ( isNaN(k0) ) {
				PROJstr += (" +lon_0=" + lon0 + " +lat_0=" + lat0);
				WKTstr  += ('</br>&nbsp;PARAMETER[\\\"Central_Meridian\\\",' + lon0 + '],</br>&nbsp;PARAMETER[\\\"Scale_Factor\\\",1.0],</br>&nbsp;PARAMETER[\\\"Latitude_Of_Origin\\\",' + lat0 + '],');
			}
			else {
				PROJstr += (" +lon_0=" + lon0 + " +lat_0=" + lat0 + " +k_0=" + k0);
				WKTstr  += ('</br>&nbsp;PARAMETER[\\\"Central_Meridian\\\",' + lon0 + '],</br>&nbsp;PARAMETER[\\\"Scale_Factor\\\",' + k0 +  '],</br>&nbsp;PARAMETER[\\\"Latitude_Of_Origin\\\",' + lat0 + '],');
			}
			break;

		// Albers
		case "aea":
		// Equidistant conic
		case "eqdc":
		// Lambert conformal conic
		case "lcc":
			PROJstr += (" +lon_0=" + lon0 + " +lat_1=" + lat1 + " +lat_2=" + lat2 + " +lat_0=" + lat0);
			WKTstr  += ('</br>&nbsp;PARAMETER[\\\"Central_Meridian\\\",' + lon0 + '],</br>&nbsp;PARAMETER[\\\"Standard_Parallel_1\\\",' + lat1 + '],</br>&nbsp;PARAMETER[\\\"Standard_Parallel_2\\\",' + lat2 + '],</br>&nbsp;PARAMETER[\\\"Latitude_Of_Origin\\\",' + lat0 + '],');
			break;

		// Cylindrical equal-area
		case "cea":
		// Equidistant cylindrical
		case "eqc":
		// Mercator
		case "merc":
			PROJstr += (" +lon_0=" + lon0 + " +lat_ts=" + lat1);
			WKTstr  += ('</br>&nbsp;PARAMETER[\\\"Central_Meridian\\\",' + lon0 + '],</br>&nbsp;PARAMETER[\\\"Standard_Parallel_1\\\",' + lat1 + '],');
			break;

		// Transverse cylindrical equal-area
		case "tcea":
		// Transverse Mercator
		case "tmerc":
			if ( isNaN(k0) ) {
				PROJstr += (" +lon_0=" + lon0);
				WKTstr  += ('</br>&nbsp;PARAMETER[\\\"Central_Meridian\\\",' + lon0 + '],</br>&nbsp;PARAMETER[\\\"Scale_Factor\\\",1.0],</br>&nbsp;PARAMETER[\\\"Latitude_Of_Origin\\\",0.0],');
			}
			else {
				PROJstr += (" +lon_0=" + lon0 + " +k_0=" + k0);
				WKTstr  += ('</br>&nbsp;PARAMETER[\\\"Central_Meridian\\\",' + lon0 + '],</br>&nbsp;PARAMETER[\\\"Scale_Factor\\\",' + k0 +  '],</br>&nbsp;PARAMETER[\\\"Latitude_Of_Origin\\\",0.0],');
			}
			break;

		// Mollweide
		case "moll":
		// Hammer
		case "hammer":
		// Eckert IV
		case "eck4":
		// Equal Earth
		case "eqearth":
		// Wagner IV
		case "wag4":
		// Wagner VII
		case "wag7":
		// Robinson
		case "robin":
		// Natural Earth
		case "natearth":
		// Patterson
		case "patterson":
		// Plate Carrée
		case "latlong":
		// Miller cylindrical I
		case "mill":
			PROJstr += (" +lon_0=" + lon0);
			WKTstr  += ('</br>&nbsp;PARAMETER[\\\"Central_Meridian\\\",' + lon0 + '],');
			break;

		// Winkel Tripel
		case "wintri":
			PROJstr += (" +lon_0=" + lon0);
			WKTstr  += ('</br>&nbsp;PARAMETER[\\\"Central_Meridian\\\",' + lon0 + '],</br>&nbsp;PARAMETER[\\\"Standard_Parallel_1\\\",50.467],');
			break;

		// Two-point azimuthal equidistant
		case "tpeqd":
			PROJstr += (" +lat_1=" + lat0 + " +lon_1=" + lat1 + " +lat_2=" + lat2 + " +lon_2=" + lon0);
			WKTstr  += ('</br>&nbsp;PARAMETER[\\\"Latitude_Of_1st_Point\\\",' + lat0 + '],</br>&nbsp;PARAMETER[\\\"Latitude_Of_2nd_Point\\\",' + lat2 + '],</br>&nbsp;PARAMETER[\\\"Longitude_Of_1st_Point\\\",' + lat1 + '],</br>&nbsp;PARAMETER[\\\"Longitude_Of_2nd_Point\\\",' + lon0 + '],');
			break;

		// Default
		default:
			return "";
	}
	
	// FORMATING LINEAR UNIT and CLOSING STRINGS
	var unit = document.getElementById("unit").value;

	// PROJ and WKT strings
	switch (unit) {
		case "m":
			PROJstr += ( datum_str + " +units=m +no_defs");
			WKTstr  += ('</br>&nbsp;UNIT[\\\"Meter\\\",1.0]]');
			break;
		case "ft":
			PROJstr += ( datum_str + " +units=ft +no_defs");
			WKTstr  += ('</br>&nbsp;UNIT[\\\"Foot\\\",0.3048]]');
			break;
		// Default
		default:
			return "";
	}
	// END of FORMATING LINEAR UNIT and CLOSING STRINGS

	return " <a href='#' onclick=\'copyPROJstring(\"" + PROJstr + "\")\' class=\'linkPROJ4\'>PROJ</a>" + 
	       " <a href='#' onclick=\'copyWKTstring(\"" + WKTstr  + "\")\' class=\'linkPROJ4\'>WKT</a>";
}

/* Callback function for PROJ strings */
function copyPROJstring(text) {
	//Defining window size
	var dWidth = $(window).width() * 0.5;
	var dHeight = $(window).height() * 0.5;
	
	dWidth = Math.min(dWidth, dHeight);
	if (dWidth > 375) dWidth = 375;
	
	//Setting PROJ dialog content
	var ProjDialog = $( "#PROJ" ).empty();

	ProjDialog.append("<p><b>Copy PROJ string to clipboard (Ctrl + C or ⌘ + C):</b></p>");
	ProjDialog.append("<p>" + text + "</p>");
	
	//Setting dialog window
	ProjDialog.dialog({
		modal : true,
		show : 'puff',
		hide : 'explode',
		width : dWidth,
		height : dWidth,
		buttons : {
			Close : function() {
				$(this).dialog("close");
			}
		}
	});

	//Opening dialog window
	ProjDialog.dialog( "open" );
}

/* Callback function for WKT strings */
function copyWKTstring(text) {
	//Defining window size
	var dWidth = $(window).width() * 0.5;
	var dHeight = $(window).height() * 0.5;
	
	dWidth = Math.min(dWidth, dHeight);
	if (dWidth > 375) dWidth = 375;
	
	//Setting PROJ dialog content
	var ProjDialog = $( "#WKT" ).empty();

	ProjDialog.append("<p><b>Copy WKT string to clipboard (Ctrl + C or ⌘ + C):</b></p>");
	ProjDialog.append("<p>" + text + "</p>");
	
	//Setting dialog window
	ProjDialog.dialog({
		modal : true,
		show : 'puff',
		hide : 'explode',
		width : dWidth,
		height : dWidth,
		buttons : {
			Close : function() {
				$(this).dialog("close");
			}
		}
	});

	//Opening dialog window
	ProjDialog.dialog( "open" );
}

/*Function that formats the central meridian value for world maps*/
function worldCM(lng, outputTEXT) {
	var lon = Math.round(lng), lonS;
	
	if  ( angUnit == "DMS" ){
		if (lng < 0)
			lonS = Math.abs(lng) + "º W";
		else
			lonS = lng + "º E";
	} else {
		lonS = lng;
	} 
	
	outputTEXT.append("<p><b>Central meridian:</b> " + lonS + "</p>");
}
