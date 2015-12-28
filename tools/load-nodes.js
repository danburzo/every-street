var fs = require('fs');
var through2 = require('through2');
var split2 = require('split2');
var levelup = require('level');

var DATABASE_NAME = 'everystreet';
var INPUT_FILE = 'output/nodes.txt';

var i = 0;

console.log('creating levelDB database ' + DATABASE_NAME);
levelup(DATABASE_NAME, function(err, db) {
	// TODO why do we need a dummy write stream to pipe into?
	var write_stream = db.createWriteStream();
	fs.createReadStream(INPUT_FILE, { encoding: 'utf8' })
		.pipe(split2())
		.pipe(through2.obj(function(line, enc, next){
			var parts = line.split(',');
			this.push({ 
				key: parts[0], 
				value: parts[1] + "," + parts[2]
			});

			// Prevent memory leak
			// See: https://github.com/rvagg/node-levelup/issues/298
			if (i++ > 999) {
				setImmediate(next);
				i = 0;
			} else {
				next();
			}
		}))
		.pipe(write_stream)
		.on('finish', function() {
			console.log('Finished importing nodes into the database ' + DATABASE_NAME);
		});
});