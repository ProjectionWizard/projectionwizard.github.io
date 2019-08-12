/*
 * PROJECTION WIZARD v2.0
 * Map Projection Selection Tool
 *
 * Author: Bojan Savric
 * Date: August, 2019
 *
 */

window.onload = init;

/*GLOBAL VARIABLES*/
//map and layers
var map, rectangle, angUnit, attributionControl;
//bounds of the rectangle
var latmax, latmin, lonmax, lonmin;
//preview map variables
var previewMapProjection, previewMapLat0;

/*Updating rectangle bounds*/
function updateMapArea (N, S, E, W) {
	latmax = N;
	latmin = S;
	lonmax = E;
	lonmin = W;
	swapCoordinates();
}

/*Reading geographic coordinates*/
function readLAT(latS) {
	if  ( angUnit == "DMS" ){
		return dms2ddLAT(latS);
	}

	return parseFloat(latS);
}

function readLON(lonS) {
	if  ( angUnit == "DMS" ){
		return dms2ddLON(lonS);
	}

	return parseFloat(lonS);
}

/*Outputing geographic coordinates*/
function outputLAT(lat, ui_bool) {
	if  ( angUnit == "DMS" ){
		if  ( ui_bool ){
			return dd2dmsLAT(lat);
		}

		return dd2dmLAT(lat);
	}

	return Math.round(lat * 1e7) / 1e7;
}

function outputLON(lon, ui_bool) {
	if  ( angUnit == "DMS" ){
		if  ( ui_bool ){
			return dd2dmsLON(lon);
		}

		return dd2dmLON(lon);
	}

	return Math.round(lon * 1e7) / 1e7;
}

/*Updating input boxes*/
function setInputBoxes() {
	document.getElementById("latmax").value = outputLAT(latmax, true);
	document.getElementById("latmin").value = outputLAT(latmin, true);
	document.getElementById("lonmax").value = outputLON(lonmax, true);
	document.getElementById("lonmin").value = outputLON(lonmin, true);
}

function swapCoordinates() {
	//when the user change the direction
	var temp;
	if (lonmin > lonmax) {
		temp = lonmin;
		lonmin = lonmax;
		lonmax = temp;
	}
	if (latmax < latmin) {
		temp = latmax;
		latmax = latmin;
		latmin = temp;
	}
}


/*Updating rectangle*/
function updateRectangle() {
	//update inputs
	setInputBoxes();

	//updating bounds for the rectangle on the map
	var SouthWest = new L.LatLng(latmin, lonmin),
	NorthEast = new L.LatLng(latmax, lonmax),
	bounds = new L.LatLngBounds(SouthWest, NorthEast);

	rectangle.pm.disable();
	rectangle.setBounds(bounds);

	//Display the output
	makeOutput();

	rectangle.pm.enable({
		allowSelfIntersection: false
	})

	map.pm.enableGlobalDragMode()
}


/*INPUT BOX CALLBACK FUNCTION*/
//This function is called in index.html
function changeInput () {
	// Reading from the input and fixing values
	var North = readLAT(document.getElementById("latmax").value);
	if (North > 85.0) {
		North = 90.0;
	}
	var South = readLAT(document.getElementById("latmin").value);
	if (South < -85.0) {
		South = -90.0;
	}
	var East = readLON(document.getElementById("lonmax").value);
	var West = readLON(document.getElementById("lonmin").value);

	//Updating the rectangle
	updateMapArea(North, South, East, West);
	updateRectangle();
}


/*RESET BUTTON CALLBACK FUNCTION*/
function resetUI(map) {
	//Updating Radio List
	//document.getElementById("Equalarea").checked = true;

	//Updating the rectangle
	updateMapArea( 90.0, -90.0, 180.0, -180.0 );
	updateRectangle();

	//Updating the map view
	map.setView( [0, 0], 0);
}


/*FIT BUTTON CALLBACK FUNCTION*/
function fitSquare(map) {
	//getting bounds from the map
	var zoomBounds = map.getBounds();
	var zoomCenter = map.getCenter();
	var SW = zoomBounds.getSouthWest();
	var NE = zoomBounds.getNorthEast();

	//getting the interval
	var dLat = Math.min(Math.abs(NE.lat - zoomCenter.lat), Math.abs(zoomCenter.lat - SW.lat))*0.8;
	var dLon = (NE.lng - SW.lng) / 2.5;
	if (dLon > 180.0)
		dLon = 180.0;

	//setting new bounds for the rectangle
	var North = zoomCenter.lat + dLat;
	if (North > 90.0)
		North = 90.0;

	var South = zoomCenter.lat - dLat;
	if (South < -90.0)
		South = -90.0;

	var East = zoomCenter.lng + dLon;

	var West = zoomCenter.lng - dLon;

	// updating the bounds in the input form boxes
	updateMapArea(North, South, East, West);
	updateRectangle();
}


/*MAP MOUSEMOVE CALLBACK FUNCTION*/
//For every move, attribution displays mouse position
function showCoords(event) {
	var stringPos = "";

	//LATITUDE STRING
	stringPos = outputLAT(event.latlng.lat, true) + "  |  ";

	//LONGITUDE STRING
	var lam = event.latlng.lng;

	while (lam < -180.0) {
		lam += 360.0;
	}
	while (lam > 180.0) {
		lam -= 360.0;
	}

	stringPos += outputLON(lam, true);

	//CHANGING ATTRIBUTION CONTROL
	attributionControl.setPrefix(stringPos);
}

/*CREATES BACKGROUND LAYER*/
function loadBaseLayer(map) {
	var esriNatGeoURL = 'https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile//{z}/{y}/{x}.png';
	L.tileLayer(esriNatGeoURL, {
		maxZoom: 10
	}).addTo(map)
}

function toggleAnchorVisibility () {
	/* ideally pm would update the anchors as the geometry is dragged.
	as a workaround, we can just hide them temporarily */
	const elements = document.querySelectorAll('.marker-icon')
		elements.forEach(handle => {
			(handle.style.display === 'none') ? handle.style.display = '' : handle.style.display = 'none';
		})
}

/*ADDS A SELECTED AREA RECTANGLE*/
function addRectangle (map) {
	updateMapArea( 90.0, -90.0, 180.0, -180.0 );

	//Creating rectangle
	rectangle = L.rectangle([[latmax, lonmax], [latmin, lonmin]]);

	// updating the bounds in the input form
	setInputBoxes();

	rectangle.on('pm:edit', function (e) {
		const rectangle = e.sourceTarget;
		// reading changed bounds
		var newBounds = rectangle.getBounds();
		var SW = newBounds.getSouthWest();
		var NE = newBounds.getNorthEast();

		// updating the bounds
		updateMapArea( NE.lat, SW.lat, NE.lng, SW.lng );

		// update the rest of the UI
		setInputBoxes();
		makeOutput();
	});

	rectangle.on("pm:markerdragstart", function() {
		toggleAnchorVisibility();
	})

	rectangle.on("pm:markerdragend", function() {
		toggleAnchorVisibility();
	})

	// IN PROGRESS: testing redrawing the output canvas during rectangle drag
	rectangle.on("pm:drag", function(e) {
		// TODO: also call updateMapArea() and setInputBoxes()
		makeOutput();
	});

	rectangle.on("pm:markerdrag", function(e) {
		const liveCorner = e.markerEvent.latlng
		const allCorners = e.sourceTarget.getLatLngs();

		// loop through each rectangle vertex to determine which one is opposite the corner being dragged
		for (i = 0; i < allCorners[0].length; i++) {
			if (liveCorner.lat !== allCorners[0][i].lat && liveCorner.lng !== allCorners[0][i].lng) {
				var oppositeCorner = allCorners[0][i];
				break;
			}
		}

		const deltaLng = Math.abs(liveCorner.lng - oppositeCorner.lng);

		// dont allow the horizontal span of the rectangle to exceed 360deg
		if (deltaLng > 360) {
			if (liveCorner.lng < oppositeCorner.lng)
			oppositeCorner.lng = liveCorner.lng + 360.0;
			else
			oppositeCorner.lng = liveCorner.lng - 360.0;
		}

		updateMapArea(liveCorner.lat, oppositeCorner.lat, liveCorner.lng, oppositeCorner.lng);

		// update Rectangle bounds *without* toggling edit mode
		var SouthWest = new L.LatLng(latmin, lonmin),
    NorthEast = new L.LatLng(latmax, lonmax),
		bounds = new L.LatLngBounds(SouthWest, NorthEast);
		rectangle.setBounds(bounds);
		setInputBoxes();

		// IN PROGRESS: testing redrawing the output canvas during rectangle vertex marker drag
		makeOutput();
	});

	//Event handler: Double click the rectangle
	rectangle.on("dblclick", function(e) {
		// reading bounds
		var recBounds = e.sourceTarget.getBounds();
		//fitting view on rectangle extent
		map.fitBounds(recBounds);
	});

	//Event handler: Mouse over the rectangle
	rectangle.on("mouseover", function(e) {
		//Seting starting style
		rectangle.setStyle({
				color : "#ff7b1a"
			});
	});

	//Event handler: Mouse out the rectangle
	rectangle.on("mouseout", function(e) {
		//Seting starting style
		rectangle.setStyle({
			color : "#3388ff"
		});
	});

	rectangle.on('pm:dragstart', function (e) {
		toggleAnchorVisibility();
	})

	rectangle.on('pm:dragend', function (e) {
		toggleAnchorVisibility();

		rectangle.pm.enable({
			allowSelfIntersection: false
		})
	})

	//Adding layer to the map
	map.addLayer(rectangle);

	rectangle.pm.toggleEdit({
		allowSelfIntersection: false
	})

	// allow both dragging and resizing the rectangle
	map.pm.toggleGlobalDragMode();
}

/*MAIN FUNCTION*/
function init() {
	//Selecting equal-area radio button
	document.getElementById("Equalarea").checked = true;

	//Seting angular unit
	angUnit = $('input[name=ang_format]:checked').val();

	//Options button
	$( "#options_dialog" ).dialog({ autoOpen: false });
	$( "#settings" ).button();
	$( "#settings" ).click(function() {
		//Setting dialog content
		var NewDialog = $( "#options_dialog" );
		//Setting dialog window
		NewDialog.dialog({
			modal : true,
			show : 'puff',
			hide : 'explode',
			width : 300,
			height : 300,
			title : "Projection Wizard Options",
			buttons : {
				OK : function() {
					$(this).dialog("close");
					angUnit = $('input[name=ang_format]:checked').val();
					updateRectangle();
				}
			}
		});

		//Opening dialog window
		NewDialog.dialog( "open" );
	});

	//Help button
	$( "#dialog" ).dialog({ autoOpen: false });
	$( "#help" ).button();
	$( "#help" ).click(function() {
		//Defining window size
		var dWidth = $(window).width() * .5;
		if (dWidth > 600) dWidth = 800;
		var dHeight = $(window).height() * .7;

		//Setting dialog content
		var NewDialog = $( "#dialog" );
		//Setting dialog window
		NewDialog.dialog({
			modal : true,
			show : 'puff',
			hide : 'explode',
			width : dWidth,
			height : dHeight,
			title : "Projection Wizard",
			buttons : {
				OK : function() {
					$(this).dialog("close");
				}
			}
		});

		//Opening dialog window
		NewDialog.dialog( "open" );
	});

	//Tooltip call
	$(function() {
		$(document).tooltip();
	});

	//Creates a map
	map = new L.Map('map', {
		attributionControl: false,
		doubleClickZoom: false
	}).setView([0,0], 0);

	//Fit bounds button
	$("#fit").button();
	$("#fit").click(function() {
		fitSquare(map)
	});

	//Reset button
	$("#reset").button();
	$("#reset").click(function() {
		resetUI(map)
	});

	//Reset button
	$("#view").button();
	$("#view").click(function() {
		//Updating the map view
		map.setView([0.0, rectangle.getBounds().getCenter().lng], 0);
	});

	//Event handlers of the map
	map.on("mousemove", showCoords);
	map.on("mouseout", function(e) {
		attributionControl.setPrefix(false);
	});

	//Resizing preview map
	window.addEventListener("resize", function() {

	});

	//Adding attribution control to the map
	attributionControl = new L.Control.Attribution({
		prefix: false
	}).addTo(map);

	//Loading base layer
	loadBaseLayer(map);

	//Add the rectangle box to the map
	addRectangle(map);

	//Display the output
	makeOutput();
}
