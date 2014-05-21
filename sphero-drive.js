/* 
 * Imports
 * ========================= */

var Cylon = require('cylon');
var http = require('http');
var url = require('url');
var fs = require('fs');
var io = require('socket.io');

var DEFAULT_SPEED = 100;

/* ------------------------
 * SERVER
 * ------------------------ */

var server = http.createServer(function(req, resp) {
	console.log('Connection to server');

	var path = url.parse(req.url).pathname;

	switch(path) {
		case '/':
			resp.writeHead(200, {'Content-Type': 'text/html'});
			resp.write('Hello world.');
			break;
		case '/sphero.html':
			fs.readFile(__dirname + path, function(err, data) {
				if(err) {
					resp.writeHead(404);
					resp.write('Sorry dude, this doesn\'t exist. You must be tripping balls (geddit? spheros?)');
					resp.end()
				} else {
					resp.writeHead(200, {'Content-Type': 'text/html'});
					resp.write(data, 'utf8');
					resp.end()
				}
			});
			break;
		case '/eleganticons.css':
		case '/eleganticons/ElegantIcons.eot':
		case '/eleganticons/ElegantIcons.svg':
		case '/eleganticons/ElegantIcons.ttf':
		case '/eleganticons/ElegantIcons.woff':
			fs.readFile(__dirname + path, function(err, data) {
				if(err) {
					resp.writeHead(404);
					resp.write('Sorry dude, this doesn\'t exist. You must be tripping balls (geddit? spheros?)');
					resp.end()
				} else {
					resp.writeHead(200, {'Content-Type': 'text/html'});
					resp.write(data, 'utf8');
					resp.end()
				}
			});
			break;

		default:
			resp.writeHead(404);
			resp.write('Sorry dude, this doesn\'t exist. You must be tripping balls (geddit? spheros?)');
			resp.end()
			break;	
	}

});

server.listen(7890);


/* ------------------------
 * SPHERO
 * ------------------------ */

var Sphero = (function() {
	function Sphero() {}

	Sphero.prototype.connection = {
		name : 'Sphero', 
		adaptor: 'sphero'
	};

	Sphero.prototype.device = {
		name : 'sphero',
		driver : 'sphero'
	};

	Sphero.prototype.work = function(my) {

		io.listen(server)
			.set('log level', 1)
			.sockets
				.on('connection', function(socket) {
					// send data to client

					// When data received from client
					socket.on('client_data', function(data) {
						console.log('Received data');
						console.log(data);
					});

					socket.on('sphero_start_calibrate', function(data) {
						console.log('Calibrating sphero...');
						my.sphero.startCalibration();
					});

					socket.on('sphero_stop_calibrate', function(data) {
						console.log('Finished calibration...');
						my.sphero.finishCalibration();
					});

					socket.on('sphero_stop', function(data) {
						console.log('Stopping sphero...');
						my.sphero.stop();
					});

					socket.on('sphero_go_left', function(data) {
						console.log('Sphero left...');
						var speed = data.speed || DEFAULT_SPEED;
						my.sphero.roll(speed, 270);
					});

					socket.on('sphero_go_up', function(data) {
						console.log('Sphero up...');
						var speed = data.speed || DEFAULT_SPEED;
						my.sphero.roll(speed, 0);
					});

					socket.on('sphero_go_right', function(data) {
						console.log('Sphero right...');
						var speed = data.speed || DEFAULT_SPEED;
						my.sphero.roll(speed, 90);
					});

					socket.on('sphero_go_down', function(data) {
						console.log('Sphero left...');
						var speed = data.speed || DEFAULT_SPEED;
						my.sphero.roll(speed, 180);
					});

					socket.on('sphero_change_color', function(data) {
						console.log('Changing Sphero color to ' + data.color);
						my.sphero.setRGB(data.color.replace('#', '0x'));
					})

					
				});

		my.sphero.on('connect', function() {
			console.log('Started!');
			my.sphero.setRGB('0x0000FF');
		})

	};

	return Sphero;
})();


var spheros = [
	// { 
	// 	name : 'YBR', 
	// 	port: "/dev/cu.Sphero-YBR-AMP-SPP" 
	// },
	{ 
		name : 'GBR', 
		port: "/dev/cu.Sphero-GBR-AMP-SPP" 
	}
];

for (var i = 0; i < spheros.length; i++) {
	var sphero = spheros[i];
	var bot = new Sphero;

	bot.name = sphero.name;
	bot.connection.port = sphero.port;

	Cylon.robot(bot);
}

Cylon.start();