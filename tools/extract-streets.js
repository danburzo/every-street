var fs = require('fs');
var through2 = require('through2');
var osm_parser = require('osm-pbf-parser');
var JSONStream = require('JSONStream');

var INPUT_FILE = 'data/data.osm.pbf';
var OUTPUT_FILE = 'output/streets.txt';

function isStreet(item) {
	return item.type === 'way' && item.tags.highway;
}

console.log('Extracting streets from data file: ' + INPUT_FILE);
fs.createReadStream(INPUT_FILE)
	.pipe(new osm_parser())
	.pipe(
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
		fs.createWriteStream(OUTPUT_FILE)
	).on('finish', function() {
		console.log('Finished extracting streets onto file: ' + OUTPUT_FILE);
	});