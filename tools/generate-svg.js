var fs = require('fs');
var through2 = require('through2');
var split2 = require('split2');
var multiline = require('multiline');

var INPUT_FILE = 'output/roads-with-coords-screen.txt';
var OUTPUT_FILE = 'output/roads.svg';

var write_stream = fs.createWriteStream(OUTPUT_FILE);

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

console.log('Generating SVG from file: ' + INPUT_FILE);
fs.createReadStream(INPUT_FILE, { encoding: 'utf8' })
	.pipe(split2())
	.pipe(through2.obj(function(line, enc, next) {
		var path_data = 'M ' + line.replace(/\;/g, ' L ').replace(/\,/g, ' ');
		this.push('<path d="' + path_data + '" stroke-width="0.1" stroke="black" fill="none"/>\n');
		next();
	}, function(flush) {
		this.push('</svg>');
		flush();
	}))
	.pipe(write_stream)
	.on('finish', function() {
		console.log('Finished generating SVG onto file: ' + OUTPUT_FILE);
	});