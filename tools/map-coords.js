var fs = require('fs');
var through2 = require('through2');
var split2 = require('split2');

var INPUT_FILE = 'output/streets-with-coordinates.txt';
var OUTPUT_FILE = 'output/streets-with-coordinates-mapped.txt';
var BBOX_FILE = 'output/bbox.json';

// read the bounding box and project it using Mercator
var o = JSON.parse(fs.readFileSync(BBOX_FILE, 'utf8'));
var nw_projected = projection(o.bbox.north, o.bbox.west);
var se_projected = projection(o.bbox.south, o.bbox.east);
var north = nw_projected[1];
var south = se_projected[1];
var west = nw_projected[0];
var east = se_projected[0];

function toRadians(deg) {
	return deg * Math.PI / 180;
}

function mercator(λ, φ) {
  return [λ, Math.log(Math.tan(Math.PI/4 + φ/2))];
}

function projection(lat, lon) {
	return mercator(toRadians(lon), toRadians(lat));
}

function percent(lonlat) {
	return [
		(lonlat[0] - west) / (east - west),
		(lonlat[1] - south) / (north - south)
	];
}

console.log('Mapping nodes using Mercador projection from file: ' + INPUT_FILE);
fs.createReadStream(INPUT_FILE, { encoding: 'utf8' })
	.pipe(split2())
	.pipe(through2.obj(function(line, enc, next) {
		var coords = line.split(',');
		var pts = [];
		for (var i = 0; i < coords.length; i+=2) {
			pts.push(
				percent(
					projection(coords[i], coords[i+1])
				).join(',')
			);
		}
		this.push(pts.join(';') + '\n');
		next();
	}))
	.pipe(fs.createWriteStream(OUTPUT_FILE))
	.on('finish', function() {
		console.log('Finished mapping nodes using Mercator projection onto file: ' + OUTPUT_FILE);
	});