var fs = require('fs');
var through2 = require('through2');
var split2 = require('split2');
var levelup = require('level');
var async = require('async');

var DATABASE_NAME = 'everystreet';
var INPUT_FILE = 'output/streets.txt';
var OUTPUT_FILE = 'output/streets-with-coordinates.txt';

console.log('Applying node data from database ' + DATABASE_NAME + ' to street data from file: ' + INPUT_FILE);
levelup(DATABASE_NAME, function(err, db) {
	if (err) {
		console.error(err);
		return;
	}
	var write_stream = fs.createWriteStream(OUTPUT_FILE);

	fs.createReadStream(INPUT_FILE, { encoding: 'utf8' })
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
			console.log('Finished applying node data into file: ' + OUTPUT_FILE);
		});
});