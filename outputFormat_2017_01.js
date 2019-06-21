/*
 * PROJECTION WIZARD
 * Map Projection Selection Tool (update)
 * 
 * Author: Bojan Savric
 * Date: January, 2017
 * 
 */

/***MAIN OUTPUT FUNCTION***/
function makeOutput() {
	//computing a scale of the map
	var scale = 360.0 / (lonmax - lonmin) * 180.0 / (latmax - latmin);
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
		printWorld(distortion, center);

	} else if ((scale < 6) || ((Math.abs(lonmax - lonmin) > 200) && (Math.abs(center.lat) > 15)) ) {
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
		addMapPreview(center);
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
		addMapPreview(center);
	}
}

/***PRINTING WOLRD MAP PROJECTIONS***/

/*Global list of world map projections*/
var listWorld = [{//Equal-area world map projections with poles represented as points
	projection : "Mollweide",
	PROJ4 : "+proj=moll"
}, {
	projection : "Hammer (or Hammer-Aitoff)",
	PROJ4 : "+proj=hammer"
}, {
	projection : "Boggs Eumorphic",
	PROJ4 : "+proj=boggs"
}, {
	projection : "Sinusoidal",
	PROJ4 : "+proj=sinu"
},
//Equal-area world map projections with poles represented as lines
{
	projection : "Eckert IV",
	PROJ4 : "+proj=eck4"
}, {
	projection : "Wagner IV (or Putnins P2')",
	PROJ4 : "+proj=wag4"
}, {
	projection : "Wagner VII (or Hammer-Wagner)",
	PROJ4 : "+proj=wag7"
}, {
	projection : "McBryde-Thomas flat-polar quartic",
	PROJ4 : "+proj=mbtfpq"
}, {
	projection : "Eckert VI",
	PROJ4 : "+proj=eck6"
},
//Equal-area interrupted projections for world maps with poles represented as points
{
	projection : "Mollweide",
	PROJ4 : "nocode"
}, {
	projection : "Boggs Emorphic",
	PROJ4 : "nocode"
}, {
	projection : "Goode homolosine",
	PROJ4 : "+proj=igh"
}, {
	projection : "Sinusoidal",
	PROJ4 : "nocode"
},
//Equal-area interrupted projections for world maps with poles represented as lines
{
	projection : "McBryde S3",
	PROJ4 : "nocode"
},
//Compromise world map projections
{
	projection : "Natural Earth",
	PROJ4 : "+proj=natearth"
}, {
	projection : "Winkel Tripel",
	PROJ4 : "+proj=wintri"
}, {
	projection : "Robinson",
	PROJ4 : "+proj=robin"
}, {
	projection : "Wagner V",
	PROJ4 : "+proj=wag5"
}, {
	projection : "Patterson",
	PROJ4 : "+proj=patterson"
}, {
	projection : "Plate Carrée",
	PROJ4 : "+proj=latlong"
}, {
	projection : "Miller cylindrical I",
	PROJ4 : "+proj=mill"
}];

/*Output formating function for world projections*/
function worldHTML(projection, code, outputTEXT) {
	if (code.indexOf('nocode') > -1)
		outputTEXT.append("<p class='outputText'>" + projection + "</p>");
	else
		outputTEXT.append("<p class='outputText'>" + projection + proj4link(code) + "</p>");
}

/*Main small-scale output function*/
function printWorld(property, center) {
	//cleaning the output
	var outputTEXT = $("#result").empty();
	
	//formating the output text
	if (property == 'Equalarea') {
		addWorldMapPreview(center, "Mollweide", "Wagner IV");
		outputTEXT.append("<p><b>Equal-area world map projections with poles represented as points</b></p>");
		//loop through global data
		for (var i = 0; i < 4; i++) {
			worldHTML(listWorld[i].projection, listWorld[i].PROJ4 + " +lon_0=" + center.lng, outputTEXT);
		}

		outputTEXT.append("<p><b>Equal-area world map projections with poles represented as lines</b></p>");
		//loop through global data
		for (var i = 4; i < 9; i++) {
			worldHTML(listWorld[i].projection, listWorld[i].PROJ4 + " +lon_0=" + center.lng, outputTEXT);
		}

		outputTEXT.append("<p><b>Equal-area interrupted projections for world maps with poles represented as points</b></p>");
		//loop through global data
		for (var i = 9; i < 13; i++) {
			worldHTML(listWorld[i].projection, listWorld[i].PROJ4, outputTEXT);
		}

		outputTEXT.append("<p><b>Equal-area interrupted projections for world maps with poles represented as lines</b></p>");
		worldHTML(listWorld[13].projection, listWorld[13].PROJ4, outputTEXT);
		outputTEXT.append("<p class='outputText'>Any of the equal-area projections with a pole line mentioned above.</p>");
		worldCM(center.lng, outputTEXT);
	} else if (property == 'Equidistant') {
		outputTEXT.append("<p><b>Equidistant world map projections</b></p>");
		worldHTML("Polar azimuthal equidistant (centered on a pole)", "+proj=aeqd +lat_0=90 +lon_0=" + center.lng, outputTEXT);
		worldHTML("Oblique azimuthal equidistant (centered on arbitrary point)", "+proj=aeqd +lat_0=" + center.lat + " +lon_0=" + center.lng, outputTEXT);
		worldHTML("Two-point equidistant (relative to two arbitrary points)", "+proj=tpeqd +lat_1=" + center.lat + " +lon_1=" + center.lng + " +lat_2=45.56 +lon_2=90.56", outputTEXT);
		$("#previewMap").empty();
	} else {
		outputTEXT.append("<p><b>Compromise world map projections</b></p>");
		addWorldMapPreview(center, "Natural Earth", "Winkel Tripel");
		//loop through global data
		for (var i = 14; i < 18; i++) {
			worldHTML(listWorld[i].projection, listWorld[i].PROJ4 + " +lon_0=" + center.lng, outputTEXT);
		}
		outputTEXT.append("<p><b>Compromise rectangular world map projections</b></p>");
		//loop through global data
		for (var i = 18; i < 21; i++) {
			worldHTML(listWorld[i].projection, listWorld[i].PROJ4 + " +lon_0=" + center.lng, outputTEXT);
		}
		worldCM(center.lng, outputTEXT);
		outputTEXT.append("<p><b>Note:</b> Rectangular projections are not generally recommended for most world maps.</p>");
	}
}

/***PRINTING HEMISPHERE MAP PROJECTIONS***/
function printHemisphere(property, center, scale) {
	//cleaning the output
	var outputTEXT = $("#result").empty();

	//formating coordinates of the center
	var lon = Math.round(center.lng * 10.) / 10., lat, lonS, latS;

	if (center.lat > 85.) {
		lat = 90.0;
	} else if (center.lat < -85.) {
		lat = -90.0;
	} else {
		lat = Math.round(center.lat * 10.) / 10.;
	}

	//formating coordinates of the center - strings
	if (lat < 0)
		latS = Math.abs(lat) + "º S";
	else
		latS = lat + "º N";
	if (lon < 0)
		lonS = Math.abs(lon) + "º W";
	else
		lonS = lon + "º E";

	//formating center text
	var center_text = "Center latitude: " + latS + "<br>Center longitude: " + lonS;
	var centerPROJ4 = " +lat_0=" + lat + " +lon_0=" + lon;

	//formating the output text
	if (property == 'Equalarea') {
		outputTEXT.append("<p><b>Equal-area projection for maps showing a hemisphere</b></p>");
		outputTEXT.append("<p><b>Lambert azimuthal equal-area projection</b>" + proj4link("+proj=laea" + centerPROJ4) + "<br>" + center_text + "</p>");
		previewMapProjection = "AzimuthalEqualArea";
		previewMapLat0 = lat;
	} else {
		outputTEXT.append("<p><b>Equidistant projection for maps showing a hemisphere</b></p>");
		outputTEXT.append("<p class='outputText'><b>Azimuthal equidistant</b>" + proj4link("+proj=aeqd" + centerPROJ4) + "<br>" + center_text + "</p>");
		previewMapProjection = "AzimuthalEquidistant";
		previewMapLat0 = lat;
	}
}

/***PRINTING LARGE-SCALE MAP PROJECTIONS***/

/*Main large-scale output function*/

function printSmallerArea(property, center, scale) {
	//cleaning the output
	var outputTEXT = $("#result").empty();

	//formating the output text
	if (property == 'Equidistant') {
		outputTEXT.append("<p><b>Regional map projection with correct scale along some lines.</b></p>");

		//computing central meridian
		var lng = dd2dmLON(center.lng);

		//case: close to poles
		if (((center.lat > 67.5 && scale < 8) || center.lat > 70)) {
			outputTEXT.append("<p><b>Polar azimuthal equidistant</b>" + proj4link("+proj=aeqd +lat_0=90.0 +lon_0=" + center.lng) + " - distance correct along any line passing through the pole (i.e., meridian)<br>Central meridian: " + lng + "</p>");
			previewMapProjection = "AzimuthalEquidistant";
			previewMapLat0 = 90;
		}
		else if ((center.lat < -67.5 && scale < 8) || center.lat < -70) {
			outputTEXT.append("<p><b>Polar azimuthal equidistant</b>" + proj4link("+proj=aeqd +lat_0=-90.0 +lon_0=" + center.lng) + " - distance correct along any line passing through the pole (i.e., meridian)<br>Central meridian: " + lng + "</p>");
			previewMapProjection = "AzimuthalEquidistant";
			previewMapLat0 = -90;
		}
		
		//case: close to equator
		else if (center.lat > -15. && center.lat < 15.) {
			outputTEXT.append("<p><b>Plate Carrée</b>" + proj4link("+proj=eqc +lon_0=" + center.lng) + " (or equidistant cylindrical) - distance correct along meridians<br>Central meridian: " + lng + "</p>");
			previewMapProjection = "PlateCarree";
			previewMapLat0 = 0;
		}
		//case: between pole and equator
		else {
			//computing standard paralles
			var interval = (latmax - latmin) / 6;
			var latOr = dd2dmLAT(center.lat);
			var latS1 = dd2dmLAT(latmin + interval);
			var latS2 = dd2dmLAT(latmax - interval);

			//formating the output
			outputTEXT.append("<p class='outputText'><b>Equidistant conic</b>" + proj4link("+proj=eqdc +lat_1=" + (latmin + interval) + " +lat_2=" + (latmax - interval) + " +lon_0=" + center.lng) + " - distance correct along meridians</p>");
			outputTEXT.append("<p class='outputText'>Latitude of origin: " + latOr + "<br>Standard parallel 1: " + latS1 + "<br>Standard parallel 2: " + latS2 + "<br>Central meridian: " + lng + "</p>");
			outputTEXT.append("<p class='outputText'><br><b>Oblique azimuthal equidistant</b>" + proj4link("+proj=aeqd +lat_0=" + center.lat + " +lon_0=" + center.lng) + " - distance correct along any line passing through the center of the map (i.e., great circle)</p>");
			outputTEXT.append("<p class='outputText'>Center latitude: " + dd2dmLAT(center.lat) + "<br>Center longitude: " + lng + "</p>");
			
			previewMapProjection = "ConicEquidistant";
			previewMapLat0 = center.lat;
		}
		outputTEXT.append('<p><b>Note:</b> In some rare cases, it is useful to retain scale along great circles in regional and large-scale maps. Map readers can make precise measurements along these lines that retain scale. It is important to remember that no projection is able to correctly display all distances and that only some distances are retained correctly by these "equidistant" projections.</p>');

	} else {
		//getting the height-to-width ratio
		var ratio = (latmax - latmin) / (lonmax - lonmin);

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
	var lng = dd2dmLON(center.lng);

	//formating the output
	if (property == "Conformal") {
		outputTEXT.append("<p><b>Conformal projection for regional maps in square format</b></p>");
		previewMapProjection = "Stereographic";
	} else if (property == 'Equalarea') {
		outputTEXT.append("<p><b>Equal-area projection for regional maps in square format</b></p>");
		previewMapProjection = "AzimuthalEqualArea";
	}
	//case: close to poles
	if (center.lat > 75.) {
		previewMapLat0 = 90;
		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Polar Stereographic</b>" + proj4link("+proj=stere +lat_0=90.0 +lon_0=" + center.lng) + "</p>");
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Polar Lambert azimuthal equal-area</b>" + proj4link("+proj=laea +lat_0=90.0 +lon_0=" + center.lng) + "</p>");
		}
		outputTEXT.append("<p class='outputText'>Central meridian: " + lng + "</p>");
	}
	else if (center.lat < -75.) {
		previewMapLat0 = -90;
		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Polar Stereographic</b>" + proj4link("+proj=stere +lat_0=-90.0 +lon_0=" + center.lng) + "</p>");
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Polar Lambert azimuthal equal-area</b>" + proj4link("+proj=laea +lat_0=-90.0 +lon_0=" + center.lng) + "</p>");
		}
		outputTEXT.append("<p class='outputText'>Central meridian: " + lng + "</p>");
	}
	//case: close to equator
	else if (center.lat > -15. && center.lat < 15.) {
		previewMapLat0 = 0;
		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Equatorial Stereographic</b>" + proj4link("+proj=stere +lon_0=" + center.lng) + "</p>");
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Equatorial Lambert azimuthal equal-area</b>" + proj4link("+proj=laea +lon_0=" + center.lng) + "</p>");
		}
		outputTEXT.append("<p class='outputText'>Central meridian: " + lng + "</p>");
	}
	//case: between pole and equator
	else {
		//formating coordinates of the center
		var center_text = "Center latitude: " + dd2dmLAT(center.lat) + "<br>Center longitude: " + lng;
		var centerPROJ4 = " +lat_0=" + center.lat + " +lon_0=" + center.lng;
		previewMapLat0 = center.lat;

		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Oblique Stereographic</b>" + proj4link("+proj=stere" + centerPROJ4) + "</p>");
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Oblique Lambert azimuthal equal-area</b>" + proj4link("+proj=laea" + centerPROJ4) + "</p>");
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
	var lng = dd2dmLON(center.lng);

	//formating the output
	if (property == "Conformal") {
		outputTEXT.append("<p><b>Conformal projection for regional maps with an north-south extent</b></p>");
		outputTEXT.append("<p class='outputText'><b>Transverse Mercator</b>" + proj4link("+proj=tmerc +lon_0=" + center.lng) + "</p>");
		previewMapProjection = "TransverseMercator";
	} else if (property == 'Equalarea') {
		outputTEXT.append("<p><b>Equal-area projection for regional maps with an north-south extent</b></p>");
		outputTEXT.append("<p class='outputText'><b>Transverse cylindrical equal-area</b>" + proj4link("+proj=tcea +lon_0=" + center.lng) + "</p>");
		previewMapProjection = "TransverseCylindrical";
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
	var lng = dd2dmLON(center.lng);

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
			outputTEXT.append("<p class='outputText'><b>Polar Stereographic</b>" + proj4link("+proj=stere +lat_0=90.0 +lon_0=" + center.lng) + "</p>");
			previewMapProjection = "Stereographic";
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Polar Lambert azimuthal equal-area</b>" + proj4link("+proj=laea +lat_0=90.0 +lon_0=" + center.lng) + "</p>");
			previewMapProjection = "AzimuthalEqualArea";
		}
	}
	else if ((center.lat < -67.5 && scale < 8) || center.lat < -70) {
		previewMapLat0 = -90;
		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Polar Stereographic</b>" + proj4link("+proj=stere +lat_0=-90.0 +lon_0=" + center.lng) + "</p>");
			previewMapProjection = "Stereographic";
		} else if (property == 'Equalarea') {
			outputTEXT.append("<p class='outputText'><b>Polar Lambert azimuthal equal-area</b>" + proj4link("+proj=laea +lat_0=-90.0 +lon_0=" + center.lng) + "</p>");
			previewMapProjection = "AzimuthalEqualArea";
		}
	}
	
	//case: close to equator
	else if (center.lat > -15. && center.lat < 15.) {
		previewMapLat0 = 0;
		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Mercator</b>" + proj4link("+proj=merc +lon_0=" + center.lng) + "</p>");
			previewMapProjection = "Mercator";
		} else if (property == 'Equalarea') {
			var interval = (latmax - latmin) / 4.;
			var latS1 = center.lat + interval, latS2 = center.lat - interval, latS;

			if ((latS1 > 0. && latS2 > 0.) || (latS1 < 0. && latS2 < 0.))
				latS = Math.max(Math.abs(latmax), Math.abs(latmin)) / 2.;
			else
				latS = 0.;

			var latSt = dd2dmLAT(latS);
			outputTEXT.append("<p class='outputText'><b>Cylindrical equal-area</b>" + proj4link("+proj=cea +lat_ts=" + latS + " +lon_0=" + center.lng) + "<br>Standard parallel: " + latSt + "</p>");
			previewMapProjection = "CylindricalEqualArea";
		}
	}
	//case: between pole and equator
	else {
		//formating coordinates of the center
		var interval = (latmax - latmin) / 6.;
		var latOr = dd2dmLAT(center.lat);
		var latS1 = dd2dmLAT(latmin + interval);
		var latS2 = dd2dmLAT(latmax - interval);
		previewMapLat0 = center.lat;

		if (property == "Conformal") {
			outputTEXT.append("<p class='outputText'><b>Lambert conformal conic</b>" + proj4link("+proj=lcc +lat_1=" + (latmin + interval) + " +lat_2=" + (latmax - interval) + " +lon_0=" + center.lng) + "</p>");
			previewMapProjection = "ConicConformal";
		} else if (property == 'Equalarea') {
			outputTEXT.append('<p class="outputText"><b>Albers equal-area conic</b>' + proj4link("+proj=aea +lat_1=" + (latmin + interval) + " +lat_2=" + (latmax - interval) + " +lon_0=" + center.lng) + '</p>');
			previewMapProjection = "ConicEqualArea";
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
function proj4link(code) {
	return " <a href='#' onclick=\'copyPROJ4(\"" + code + "\")\' class=\'linkPROJ4\'>PROJ.4</a>";
}

/*Callback function for PROJ.4 link*/
function copyPROJ4(text) {
	window.prompt("Copy PROJ.4 code to clipboard (Ctrl + C or ⌘ + C):", text);
}

/*Funtion that formats the central meridian value for world maps*/
function worldCM(lng, outputTEXT) {
	var lon = Math.round(lng), lonS;
	if (lon < 0)
		lonS = Math.abs(lon) + "º W";
	else
		lonS = lon + "º E";
	outputTEXT.append("<p><b>Central meridian:</b> " + lonS + "</p>");
}


