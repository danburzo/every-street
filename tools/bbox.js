var fs = require('fs');
var through2 = require('through2');
var split2 = require('split2');

var INPUT_FILE = 'output/streets-with-coordinates.txt';
var OUTPUT_FILE = 'output/bbox.json';

var bbox = {
	north: -90, // minimum latitude
	south: 90, // maximum latitude
	east: -180, // minimum longitude
	west: 180 // maximum longitude
};

function toRadians(deg) {
	return deg * Math.PI / 180;
}

function mercator(λ, φ) {
  return [λ, Math.log(Math.tan(Math.PI/4 + φ/2))];
}

function projection(lat, lon) {
	return mercator(toRadians(lon), toRadians(lat));
}

console.log('Finding bounding box in file: ' + INPUT_FILE);
fs.createReadStream(INPUT_FILE, { encoding: 'utf8' })
	.pipe(split2())
	.pipe(through2.obj(function(line, enc, next) {
		var coords = line.split(',');
		for (var j = 0; j < coords.length; j+=2) {
			var lat = parseFloat(coords[j]),
				lon = parseFloat(coords[j+1]);

			if (lat > bbox.north) {
				bbox.north = lat;
			}
			if (lat < bbox.south) {
				bbox.south = lat;
			}
			if (lon > bbox.east) {
				bbox.east = lon;
			}
			if (lon < bbox.west) {
				bbox.west = lon;
			}
		}
		next();
	}))
	.on('finish', function() {
		
		var nw_projected = projection(bbox.north, bbox.west);
		var se_projected = projection(bbox.south, bbox.east);

		var west = nw_projected[0];
		var north = nw_projected[1];
		var east = se_projected[0];
		var south = se_projected[1]; 

		var output = {
			bbox: bbox,
			ratio: (east - west) / (north - south)
		};

		fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
	});