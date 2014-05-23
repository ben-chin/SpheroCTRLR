var TIME_UNIT = 12; // is one second in real time

var timeline_opts 
	= {
		header: false,
		firstDay: 0,
		defaultView: 'agendaWeek',
		hiddenDays: [3,4,5,6,7],
		allDaySlot: false,
		slotEventOverlap: false,
		firstHour: 0,
		timeFormat: '',
		axisFormat: 'ss',
		contentHeight: 650,
		slotMinutes: 12,
		defaultEventMinutes: 12,
		editable: true,
		droppable: true,
		drop: function(date) { 
			var originalEventObject = $(this).data('eventObject');
			var copiedEventObject = $.extend({}, originalEventObject);
			
			copiedEventObject.start = date;
			copiedEventObject.allDay = false;
			
			// render the event on the calendar
			$('#timeline').fullCalendar('renderEvent', copiedEventObject, true);
		},
		viewRender: function(view, element) {
			console.log(element);
			$('#timeline .fc-agenda-slots')
				.find('.fc-agenda-axis.fc-widget-header')
				.each(function(i) { 
					$(this).text(i + 1);
				});

		}
	};


var get_events = function(col) {
	return $('#timeline').fullCalendar('clientEvents', 
				/* Filter */
				function(event) {
				    return moment(event.start).day() == col;
				});
};

var process_event = function(e) {
	var repeats = 1;
	if(e.end) {
		var diff = moment(e.end).subtract(e.start).minutes();
		repeats = diff / TIME_UNIT;
	}
	var offset = (moment(e.start).hours() * 60 + moment(e.start).minutes()) / TIME_UNIT;
	return {
		offset: offset,
		repeats: repeats,
		heading: e.heading || 0
	};

};

var create_moves = function(events) {
	var moves = [];
	for(var i = 0; i < events.length; i++) {
		var result = process_event(events[i]);
		if(result.repeats > 1) {
			for(var j = 0; j <= result.repeats; j++) {
				moves[result.offset + j] = result;
			}
		} else {
			moves[result.offset] = result;
		}
	}
	return moves;
};


var add_column = function(cal) {
	cal.fullCalendar('hiddenDays', cal.fullCalendar('hiddenDays').shift());
};


var remove_column = function(cal) {
	var cols = cal.fullCalendar('hiddenDays');
	if(cols.length > 0) {
		cols.unshift(cols[0] - 1);
		cal.fullCalendar('hiddenDays', cols);
	}
};