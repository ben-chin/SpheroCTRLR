$(document).ready(function() {

	var socket = io.connect();
	var sphero_manager = new SpheroManager;

	/* initialize the draggable instructions */
	$('#sphero-instructions .sphero-instruction').each(function() {
		var eventObject = {
			title: $.trim($(this).text()), 
			allDay: false,
			heading: $(this).data('heading')
		};
		
		$(this).data('eventObject', eventObject);
		
		$(this).draggable({
			zIndex: 999,
			revert: true,      
			revertDuration: 0 
		});
		
	});
	
	$('#timeline').fullCalendar(timeline_opts);


	$('body').on('keypress', '.sphero-name',  
		function(e) {
			if(e.which == 13) {
				var spheroname = $(this).val().toUpperCase();
				socket.emit('incoming-sphero-connection', {
					name : spheroname
				});
				$(this).val('');
			}
		});

	$('#activate').on('click', function(e) {
		e.preventDefault();
		socket.emit('activate-spheros');
	});

	$('#deactivate').on('click', function(e) {
		e.preventDefault();
		for(var i = 0; i < sphero_manager.numSpheros(); i++) {
			socket.emit('deactivate-sphero', { 
				sphero: sphero_manager.getSpheroAt(i).name 
			});
		}
	});

	$('#start-calibration').on('click', function(e) {
		e.preventDefault();
		socket.emit('sphero-start-calibration', {
			broadcast: true
		});
	});

	$('#stop-calibration').on('click', function(e) {
		e.preventDefault();
		socket.emit('sphero-stop-calibration', {
			broadcast: true
		});
	});

	$('#play').on('click', function(e) {
		console.log(sphero_manager.numSpheros());
		for(var i = 0; i < sphero_manager.numSpheros(); i++) {
			var events = get_events(i);
			var moves = create_moves(events);

			socket.emit('play-sphero', {
				sphero: sphero_manager.getSpheroAt(i).name,
				moves: moves
			});
		}
	});

	socket.on('sphero_connected', function(data) {
		console.log('Connected to ' + data.name + '!');
		$('.connected-spheros')
			.append('<li class="connected-sphero" data-sphero-name="' + data.name + '">' 
					+ data.name + '</li>')
			.hide().fadeIn('slow');

		sphero_manager.addSphero(data.name);

	});

	socket.on('sphero-deactivated', function(data) {
		console.log('Attempted deactivation');
		$('.connected-spheros').children('li[data-sphero-name="' + data.name + '"]').fadeOut('slow');
	});

});