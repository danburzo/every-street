var fs = require('fs');
var through2 = require('through2');
var osm_parser = require('osm-pbf-parser');
var JSONStream = require('JSONStream');

var INPUT_FILE = 'data/data.osm.pbf';
var OUTPUT_FILE = 'output/nodes.txt';

function isNode(item) {
	return item.type === 'node';
}

console.log('Extracting nodes from data file: ' + INPUT_FILE);
fs.createReadStream(INPUT_FILE)
	.pipe(new osm_parser())
	.pipe(
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
		fs.createWriteStream(OUTPUT_FILE)
	)
	.on('finish', function() {
		console.log('Finished extracting nodes onto file: ' + OUTPUT_FILE);
	});