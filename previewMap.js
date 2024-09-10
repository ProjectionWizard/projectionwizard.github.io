/*
 * PROJECTION WIZARD v2.0
 * Map Projection Selection Tool
 * 
 * Author: Bojan Savric, Jacob Wasilkowski
 * Date: May, 2020
 * 
 */

var world110m, world50m;

/***MAP DRAW FUNCTION FOR SMALL-SCALE***/
function addWorldMapPreview(center, projection, currentlyDragging) {
	var activeDistortion = $('input[name=distortion]:checked').val();
	
	// Updates the active projection
	activeProjection = projection;
	
	// Updates default displays for the 3 world projections per distortion
	// property (this helps maintain the most recently chosen world projection
	// by the user in the d3 canvas map and the html text styling)
	if (activeDistortion === 'Equalarea') {
		activeWorldEqAreaProj = projection;
	} else if (activeDistortion === 'Equidistant') {
		activeWorldEqDistProj = projection;
	} else if (activeDistortion === 'Compromise') {
		activeWorldComproProj = projection;
	}
	
	highlightActiveProjectionNode();

	//Creating canvas HTML element
	if ( projection == 'Two-point equidistant' ) {
		addCanvasMap(lat1_eq, lng1_eq, projection, 1, currentlyDragging);
	}
	else if ( projection == 'Oblique azimuthal equidistant' )
	{
		addCanvasMap(latC_eq, lngC_eq, projection, 1, currentlyDragging);
	}
	else {
		addCanvasMap(0, center.lng, projection, 1, currentlyDragging);
	}

	//adding class to split text and map preview
	$("#result").addClass("results");
}

/***MAP DRAW FUNCTIONS FOR onmouseover***/
function updateWorldMap(projection) {
	//getting a center of the map
	var center = rectangle.getBounds().getCenter();
	
	addWorldMapPreview(center, projection, false);
}

function updateEquidistantMap(projection) {
	//getting a center of the map
	var center = rectangle.getBounds().getCenter();
	
	// Updates the active projection and default display
	// for the equidistant projection between pole and equator
	activeEqDistProj = activeProjection = projection;
	
	previewMapProjection = projection;
	addMapPreview(center, false);
}

function highlightActiveProjectionNode() {
	// remove ".active-projection" class from all projection title DOM nodes that have a custom proj-name data property
	var optionalProjectionsNodeList = document.querySelectorAll('[data-proj-name]');
	for (var i = 0; i < optionalProjectionsNodeList.length; i++) {
		var node = optionalProjectionsNodeList[i];
		node.classList.remove('active-projection');
	}

	// add ".active-projection" class to the matching projection title DOM node if it was found
	var activeProjectionNode = document.querySelector('[data-proj-name="' + activeProjection + '"]');
	if (activeProjectionNode) {
		activeProjectionNode.classList.add('active-projection');
	}
}


/***MAIN MAP DRAW FUNCTION***/
function addMapPreview(center, currentlyDragging) {
	//Creating canvas HTML element
	addCanvasMap(previewMapLat0, center.lng, previewMapProjection, 0, currentlyDragging);
	
	highlightActiveProjectionNode();
	
	//adding class to split text and map preview
	$("#result").addClass("results");
}

/* Setting a new projection with D3 */
function pickProjection(lat0, lon0, projectionString) {
	//Definding D3 projection
	if (projectionString == 'Lambert azimuthal equal area') {
		return d3.geoAzimuthalEqualArea()
			.clipAngle(180 - 1e-3)
			.precision(.1)
			.rotate([-lon0, -lat0]);
	}
	else if (projectionString == 'Azimuthal equidistant') {
		return d3.geoAzimuthalEquidistant()
			.clipAngle(180 - 1e-3)
			.precision(.1)
			.rotate([-lon0, -lat0]);
	}
	else if (projectionString == 'Orthographic') {
		return d3.geoOrthographic()
			.clipAngle(90)
			.rotate([-lon0, -lat0]);
	}
	else if (projectionString == 'Stereographic') {
		return d3.geoStereographic()
			.rotate([-lon0, -lat0])
			.clipAngle(90)
			//.clipExtent([[0, 0], [width, height]])
			.precision(.1);
	}
	else if (projectionString == 'Mercator') {
		return d3.geoMercator()
			.precision(.1)
			.rotate([-lon0, 0]);
	}
	else if (projectionString == 'Transverse Mercator') {
		return d3.geoTransverseMercator()
			.precision(.1)
			.rotate([-lon0, 0]);
	}
	else if (projectionString == 'Cylindrical equal area') {
		var interval = (latmax - latmin) / 4.;
		var latS1 = lat0 + interval, latS2 = lat0 - interval, latS;

		if ((latS1 > 0. && latS2 > 0.) || (latS1 < 0. && latS2 < 0.)) {
			latS = Math.max(Math.abs(latmax), Math.abs(latmin)) / 2.;
		} else {
			latS = 0.;
		}
		
		return d3.geoCylindricalEqualArea()
			.parallel(latS)
			.precision(.1)
			.rotate([-lon0, 0]);
	}
	else if (projectionString == 'Transverse cylindrical equal area') {
		return d3.geoTransverseCylindricalEqualArea()
			.parallel(0)
			.precision(.1)
			.rotate([-lon0, 0, 90]);
	}
	else if (projectionString == 'Equidistant cylindrical') {
		return d3.geoEquirectangular()
			.rotate([-lon0, 0])
			.precision(.1);
	}
	else if (projectionString == 'Cassini') {
		return d3.geoEquirectangular()
			.rotate([-lon0, 0, 90])
			.angle(-90)
			.precision(.1);
	}
	else if (projectionString == 'Equidistant conic') {
		var interval = (latmax - latmin) / 6;
		return d3.geoConicEquidistant()
			.parallels([latmin + interval, latmax - interval])
			.center([0, lat0])
			.precision(.1)
			.rotate([-lon0, 0]);
	}
	else if (projectionString == 'Albers equal area conic') {
		var interval = (latmax - latmin) / 6;
		return d3.geoAlbers()
			.rotate([-lon0, 0])
			.center([0, lat0])
			.parallels([latmin + interval, latmax - interval])
			.precision(.1);
	}
	else if (projectionString == 'Lambert conformal conic') {
		var interval = (latmax - latmin) / 6;
		return d3.geoConicConformal()
			.rotate([-lon0, 0])
			//.clipAngle(90)			
			.center([0, lat0])
			.parallels([latmin + interval, latmax - interval])
			.precision(.1);
	}
	else if (projectionString == 'Mollweide') {
		return d3.geoMollweide()
			.rotate([-lon0, 0])
			.precision(.1);
	}
	else if (projectionString == 'Hammer (or Hammer-Aitoff)') {
		return d3.geoHammer()
			.rotate([-lon0, 0])
			.precision(.1);
	}
	else if (projectionString == 'Equal Earth') {
		return d3.geoEqualEarth()
			.rotate([-lon0, 0])
			.precision(.1);
	}
	else if (projectionString == 'Eckert IV') {
		return d3.geoEckert4()
			.rotate([-lon0, 0])
			.precision(.1);
	}
	else if (projectionString == 'Wagner IV (or Putnins P2`)') {
		return d3.geoWagner4()
			.rotate([-lon0, 0])
			.precision(.1);
	}
	else if (projectionString == 'Wagner VII (or Hammer-Wagner)') {
		return d3.geoWagner7()
			.rotate([-lon0, 0])
			.precision(.1);
	}
	else if (projectionString == 'Robinson') {
		return d3.geoRobinson()
			.rotate([-lon0, 0])
			.precision(.1);
	}
	else if (projectionString == 'Natural Earth') {
		return d3.geoNaturalEarth()
			.rotate([-lon0, 0])
			.precision(.1);
	}
	else if (projectionString == 'Winkel Tripel') {
		return d3.geoWinkel3()
			.rotate([-lon0, 0])
			.precision(.1);

	}
	else if (projectionString == 'Patterson') {
		return d3.geoPatterson()
			.rotate([-lon0, 0])
			.precision(.1);
	}
	else if (projectionString == 'Plate Carrée') {
		return d3.geoEquirectangular()
			.rotate([-lon0, 0])
			.precision(.1);
	}
	else if (projectionString == 'Miller cylindrical I') {
		return d3.geoMiller()
			.rotate([-lon0, 0])
			.precision(.1);
	}
	else if (projectionString == 'Polar azimuthal equidistant') {
		return d3.geoAzimuthalEquidistant()
			.clipAngle(180 - 1e-3)
			.precision(.1)
			.rotate([-lngP_eq, -pole_eq]);
	}
	else if (projectionString == 'Oblique azimuthal equidistant') {
		return d3.geoAzimuthalEquidistant()
			.clipAngle(180 - 1e-3)
			.precision(.1)
			.rotate([-lon0, -lat0]);
	}
	else if (projectionString == 'Two-point equidistant') {
		var pt1 = [lon0, lat0],       // First point
		    pt2 = [lng2_eq, lat2_eq]; // Second point
		
		// Clipping the area around the antipode
		// https://github.com/d3/d3-geo-projection/issues/192#issuecomment-642398941
		const eps = 1e-3, u = (d3.geoDistance(pt1, pt2) / 2) * (180 / Math.PI) + eps,
			  ellipse = {
				type: "Polygon",
				coordinates: [ [
					[ 180 - u,  eps],
					[ 180 - u, -eps],
					[-180 + u, -eps],
					[-180 + u,  eps],
					[ 180 - u,  eps]
				  ]]
			  };
		
		return d3.geoTwoPointEquidistant(pt1,pt2)
				 .preclip(d3.geoClipPolygon(ellipse));
	}
	else {
		// projection error condition
		var previewMapProjectionName = $("#previewMap #projectionName");
		previewMapProjectionName.append("<p></p><p></p><p>Map preview not avaliable</p><p></p><p></p>");
		return;
	}
}

function clearCanvasMap() {
	// helper function to clear the d3 preview map canvas because
	// 1. the canvas context and the projection name display must be cleared before being updated
	// 2. some other conditions do not show the d3 preview map at all
	var previewMapCanvas = d3.select("#previewMap canvas").node();
	previewMapCanvas
		.getContext("2d")
		.clearRect(0, 0, previewMapCanvas.width, previewMapCanvas.height);
	
	// to be safe, also clear the projection name text below the d3 preview map
	var previewMapProjectionName = $("#previewMap #projectionName");
	previewMapProjectionName.empty();
}

/* Map drawing function (D3)*/
function addCanvasMap(lat0, lon0, projectionString, world, currentlyDragging) {
	// first and only once, attempt to fetch both of the needed world geojson files
	// otherwise, continue with the geojson files that were already fetched
	if (!world110m && !world50m) {
		Promise
			.all([
				d3.json("https://cdn.jsdelivr.net/npm/world-atlas@1/world/110m.json"),
				d3.json("https://cdn.jsdelivr.net/npm/world-atlas@1/world/50m.json")
			])
			.then(function(allGeoJsonData) {
				world110m = allGeoJsonData[0];
				world50m = allGeoJsonData[1];

				continueDrawingCanvasMap(world110m, world50m, lat0, lon0, projectionString, world, currentlyDragging);
			});
	} else {
		continueDrawingCanvasMap(world110m, world50m, lat0, lon0, projectionString, world, currentlyDragging);
	}
}

function continueDrawingCanvasMap(world110m, world50m, lat0, lon0, projectionString, world, currentlyDragging) {
	// clear the canvas context and the projection name display must be cleared before being updated
	clearCanvasMap();
	
	//Setting graticule layer
	var graticule = d3.geoGraticule(),
		sphere = {type : "Sphere"};
	
	grid = graticule();
	
	//Setting rectangle layer
	var lammax = normalizeLON(lonmax, lon0),
	    lammin = normalizeLON(lonmin, lon0),
	    phimax = latmax,
	    phimin = latmin;
	
	var dlam = lammax - lammin,
		dphi = phimax - phimin,
		step = Math.min(dlam, dphi) / 15.0;
	
	var pt, rec_pts = [], rec_poly;
	//Create two ractangles for world equidistant cases
	if (projectionString == 'Polar azimuthal equidistant' || 
		projectionString == 'Oblique azimuthal equidistant' ||
		projectionString == 'Two-point equidistant') {
		var rec1 = [], rec2 = [];
		
		//Building first rectangle
		for (pt = lammin; pt < lon0; pt += step) {
			rec1.push([pt, phimax]);
		}
		for (pt = phimax; pt > phimin; pt -= step) {
			rec1.push([lon0, pt]);
		}
		for (pt = lon0; pt > lammin; pt -= step) {
			rec1.push([pt, phimin]);
		}
		for (pt = phimin; pt < phimax; pt += step) {
			rec1.push([lammin, pt]);
		}
		rec1.push([lammin, phimax]);
		
		//Building second rectangle
		for (pt = lon0; pt < lammax; pt += step) {
			rec2.push([pt, phimax]);
		}
		for (pt = phimax; pt > phimin; pt -= step) {
			rec2.push([lammax, pt]);
		}
		for (pt = lammax; pt > lon0; pt -= step) {
			rec2.push([pt, phimin]);
		}
		for (pt = phimin; pt < phimax; pt += step) {
			rec2.push([lon0, pt]);
		}
		rec2.push([lon0, phimax]);

		rec_poly = {
			type: "FeatureCollection", features: [
				{type: "Feature", geometry: {type: "Polygon", coordinates: [rec1]}},
				{type: "Feature", geometry: {type: "Polygon", coordinates: [rec2]}}
			]
		};
	}
	//Create only one ractangle for all other cases
	else {
		//Prevents the polygon from collapsing
		if (dlam > 359.999) {
			var eps = 1/3600.;
			lammin += eps;
			lammax -= eps;
		}
		if (dphi > 179.999) {
			var eps = 1/3600.;
			phimin += eps;
			phimax -= eps;
		}
		
		//Building rectangle
		for (pt = lammin; pt < lammax; pt += step) {
			rec_pts.push([pt, phimax]);
		}
		for (pt = phimax; pt > phimin; pt -= step) {
			rec_pts.push([lammax, pt]);
		}
		for (pt = lammax; pt > lammin; pt -= step) {
			rec_pts.push([pt, phimin]);
		}
		for (pt = phimin; pt < phimax; pt += step) {
			rec_pts.push([lammin, pt]);
		}
		rec_pts.push([lammin, phimax]);
		
		rec_poly = {type: "Feature", geometry: {type: "Polygon", coordinates: [rec_pts]}};
	}

	//Defining D3 projection
	var projection = pickProjection(lat0, lon0, projectionString);
	if (projection == null) {
		return;
	}
	
	//Set the display text of the projection name that appears below the d3 preview map
	$("#previewMap #projectionName").append(projectionString + "<br>");
	
	//Scaling projection on original coordinates
	projection.translate([0,0])
			  .scale(1);
	var max_width = document.getElementById('previewMap').offsetWidth, 
		height, width, X;

	//Computing scale factor and translation for world maps
	if (world) {
		if (projectionString == 'Polar azimuthal equidistant' || projectionString == 'Oblique azimuthal equidistant') {
			width = height = 0.7 * max_width;
			
			projection.fitSize([width - 20, height - 20], grid)
					  .translate([width / 2, height / 2]);
		}
		else if (projectionString == 'Two-point equidistant') {
			height = 0.5 * max_width;
			width  = max_width;
			
			projection.fitSize([width, height - 10], grid)
					  .translate([width / 2, height / 2]);
		}
		else {
			//Computing extent coordinates
			projection.rotate([0, 0]);
			var coord1 = projection([180, 0]), 
				coord2 = projection([-180, 0]), 
				coord3 = projection([180, 90]), 
				coord4 = projection([-180, -90]);

			//Definding original width and height of the extent
			width  = Math.abs(coord1[0] - coord2[0]);
			height = Math.abs(coord3[1] - coord4[1]);
			
			//Final scaling factor and translation parameters
			X = Math.min(max_width / width, max_width / height);
			width  *= X;
			height *= X;

			projection.rotate([-lon0, 0])
					  .fitSize([width, height], grid);
		}
	}
	//Computing scale factor and translation for other maps
	else {
		var xmin =  Number.MAX_VALUE, 
			xmax = -Number.MAX_VALUE, 
			ymin =  Number.MAX_VALUE, 
			ymax = -Number.MAX_VALUE, 
			pt, fit_pts = rec_pts.slice();
		
		//Making sure origin point(s) will also display
		if ( document.getElementById("showCenter").checked ) {
			fit_pts.push([lon0, lat0]);
		}
		
		//Project rectangle
		for (var i = 0; i < fit_pts.length; i++)
		{
			pt = projection(fit_pts[i]);
			
			xmin = Math.min(xmin, pt[0]);
			xmax = Math.max(xmax, pt[0]);
			ymin = Math.min(ymin, pt[1]);
			ymax = Math.max(ymax, pt[1]);
		}
		
		//Calculate size of rectangle
		width  = Math.abs(xmax - xmin);
		height = Math.abs(ymax - ymin);
			
		//Final scaling factor and translation parameters
		X = Math.min(max_width / width, 0.66 * max_width / height);
		width  *= X;
		height *= X;

		projection.translate([width / 2, height / 2])
				  .fitSize([width, height], {type: 'Feature', geometry: {type: 'MultiPoint', coordinates: fit_pts}});
	}
	
	//Setting data layer
	var data;
	var scale = 720. / (lonmax - lonmin) / (Math.sin(latmax * Math.PI / 180.) - Math.sin(latmin * Math.PI / 180.));
	
	if (currentlyDragging || (scale < 6)) {
		data = world110m;
	} else {
		data = world50m;
	}

	land = topojson.feature(data, data.objects.countries);

	//Drawing map elements
	var canvas = d3.select("#previewMap canvas")
		.attr("width", width)
		.attr("height", height);

	var context = canvas.node().getContext("2d");
	var path    = d3.geoPath(projection, context);

	// Style sphere
	context.beginPath();
	path(sphere);
	context.fillStyle = "#add8e6";
	context.fill();

	// Style land
	context.beginPath();
	path(land);
	context.fillStyle = "#eee";
	context.fill();
	context.lineWidth = 0.3;
	context.strokeStyle = "#999";
	context.stroke();
	
	// Style graticule
	context.beginPath();
	path(grid);
	context.lineWidth = 0.5;
	context.globalAlpha = 0.2;
	context.strokeStyle = "#555";
	context.stroke();
	context.globalAlpha = 1;
	
	// Style ractangle
	if ( document.getElementById("showEextent").checked ) {
		context.beginPath();
		path(rec_poly);
		context.lineWidth = 3;
		context.globalAlpha = 0.25;
		context.fillStyle = "#ff7b1a";
		context.fill();
		context.globalAlpha = 1;
	}
	
	// Style origin point
	if ( document.getElementById("showCenter").checked ) {
		var origin = [], pt;
		if (projectionString == 'Polar azimuthal equidistant') {
			origin.push([lngP_eq, pole_eq]);
		}
		else if (projectionString == 'Oblique azimuthal equidistant') {
			origin.push([lngC_eq, latC_eq]);			
		}
		else if (projectionString == 'Two-point equidistant') {
			origin.push([lng1_eq, lat1_eq]);
			origin.push([lng2_eq, lat2_eq]);
		}
		else {
			origin.push([lon0, lat0]);
		}
		
		//Drawing points
		for (var i = 0; i < origin.length; i++)
		{
			pt = projection(origin[i]);

			context.beginPath();
			context.arc(pt[0], pt[1], 4, 0, 2 * Math.PI);
			context.fillStyle = "#3388ff";
			context.fill();
			context.closePath();
		}
	}
}
