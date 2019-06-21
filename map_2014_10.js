/*
 * PROJECTION WIZARD
 * Map Projection Selection Tool (update)
 * 
 * Author: Bojan Savric
 * Date: October, 2014
 * 
 */

window.onload = init;

/*GLOBAL VARIABLES*/
//map and layers
var map, rectangle, attrubutionControl; 
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


/*Updating input boxes*/
function setInputBoxes() {
	document.getElementById("latmax").value = dd2dmsLAT(latmax);
	document.getElementById("latmin").value = dd2dmsLAT(latmin);
	document.getElementById("lonmax").value = dd2dmsLON(lonmax);
	document.getElementById("lonmin").value = dd2dmsLON(lonmin);
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
    
    //setting new boud to the rectangle
    rectangle.editing.disable();
	rectangle.setBounds(bounds);
	rectangle.editing.enable();
	
	//Display the output
	makeOutput();
}


/*INPUT BOX CALLBACK FUNCTION*/
//This function is called in index.html
function changeInput () {
	// Reading from the input and fixing values
	var North = dms2ddLAT(document.getElementById("latmax").value);
	if (North > 85.0) {
		North = 90.0;
	}
	var South = dms2ddLAT(document.getElementById("latmin").value);
	if (South < -85.0) {
		South = -90.0;
	}
	var East = dms2ddLON(document.getElementById("lonmax").value);
	var West = dms2ddLON(document.getElementById("lonmin").value);
	
	//Updating the rectangle
	updateMapArea(North, South, East, West);
	updateRectangle();
}


/*RESET BUTTON CALLBACK FUNCTION*/
function resetUI(event) {
	//Updating Radio List
	//document.getElementById("Equalarea").checked = true;
	
	//Updating the rectangle
	updateMapArea( 90.0, -90.0, 180.0, -180.0 );
	updateRectangle();
	
	//Updating the map view
	map.setView( [0.0, 0.0], 0);
}


/*FIT BUTTON CALLBACK FUNCTION*/
function fitSquare(event) {
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


/*MAP MOUSEMOVE CALLBACK FUNTION*/
//For every move, attribution displays mouse position
function showCoords(event) {
	var letter, deg, min, sec;
	var stringPos = "";
	
	//LATITUDE STRING
	stringPos = dd2dmsLAT(event.latlng.lat) + "  |  ";
	
	//LONGITUDE STRING
	var lam = event.latlng.lng;
	
	while (lam < -180.0) {
		lam += 360.0;
	}
	while (lam > 180.0) {
		lam -= 360.0;
	}
	
	stringPos += dd2dmsLON(lam);
	
	//CHANGING ATTRIBUTION CONTROL
	attrubutionControl.setPrefix(stringPos);
}


/*CREATES BACKGROUND LAYER*/
function loadBaseLayer() {
	var esriNatGeoURL = 'http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile//{z}/{y}/{x}.png';
	var NatGeoLayer = new L.TileLayer(esriNatGeoURL, {
		maxZoom : 10
	});

	//adding layer to the map
	map.addLayer(NatGeoLayer);
}


/*ADDS A SELECTED AREA RECTANGLE*/
function addRectangle () {
	updateMapArea( 90.0, -90.0, 180.0, -180.0 );
	
	//Creating rectangle
	rectangle = L.rectangle([[latmax, lonmax], [latmin, lonmin]]);
	
	// updating the bounds in the input form
	setInputBoxes();

	rectangle.editing.enable();
	
	//Event handler: Editing the rectangle
	rectangle.on("edit", function(e) {
		// reading changed bounds
		var newBounds = rectangle.getBounds();
		var SW = newBounds.getSouthWest();
		var NE = newBounds.getNorthEast();

		// updating the bounds
		updateMapArea( NE.lat, SW.lat, NE.lng, SW.lng );
		updateRectangle();
	}); 
	
	//Event handler: Double click the rectangle
	rectangle.on("dblclick", function(e) {
		// reading bounds
		var recBounds = rectangle.getBounds();
		//fitting view on rectangle extent
		map.fitBounds(recBounds);
	}); 
	
	//Event handler: Mouse over the rectangle
	rectangle.on("mouseover", function(e) {
		//Seting starting style
		rectangle.setStyle({
				color : "#03f",
				fillColor : "#03f",
				fillOpacity : 0.2,
				dashArray : null
			});
		
		//Changing the markers to red
		var markers = $(".leaflet-div-icon");
		markers.removeClass('leaflet-div-icon').addClass('leaflet-div-newicon');
	}); 
	
	//Event handler: Mouse out the rectangle
	rectangle.on("mouseout", function(e) {
		//Seting starting style
		rectangle.setStyle({
				color : "#03f",
				fillColor : "#03f",
				fillOpacity : 0.2,
				dashArray : null
			});
		
		//Changing the markers bact to white
		var markers = $(".leaflet-div-newicon");
		markers.removeClass('leaflet-div-newicon').addClass('leaflet-div-icon');
	}); 

	//Adding layer to the map
	map.addLayer(rectangle);
}


/*MAIN FUNCTION*/
function init() {
	//Selecting equal-area radio button
	document.getElementById("Equalarea").checked = true;

	//Help button
	$("#help").button();
	$("#help").click(function() {
		//Defining window size
		var dWidth = $(window).width() * .5;
		if (dWidth > 600) dWidth = 800;
		var dHeight = $(window).height() * .7;

		//Setting dialog content
		var NewDialog = $(helpWindow());
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
		return false;
	});

	//Reset button
	$("#reset").button();
	$("#reset").click(resetUI);

	//Reset button
	$("#view").button();
	$("#view").click(function() {
		//Updating the map view
		map.setView([0.0, rectangle.getBounds().getCenter().lng], 0);
	}); 

	//Fit bounds button
	$("#fit").button();
	$("#fit").click(fitSquare);

	//Tooltip call
	$(function() {
		$(document).tooltip();
	}); 

	//Creates a map
	map = new L.Map('map', {
		attributionControl : false
	});
	//Centers map and default zoom level
	map.setView([0.00, 0.00], 0);
	//Event handlers of the map
	map.on("mousemove", showCoords);
	map.on("mouseout", function(e) {
		attrubutionControl.setPrefix(false);
	});

	//Resizing preview map
	window.addEventListener("resize", function() {

	});

	//Adding attribution control to the map
	attrubutionControl = new L.Control.Attribution({
		"prefix" : false
	}).addTo(map);

	//Loading base layer
	loadBaseLayer();

	//Add the rectangle box to the map
	addRectangle();
	
	//Display the output
	makeOutput();
}
