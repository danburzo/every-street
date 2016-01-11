var fs = require('fs');
var through2 = require('through2');
var osm_parser = require('osm-pbf-parser');
var JSONStream = require('JSONStream');

var INPUT_FILE = 'data/data.osm.pbf';
var OUTPUT_NODES_FILE = 'output/nodes.txt';
var OUTPUT_STREETS_FILE = 'output/streets.txt';

function isNode(item) {
	return item.type === 'node';
}

function isStreet(item) {
	return item.type === 'way' && item.tags.highway;
}

console.log('Extracting nodes and streets from data file: ' + INPUT_FILE);

var input = fs.createReadStream(INPUT_FILE).pipe(new osm_parser());

input.pipe(
	through2.obj(function(items, enc, next) {
		var nodes = items.filter(isNode).map(function(item) {
			return item.id + ',' + item.lat + ',' + item.lon;
		});
		if (nodes.length) {
			this.push(nodes.join('\n'));
		}
		next();
	})
)
.pipe(
	fs.createWriteStream(OUTPUT_NODES_FILE)
)
.on('finish', function() {
	console.log('Finished extracting nodes onto file: ' + OUTPUT_NODES_FILE);
});

input.pipe(
	through2.obj(function(items, enc, next) {
		var streets = items.filter(isStreet).map(function(item) {
			return item.refs;
		});
		if (streets.length) {
			this.push(streets.map(function(road) {
				return road.join(',');
			}).join('\n'));
		}
		next();
	})
)
.pipe(
	fs.createWriteStream(OUTPUT_STREETS_FILE)
).on('finish', function() {
	console.log('Finished extracting streets onto file: ' + OUTPUT_STREETS_FILE);
});