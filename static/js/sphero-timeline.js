var TIME_UNIT = 12; // is one second in real time

// Must correspond
var sphero_colors = ['0xFF0000', '0x00FF00', '0x0000FF'];
var cal_colors = ['#e74c3c', '#2ecc71', '#3498db'];

var timeline_opts 
	= { 
		header: false,
		firstDay: 0,
		ignoreTimezone: false,
		defaultView: 'agendaWeek',
		hiddenDays: [2,3,4,5,6,7],
		allDaySlot: false,
		slotEventOverlap: false,
		firstHour: 0,
		timeFormat: '',
		axisFormat: 'ss',
		eventBackgroundColor: cal_colors[2],
		eventBorderColor: cal_colors[2],
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
			var $timeline = $('#timeline');
			$timeline.find('.fc-agenda-slots .fc-agenda-axis.fc-widget-header')
				.each(function(i) { 
					$(this).text(i + 1);
				});
			$timeline.find('.fc-widget-header[class*="fc-col"]')
				.each(function(i) {
					$(this).text('Sphero ' + (i + 1));
				});
		},
		eventClick: function(event, jsEvent, view) {
			var i = sphero_colors.indexOf(event.sphero.color) + 1 % sphero_colors.length;
	        event.sphero.color = sphero_colors[i];  

	        event.backgroundColor = cal_colors[i];
	        event.borderColor = cal_colors[i];

			$(this).css({
				'background-color': cal_colors[i],
				'border-color': cal_colors[i]
			});				        

	    },
	    selectable: true,
	    select: function(start, end, allDay) {
	    	$('#sphero-move-picker')
	    		.modal('show')
	    		.one('click', '.sphero-instruction', function(e) {
	    			var originalEventObject = $(this).data('eventObject');
					var copiedEventObject = $.extend({}, originalEventObject);

					copiedEventObject.start = start;
					copiedEventObject.end = end;
					copiedEventObject.allDay = allDay;

					$('#timeline').fullCalendar('renderEvent', copiedEventObject, true);
					$('#sphero-move-picker').modal('hide');
					$(this).off('click');
	    		});
	    },
	    eventRender: function(event, $elem) {
	    	$elem.on('dblclick', function(e) {
	    		$('#timeline').fullCalendar('removeEvents', event._id); // Hacking private var for unqiue id
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
	var offset = (moment(e.start).hours() * 60 + moment(e.start).minutes()) / TIME_UNIT; console.log(e);
	return {
		offset: offset,
		repeats: repeats,
		params: e.sphero || {}
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