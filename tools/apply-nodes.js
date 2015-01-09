var fs = require('fs'),
	through2 = require('through2'),
	split2 = require('split2'),
	levelup = require('level'),
	async = require('async');

levelup('db', function(err, db) {

	var write_stream = fs.createWriteStream('output/roads-with-coords.txt');

	fs.createReadStream('output/roads.txt', { encoding: 'utf8' })
		.pipe(split2())
		.pipe(through2.obj(function(line, enc, next){
			async.mapSeries(line.split(','), function(node_id, callback) {
				db.get(node_id, function(err, coords) {
					callback(err, coords);
				});
			}, function(err, result) {
				this.push(result.join(',') + '\n');
				next();
			}.bind(this));
		}))
		.pipe(write_stream)
		.on('finish', function() {
			console.log('Finished applying nodes.');
		});
});