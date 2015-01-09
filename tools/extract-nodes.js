var fs = require('fs'),
	through2 = require('through2'),
	osm_parser = require('osm-pbf-parser'),
	JSONStream = require('JSONStream');

function isNode(item) {
	return item.type === 'node';
}

fs.createReadStream('data/romania-latest.osm.pbf')
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
		fs.createWriteStream('output/nodes.txt')
	);