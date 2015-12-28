var fs = require('fs');
var through2 = require('through2');
var osm_parser = require('osm-pbf-parser');
var JSONStream = require('JSONStream');

var INPUT_FILE = 'data/data.osm.pbf';
var OUTPUT_FILE = 'output/roads.txt';

function isRoad(item) {
	return item.type === 'way' && item.tags.highway;
}

console.log('Extracting roads from data file: ' + INPUT_FILE);
fs.createReadStream(INPUT_FILE)
	.pipe(new osm_parser())
	.pipe(
		through2.obj(function(items, enc, next) {
			var roads = items.filter(isRoad).map(function(item) {
				return item.refs;
			});
			if (roads.length) {
				this.push(roads.map(function(road) {
					return road.join(',');
				}).join('\n'));
			}
			next();
		})
	)
	.pipe(
		fs.createWriteStream(OUTPUT_FILE)
	).on('finish', function() {
		console.log('Finished extracting roads onto file: ' + OUTPUT_FILE);
	});