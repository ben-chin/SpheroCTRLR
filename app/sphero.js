var sleep = require('sleep');
var _ = require('underscore');
var Cylon = require('cylon');

var DEFAULT_SPEED = 90

/* ------------------------
 * SPHERO
 * ------------------------ */

var Sphero = (function() {

	var socket;

	/* Constructor */
	function Sphero(socket) {
		this.socket = socket;
	}

	Sphero.prototype.connection = {
		name : 'Sphero', 
		adaptor: 'sphero'
	};

	Sphero.prototype.device = {
		name : 'sphero',
		driver : 'sphero'
	};

	Sphero.prototype.work = function(my) {
			var name = my.sphero.robot.name;

			my.sphero.stop();
			my.sphero
				.on('connect', function() {
					console.log('Started!');
					this.socket.emit('sphero_connected', {
						name: name
					});

					this.socket
						.on('play-sphero', function(data) {
							if(!data.broadcast) {
								if(data.sphero != name) return;
							}

							console.log('Playing sphero');
							console.log(data);

							var moves = data.moves;
							var i = 0;
							every(data.time_unit, function() {
								if(moves[i]) {
									console.log(moves[i].params);
									
									if(moves[i].params.move) {
										console.log('hoi');
										my.sphero.roll(
											DEFAULT_SPEED, 
											moves[i].params.heading
										);
									} else {
										my.sphero.stop();
									}
									if(moves[i].params.color) {
										my.sphero.setRGB(moves[i].params.color);
									}
								} else {
									my.sphero.stop();
								}
								
								i++;
							});
							
						})
						.on('sphero-start-calibration', function(data) {
							console.log('Starting calibration');
							if(!data.broadcast) {
								if(data.sphero != name) return;
							}
							console.log('Forced exit');
							my.sphero.startCalibration();
						})
						.on('sphero-stop-calibration', function(data) {
							if(!data.broadcast) {
								if(data.sphero != name) return;
							}
							my.sphero.finishCalibration();
						})
						.on('disconnect', function() {
							this.disconnect(name);
						}.bind(this))
						.on('deactivate-sphero', function(data) {
							if(!data.broadcast) {
								if(data.sphero != name) return;
							}

							this.disconnect(name);
							this.socket.emit('sphero-deactivated', {
								name: name
							});
						}.bind(this));

					my.sphero.setRGB('0x0000FF');
				}.bind(this))
				.on('locator', function(data) {
					console.log('locator:');
					console.log(data);
				});

	};

	Sphero.prototype.disconnect = function(name) {
		var i;
		for(i = 0; i < Cylon.robots.length; i++) {
			if(Cylon.robots[i].name == name) {
				break;
			}
		}
		Cylon.robots.splice(i, 1);

		console.log('Removed: ' + name);
	};

	return Sphero;
})();

/* Export */
module.exports.Sphero = Sphero;
