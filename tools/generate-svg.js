var fs = require('fs');
var through2 = require('through2');
var split2 = require('split2');
var multiline = require('multiline');
var simplify = require('simplify-js');

var DEFAULT_MAP_WIDTH = 1500; // px

var INPUT_FILE = 'output/streets-with-coordinates-mapped.txt';
var OUTPUT_FILE = 'output/streets.svg';
var BBOX_FILE = 'output/bbox.json';

var o = JSON.parse(fs.readFileSync(BBOX_FILE, 'utf8'));

var map_width = DEFAULT_MAP_WIDTH;
var map_height = map_width / o.ratio;

function process(points) {
	// return points;
	return simplify(points, 0.5);
}

function svgpath(path_data) {
	return '<path d="' + path_data + '" stroke-width="0.2" stroke="black" fill="none"/>\n';
};

var write_stream = fs.createWriteStream(OUTPUT_FILE);

write_stream.write(
	"<svg xmlns='http://www.w3.org/2000/svg' width='{w}' height='{h}' viewbox='0 0 {w} {h}'>"
		.replace(/\{w\}/g, map_width)
		.replace(/\{h\}/g, map_height)
);

console.log('Generating SVG from file: ' + INPUT_FILE);

var i = 0;
var path_buffer = '';

fs.createReadStream(INPUT_FILE, { encoding: 'utf8' })
	.pipe(split2())
	.pipe(through2.obj(function(line, enc, next) {
		var point_array = line.split(';').map(function(pt) {
			var lonlat = pt.split(',');
			return {
				x: lonlat[0] * map_width,
				y: (1 - lonlat[1]) * map_height
			};
		});

		var pts = process(point_array).filter(function(pt) {
			return pt && !isNaN(pt.x) && !isNaN(pt.y);
		}).map(function(pt) {
			return pt.x + ' ' + pt.y;
		});

		var path_data = pts.length ? (' M ' + pts.join(' L ')) : "";

		path_buffer += path_data;
		if (i++ > 999) {
			this.push(svgpath(path_buffer));
			path_buffer = '';
			i = 0;
		}

		next();
	}, function(flush) {
		this.push(svgpath(path_buffer));
		this.push('</svg>');
		flush();
	}))
	.pipe(write_stream)
	.on('finish', function() {
		console.log('Finished generating SVG onto file: ' + OUTPUT_FILE);
	});