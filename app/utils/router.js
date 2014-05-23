var fs = require('fs');
var path = require('path');

var public_root = path.join(__dirname, '../..');

var route = function(filename, resp) {
	var type = filename.split('.').pop();

	switch(type) {
		case 'html':
			render_response(filename, resp, 'text/html');
			break;
		case 'js':
			render_response(filename, resp, 'text/javascript');
			break;
		case 'css':
			render_response(filename, resp, 'text/css');
			break;
		default:
			render_response(filename, resp, 'html');

	}

};

var render_response = function(filename, resp, content_type) {
	console.log('Router attempting ' + path.join(public_root, filename));
	fs.readFile(path.join(public_root, filename), function(err, data) {
		if(err) {
			resp.writeHead(404);
			resp.write('Sorry dude, this doesn\'t exist. You must be tripping balls (geddit? spheros?)');
			resp.end()
		} else {
			resp.writeHead(200, {
				'Content-Type': content_type
			});
			resp.write(data, 'utf8');
			resp.end()
		}
	});
};

/* Export */
module.exports.route = route;