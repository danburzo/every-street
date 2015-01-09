var fs = require('fs'),
	through2 = require('through2'),
	osm_parser = require('osm-pbf-parser'),
	JSONStream = require('JSONStream');

function isRoad(item) {
	return item.type === 'way' && item.tags.highway;
}

fs.createReadStream('data/data.osm.pbf')
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
		fs.createWriteStream('output/roads.txt')
	).on('finish', function() {
		console.log('Finished extracting roads from OSM data.');
	});