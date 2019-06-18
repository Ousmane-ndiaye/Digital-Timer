var margin = { top: 40, right: 10, bottom: 20, left: 10 };
var w = d3.select('.clock').node().clientWidth - margin.left - margin.right;
var h = d3.select('.clock').node().clientHeight - margin.top - margin.bottom;

// radius of entire figure
var r = Math.min(w, h) / 2;

// drag behavior
var drag = d3.behavior.drag().on('dragstart', dragstart).on('drag', drag);

function dragstart() {
	d3.select(this).select('.slider-background').transition().attr('r', clock.sliderR);
}

function drag() {
	var mouse = Math.atan2(d3.event.y, d3.event.x);
	var deg = mouse / (Math.PI / 180) + 90;
	var arcMouse = deg < 0 ? 360 + deg : deg;
	var which = d3.select(this).attr('class');

	if (which != 'hour') {
		return false;
	}

	// move slider element
	d3.select(this).select('.slider-background').attr({
		cx: function(d) {
			return d.ringR * Math.cos(mouse);
		},
		cy: function(d) {
			return d.ringR * Math.sin(mouse);
		}
	});
	d3.select(this).select('.slider').attr({
		cx: function(d) {
			return d.ringR * Math.cos(mouse);
		},
		cy: function(d) {
			return d.ringR * Math.sin(mouse);
		}
	});
	d3.select(this).select('.content').attr({
		x: function(d) {
			return d.ringR * Math.cos(mouse);
		},
		y: function(d) {
			return d.ringR * Math.sin(mouse) + 5.5;
		}
	});

	// move hand element
	d3.select('line.' + which).attr({
		x2: function(d) {
			return d.length * Math.cos(mouse);
		},
		y2: function(d) {
			return d.length * Math.sin(mouse);
		}
	});

	// move arcs
	d3.select('path.' + which).attr({
		d: function(d) {
			var arcR = d.length; //rayon du second cercle
			return arc({
				outerRadius: arcR,
				startAngle: 0,
				endAngle: arcMouse * (Math.PI / 180)
			});
		}
	});
}

var clock = {
	r: r - 105,
	faceColor: '#32c832',
	tickColor: '#000000',
	sliderR: 8,
	hands: [
		{
			type: 'second',
			content: 'S',
			value: 0,
			length: r - 105,
			ringR: r, // radius of surrounding ring
			color: '#91AA9D',
			width: 4,
			labels: d3.range(5, 61, 5),
			scale: d3.scale.linear().domain([ 0, 59 ]).range([ 0, 354 ])
		},
		{
			type: 'minute',
			content: 'M',
			value: 0,
			length: r - 125,
			ringR: r - 33,
			color: '#3E606F',
			width: 6,
			ticks: d3.range(0, 60), // start, stop, step
			tickLength: 10,
			tickStrokeWidth: 1,
			scale: d3.scale.linear().domain([ 0, 59 ]).range([ 0, 354 ])
		},
		{
			type: 'hour',
			content: '',
			value: 0,
			length: r - 110, // Longueur du trait de draggble
			ringR: r - 106, //  Rayon du cercle draggble
			color: '#4b5761',
			width: 6,
			ticks: d3.range(0, 60),
			tickLength: 20,
			tickStrokeWidth: 2,
			scale: d3.scale.linear().domain([ 0, 59 ]).range([ 0, 354 ])
		}
	]
};

// add arcs for clock
var arc = d3.svg.arc().innerRadius(0);

// SVG -> G with margin convention
var svg = d3.select('.clock').append('svg');
var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Clock Face
var face = g.append('g').datum(clock).attr('transform', 'translate(' + w / 2 + ',' + r + ')');

face.append('circle').attr({
	r: function(d) {
		return d.r;
	},
	fill: function(d) {
		return d.faceColor;
	},
	stroke: function(d) {
		return d.tickColor;
	},
	'stroke-width': 2
});

var ticks = face
	.selectAll('g')
	.data(function(d) {
		return d.hands;
	})
	.enter()
	.append('g')
	// only get ticks for hour, minute
	.filter(function(d, i) {
		return i > 0;
	});

ticks
	.selectAll('.tick')
	.data(function(d) {
		return d.ticks.map(function(rangeValue) {
			return {
				location: d.scale(rangeValue),
				tickLength: d.tickLength,
				tickStrokeWidth: d.tickStrokeWidth
			};
		});
	})
	.enter()
	.append('line')
	.classed('tick', true)
	.attr({
		x1: 0,
		y1: clock.r,
		x2: 0,
		y2: function(d) {
			return clock.r - d.tickLength;
		},
		stroke: clock.tickColor,
		'stroke-width': function(d) {
			return d.tickStrokeWidth;
		},
		transform: function(d) {
			return 'rotate(' + d.location + ')';
		}
	});

face
	.selectAll('.tick-label')
	.data(function(d) {
		return d3.range(5, 61, 5).map(function(rangeValue) {
			return {
				location: d.hands[0].scale(rangeValue),
				scale: d.hands[0].scale,
				value: rangeValue,
				radius: clock.r + 15 // number position
			};
		});
	})
	.enter()
	.append('text')
	.classed('.tick-label', true)
	.text(function(d) {
		return d.value;
	})
	.attr({
		//styling timer number
		'text-anchor': 'middle',
		fill: clock.tickColor,
		'font-family': 'sans-serif',
		'font-size': 15,
		x: function(d) {
			return d.radius * Math.sin(d.location * (Math.PI / 180));
		},
		y: function(d) {
			return -d.radius * Math.cos(d.location * (Math.PI / 180)) + 4.5;
		}
	});

// append arcs
var arcs = face
	.selectAll('path')
	.data(function(d) {
		return d.hands;
	})
	.enter()
	.append('path')
	.attr('class', function(d) {
		return d.type;
	})
	.attr({
		//Color cercle de chargement
		fill: '#eeeeee',
		opacity: 1
	});

var hands = face
	.selectAll('.hand')
	.data(function(d) {
		return d.hands;
	})
	.enter()
	.append('line')
	.attr('class', function(d) {
		return 'hands ' + d.type;
	})
	.attr({
		x1: 0,
		y1: 0,
		x2: function(d) {
			return d.length * Math.cos(270 * (Math.PI / 180));
		},
		y2: function(d) {
			return d.length * Math.sin(270 * (Math.PI / 180));
		},
		stroke: function(d) {
			return d.color;
		},
		'stroke-width': function(d) {
			return d.width;
		},
		'stroke-linecap': 'round'
	});

// center circle
face.append('circle').classed('center', true).attr({
	r: r / 20,
	fill: '#4b5761'
});

var rings = face
	.selectAll('.outer-ring')
	.data(function(d) {
		return d.hands;
	})
	.enter()
	.append('g')
	.classed('outer-ring', true);

// outer ring
rings.append('circle').classed('ring', true).attr({
	r: function(d) {
		return d.ringR;
	},
	fill: 'transparent',
	stroke: clock.tickColor,
	'stroke-width': 1
});

var sliderGroup = rings
	.append('g')
	.attr('class', function(d) {
		return d.type;
	})
	.style('cursor', 'move')
	.on('mouseover', function() {
		d3.select(this).select('.slider-background').transition().attr('r', clock.sliderR * 1.5 + 10);
	})
	.on('mouseleave', function() {
		d3.select(this).select('.slider-background').transition().attr('r', clock.sliderR * 1.5);
	})
	.call(drag);

// slider
sliderGroup.append('circle').classed('slider', true).attr({
	r: clock.sliderR,
	fill: function(d) {
		return d.color;
	},
	cx: function(d) {
		return d.ringR * Math.cos(270 * (Math.PI / 180));
	},
	cy: function(d) {
		return d.ringR * Math.sin(270 * (Math.PI / 180));
	}
});

// slider content
sliderGroup
	.append('text')
	.classed('content', true)
	.text(function(d) {
		return d.content;
	})
	.attr({
		fill: 'white',
		'text-anchor': 'middle',
		'font-size': 16,
		'font-family': 'sans-serif',
		x: function(d) {
			return d.ringR * Math.cos(270 * (Math.PI / 180));
		},
		y: function(d) {
			return d.ringR * Math.sin(270 * (Math.PI / 180)) + 5.5;
		}
	});

/* Fonctions de conversions et autres */

function convert(dd) {
	var sign = '';
	// TODO - degrees should be normalized to the range [0,365]
	if (dd < 0) {
		sign = '-';
		dd = -dd;
	}
	// first, compute the total number of seconds: degrees * 60 minutes/degree * 60 seconds/minute
	var totalSeconds = dd * 3600;
	var degrees = Math.floor(dd);
	totalSeconds -= degrees * 3600;
	// totalSeconds now represents the fractional degrees
	var minutes = Math.floor(totalSeconds / 60);
	totalSeconds -= minutes * 60;

	return dd + '° => ' + Math.floor(60 - minutes) + ' minutes => ' + totalSeconds + 'secondes';
}
