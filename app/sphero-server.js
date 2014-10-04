/* 
 * Imports
 * ========================= */

var Cylon = require('cylon');
var http = require('http');
var url = require('url');
var io = require('socket.io');

var SpheroFactory = require('./sphero.js');
var Router = require('./utils/router.js');

/* ------------------------
 * SERVER
 * ------------------------ */

var server = http.createServer(function(req, resp) {
	console.log('Connection to server');

	var path = url.parse(req.url).pathname;
	Router.route(path, resp);

});

server.listen(7890);
var io = io.listen(server).set('log level', 1);

var clients = {};

io.on('connection', function(socket) {
	clients[socket.id] = socket;

	/* New Sphero added */
	socket.on('incoming-sphero-connection', function(data) {
		var portmask = "/dev/cu.Sphero-***-AMP-SPP";
		var sphero = new SpheroFactory.Sphero(socket);

		sphero.name = data.name;
		sphero.connection.port = portmask.replace('***', data.name);

		Cylon.robot(sphero);
	});

	/* Starting spheros */
	socket.on('activate-spheros', function() {
		Cylon.start();
	});

});