/*
 * PROJECTION WIZARD v2.1
 * Map Projection Selection Tool
 * 
 * Author: Bojan Savric
 * Date: June, 2019
 * 
 */


/*DECIMAL DEGREES TO DEGREES, MINUTES, SECONDS*/

/*Coverting decimal degrees (number) in to the DMS form (string)*/
function dd2dms(alfa) {
	var deg, min, sec;

	//parsing DD to DMS
	deg = parseInt(alfa);
	min = parseInt((alfa - deg) * 60.0);
	sec = Math.round(((alfa - deg) * 60.0 - min) * 60.0);

	if (sec == 60.0) {
		sec = 0.0;
		min += 1.;
	}
	if (min == 60.0) {
		min = 0.0;
		deg += 1.;
	}

	//Combining a string
	return deg + "º " + ("0" + min).slice(-2) + "' " + ("0" + sec).slice(-2) + "'' ";
}

/*Coverter for latitude*/
function dd2dmsLAT(phi) {
	var letter;

	//defining a hemisphere
	if (phi < 0) {
		letter = "S";
		phi *= -1;
	} else
		letter = "N";

	//returning the final string
	return dd2dms(phi) + letter;
}

/*Coverter for latitude*/
function dd2dmLAT(phi) {
	var letter;

	//defining a hemisphere
	if (phi < 0) {
		letter = "S";
		phi *= -1;
	} else
		letter = "N";

	//returning the final string
	return dd2dms(phi) + letter;
}

/*Coverter for longitude*/
function dd2dmLON(lam) {
	var letter;
	//defining a hemisphere
	if (lam < 0) {
		letter = "W";
		lam *= -1;
	} else
		letter = "E";

	return dd2dms(lam) + letter;
}


/*Coverter for longitude*/
function dd2dmsLON(lam) {
	var letter;
	//defining a hemisphere
	if (lam < 0) {
		letter = "W";
		lam *= -1;
	} else
		letter = "E";

	return dd2dms(lam) + letter;
}


/*DEGREES, MINUTES, SECONDS TO DECIMAL DEGREES*/

/*Coverting DMS form (string) in to the decimal degrees (number)*/
function dms2dd(string) {
	var dec, min, sec;

	//Getting indecies
	var indexDEC = string.indexOf("º"), 
	    indexSEC = string.indexOf("''"),
	    indexMIN = string.indexOf("'");
	    
	if (indexMIN == indexSEC)
		indexMIN = -1;

	//Parsing the string
	if (indexDEC < 0) dec = 0.0;
	else dec = parseFloat(string.slice(0, indexDEC));

	if (indexMIN < 0) min = 0.0;
	else min = parseFloat(string.slice(indexDEC + 1, indexMIN));

	if (indexSEC < 0) sec = 0.0;
	else if (indexMIN < 0) sec = parseFloat(string.slice(indexDEC + 1, indexSEC));
	else sec = parseFloat(string.slice(indexMIN + 1, indexSEC));

	//Returning the values
	if ((indexDEC < 0) && (indexMIN < 0) && (indexSEC < 0))
		return parseFloat(string);
	else
		return dec + min / 60.0 + sec / 3600.0;

}

/*Coverter for latitude*/
function dms2ddLAT(string) {
	//searching seconds
	var index = string.indexOf("''") + 2;
	if (index < 2) {
		//searching minutes
		index = string.indexOf("'") + 1;
		if (index < 1) {
			//searching degrees
			index = string.indexOf("º") + 1;
			if (index < 1) {
				//searching hemisphere letter
				index = string.indexOf("N") + 1;
				if (index < 1) {
					//searching hemisphere letter
					index = string.indexOf("S") + 1;
					if (index < 1) {
						//only number passed
						index = string.length;
					}
				}
			}
		}
	}

	// Getting decimal degrees
	var decdeg = dms2dd(string.slice(0, index));

	// Applying correct sign
	if (string.search(" S") > 0) {
		decdeg *= -1;
	}

	return decdeg;
}

/*Coverter for longitude*/
function dms2ddLON(string) {
	//searching seconds
	var index = string.indexOf("''") + 2;
	if (index < 2) {
		//searching minutes
		index = string.indexOf("'") + 1;
		if (index < 1) {
			//searching degrees
			index = string.indexOf("º") + 1;
			if (index < 1) {
				//searching hemisphere letter
				index = string.indexOf("E") + 1;
				if (index < 1) {
					//searching hemisphere letter
					index = string.indexOf("W") + 1;
					if (index < 1) {
						//only number passed
						index = string.length;
					}
				}
			}
		}
	}

	// Getting decimal degrees
	var decdeg = dms2dd(string.slice(0, index));

	// Applying correct sign
	if (string.search(" W") > 0) {
		decdeg *= -1;
	}

	return decdeg;
}
