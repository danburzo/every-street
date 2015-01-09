var fs = require('fs'),
	through2 = require('through2'),
	split2 = require('split2'),
	multiline = require('multiline');

var write_stream = fs.createWriteStream('output/roads.svg');

write_stream.write(multiline(function() {/*
	<svg xmlns='http://www.w3.org/2000/svg' width='1500' height='1000' viewBox='0 0 1500 1000'>
		<style>

			svg {
				background: black;
			}
			path {
				stroke-width: 0.1;
				fill: none;
				stroke: white;
			}
		</style>
*/}));

fs.createReadStream('output/roads-with-coords-screen.txt', { encoding: 'utf8' })
	.pipe(split2())
	.pipe(through2.obj(function(line, enc, next) {
		var path_data = 'M ' + line.replace(/\;/g, ' L ').replace(/\,/g, ' ');
		this.push('<path d="' + path_data + '"/>\n');
		next();
	}))
	.pipe(write_stream);