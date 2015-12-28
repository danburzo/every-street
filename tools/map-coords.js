var fs = require('fs');
var through2 = require('through2');
var split2 = require('split2');

var INPUT_FILE = 'output/roads-with-coords.txt';
var OUTPUT_FILE = 'output/roads-with-coords-screen.txt';

var Mercator = function(options) {
	this.mapSize = options.mapSize;
	this.bbox = options.bbox;
};

Mercator.prototype.getPoint = function(lat, lon) {
	return { 
		x: this.getX(lon),
		y: this.getY(lat)
	};
};

Mercator.prototype.getPointString = function(lat, lon) {
	return this.getX(lon) + ',' + this.getY(lat);
};

Mercator.prototype.getRelativeY = function(lat) {
	return Math.log(Math.tan(this.toRadians(lat)/2 + Math.PI/4 ));
};

Mercator.prototype.getY = function(lat) {
	return this.mapSize.height * 
		(this.getRelativeY(lat) - this.getRelativeY(this.bbox.north)) / 
		(this.getRelativeY(this.bbox.south) - this.getRelativeY(this.bbox.north))
	;
};

Mercator.prototype.getX = function(lon) {
	return this.mapSize.width * 
		(this.toRadians(lon) - this.toRadians(this.bbox.west)) / 
		(this.toRadians(this.bbox.east) - this.toRadians(this.bbox.west))
	;
};

Mercator.prototype.toRadians = function(deg) {
	return deg * Math.PI / 180;
};

/* --------------------- */

var map = new Mercator({
	mapSize: {
		width: 1500,
		height: 1000
	},
	bbox: {
  		north: 48.296657,
		south: 43.624366800000004,
  		west: 20.255730500000002,
  		east: 29.726612400000004 
	}
});

var projection = function(lat, lon) {
	return map.getPointString(lat,lon);
};

var i = 0;
console.log('Mapping nodes using Mercador projection from file: ' + INPUT_FILE);
fs.createReadStream(INPUT_FILE, { encoding: 'utf8' })
	.pipe(split2())
	.pipe(through2.obj(function(line, enc, next) {
		var coords = line.split(',');
		var pts = [];
		for (var j = 0; j < coords.length; j+=2) {
			pts.push(projection(coords[j], coords[j+1]));
		}
		this.push(pts.join(';') + '\n');
		next();
	}))
	.pipe(fs.createWriteStream(OUTPUT_FILE))
	.on('finish', function() {
		console.log('Finished mapping nodes using Mercator projection onto file: ' + OUTPUT_FILE);
	});