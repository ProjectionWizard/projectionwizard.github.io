/*
 * PROJECTION WIZARD
 * Map Projection Selection Tool
 *
 * Author: Bojan Savric
 * Date: September, 2014
 *
 */

function transverseCylindricalEqualAreaRaw(lat0) {
	var projection = d3.geoCylindricalEqualArea()
						.parallel(lat0)
						.scale(1)
						.translate([0,0])
						.precision(.1);

	function forward(λ, φ) {
		var coordinates = projection([λ, φ]);
		return [-coordinates[1], -coordinates[0]];
	}


	forward.invert = function(x, y) {
		return projection.invert(-y, x);
	};

	return forward;
}

function transverseCylindricalEqualArea() {
	var mutator = d3.geoProjectionMutator(transverseCylindricalEqualAreaRaw), 
		projection = mutator(0);

	projection.parallel = function(phi0) {
		return mutator(phi0);
	};
	
	return projection;
}

(d3.geoTransverseCylindricalEqualArea = transverseCylindricalEqualArea).raw = transverseCylindricalEqualArea();
