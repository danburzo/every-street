var fs = require('fs'),
	through2 = require('through2'),
	split2 = require('split2');

fs.createReadStream('output/roads-with-coords-screen.txt', { encoding: 'utf8' })
	.pipe(split2())
	.pipe(through2.obj(function(line, enc, next) {
		var path_data = 'M ' + line.replace(/\;/g, ' L ').replace(/\,/g, ' ');
		this.push(path_data + '\n');
		next();
	}))
	.pipe(fs.createWriteStream('output/roads-svg-paths.txt'));