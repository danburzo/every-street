var fs = require('fs'),
	through2 = require('through2'),
	split2 = require('split2'),
	levelup = require('level');

var i = 0;
levelup('db', function(err, db) {
	var write_stream = db.createWriteStream();

	fs.createReadStream('output/nodes.txt', { encoding: 'utf8' })
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
		.pipe(write_stream);
});