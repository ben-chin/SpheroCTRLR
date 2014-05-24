$(document).ready(function() {

	var socket = io.connect();
	var sphero_manager = new SpheroManager;

	/* initialize the draggable instructions */
	$('#sphero-instructions .sphero-instruction').each(function() {
		var eventObject = {
			title: $.trim($(this).text()), 
			allDay: false,
			backgroundColor: cal_colors[2],
			borderColor: cal_colors[2],
			sphero: {
				move: $(this).data('move') == 1,
				heading: $(this).data('heading') || 0,
				color: '0x0000FF'
			}

		};
		
		$(this).data('eventObject', eventObject);
		
		$(this).draggable({
			zIndex: 999,
			revert: true,      
			revertDuration: 0 
		});

		$('#sphero-move-picker .modal-body').append($(this));
		
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

		var time_unit = $('#time-unit').val() * 1000;
		console.log('time: ' + time_unit);

		for(var i = 0; i < sphero_manager.numSpheros(); i++) {
			var events = get_events(i);
			var moves = create_moves(events);

			socket.emit('play-sphero', {
				sphero: sphero_manager.getSpheroAt(i).name,
				time_unit: time_unit || 1,
				moves: moves
			});
		}
	});

	$('#save').on('click', function(e) {
		var events = $('#timeline').fullCalendar('clientEvents');
		var event_stores = events.map(function(e) {
			return {
				title: e.title,
				start: e.start,
				end: e.end || null,
				allDay: e.allDay,
				sphero: e.sphero
			};
		});

		socket.emit('save_events', {events: event_stores});
	});

	$('#restore').on('click', function(e) {
		socket.emit('restore_events');
	});

	socket.on('sphero_connected', function(data) {
		console.log('Connected to ' + data.name + '!');
		$('.connected-spheros')
			.append('<li class="connected-sphero" data-sphero-name="' + data.name + '">' 
					+ data.name + '</li>')
			.hide().fadeIn('slow');

		sphero_manager.addSphero(data.name);

		var col_num = sphero_manager.getSphero(data.name);
		$('.fc-widget-header.fc-col' + col_num).text(data.name);

	});

	socket.on('sphero-deactivated', function(data) {
		console.log('Attempted deactivation');
		$('.connected-spheros').children('li[data-sphero-name="' + data.name + '"]').fadeOut('slow');
	});

	socket.on('restored_events', function(data) {
		console.log(data.events);
		// Convert to local timezone
		$('#timeline').fullCalendar('addEventSource', data.events);
	});

	socket.on('saved_events', function() {
		alert('Saved events!');
	});

	socket.on('saved_error', function() {
		alert('Error saving!');
	});

	socket.on('restore_error', function() {
		alert('Error restoring!');
	});

});