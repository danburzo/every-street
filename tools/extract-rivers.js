var fs = require('fs'),
	through2 = require('through2'),
	osm_parser = require('osm-pbf-parser'),
	JSONStream = require('JSONStream');

function isRiver(item) {
	return item.type === 'way' && item.tags.waterway;
}

fs.createReadStream('data/romania-latest.osm.pbf')
	.pipe(new osm_parser())
	.pipe(
		through2.obj(function(items, enc, next) {
			var rivers = items.filter(isRiver).map(function(item) {
				return item.refs.join(',');
			});
			if (rivers.length) {
				this.push(rivers.join('\n'));
			}
			next();
		})
	)
	.pipe(
		fs.createWriteStream('output/rivers.txt')
	);