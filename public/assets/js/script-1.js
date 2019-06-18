var margin = { top: 10, right: 10, bottom: 20, left: 10 };
var w = d3.select('.clock').node().clientWidth - margin.left - margin.right;
var h = d3.select('.clock').node().clientHeight - margin.top - margin.bottom;

var btnStart = document.querySelector('#btnStart');
var btnPlay = document.querySelector('#btnPlay');
var btnPause = document.querySelector('#btnPause');
var btnStop = document.querySelector('#btnStop');
var canDrag = true;
var timerStart = false;
var timerPause = false;
var sec = 60;

// radius of entire figure
//var r = Math.min(w, h) / 2;
var divis = 2.7;
var r = Math.max(window.innerWidth, window.innerHeight) / divis;

while (r >= window.innerHeight) {
	divis += 0.1;
	r = Math.max(window.innerWidth, window.innerHeight) / divis;
}

function format(minutes, seconds) {
	minutes = minutes < 10 ? '0' + minutes : minutes;
	seconds = seconds < 10 ? '0' + seconds : seconds;

	var display = document.querySelectorAll('.currentTime');
	for (let k = 0; k < display.length; k++) {
		display[k].textContent = minutes + ':' + seconds;
	}

	if (timerStart === true) {
	}
}

// drag behavior
var drag = d3.behavior.drag().on('dragstart', dragstart).on('drag', drag);

function dragstart() {
	d3.select(this).select('.slider-background').transition().attr('r', clock.sliderR);
}

function drag() {
	if (canDrag === false) {
		return;
	}
	var mouse = Math.atan2(d3.event.y, d3.event.x);
	var deg = mouse / (Math.PI / 180) + 90;
	var arcMouse = deg < 0 ? 360 + deg : deg;
	var which = d3.select(this).attr('class');

	sec = 3600 - Math.round(Math.round(arcMouse) * 60 / 360) * 60;

	//var timer = new CountDownTimer(sec);
	var timeObj = CountDownTimer.parse(sec);

	btnPlay.classList.remove('hide');
	btnStart.classList.add('hide');
	btnPause.classList.add('hide');
	btnStop.classList.add('hide');

	format(timeObj.minutes, timeObj.seconds);

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
			var arcR = d.length - 19.5; //rayon du second cercle
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
	faceColor: '#ffffff',
	tickColor: '#000000',
	sliderR: 8,
	hands: [
		{
			type: 'second',
			content: '',
			value: 0,
			length: 0,
			ringR: 0,
			color: '#91AA9D',
			width: 4,
			labels: d3.range(5, 61, 5),
			scale: d3.scale.linear().domain([ 59, 0 ]).range([ 6, 360 ])
		},
		{
			type: 'minute',
			content: '',
			value: 0,
			length: 0,
			ringR: 0,
			color: '#3E606F',
			width: 6,
			ticks: d3.range(0, 60), // start, stop, step
			tickLength: 10,
			tickStrokeWidth: 1.5,
			scale: d3.scale.linear().domain([ 59, 0 ]).range([ 0, 354 ])
		},
		{
			type: 'hour',
			content: '',
			value: 0,
			length: r - 110, // Longueur du trait de draggble
			ringR: r - 106, //  Rayon du cercle draggble
			color: '#193441',
			width: 6,
			ticks: d3.range(0, 12),
			tickLength: 10,
			tickStrokeWidth: 2.5,
			scale: d3.scale.linear().domain([ 11, 0 ]).range([ 0, 330 ])
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
	stroke: 'none'
});

// center green circle
face.append('circle').classed('center', true).attr({
	r: r - 130,
	fill: '#32c832'
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
				radius: clock.r + 20
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
		'font-size': 20,
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
	fill: clock.hands[2].color
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
	fill: 'none',
	stroke: 'none',
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

$(function() {
	btnPlay.addEventListener('click', function() {
		var timer = new CountDownTimer(sec);
		var timeObj = CountDownTimer.parse(sec);

		format(timeObj.minutes, timeObj.seconds);
		timer.onTick(format);
		timer.start();
		timerStart = true;
		canDrag = false;
		btnPlay.classList.add('hide');
		btnPause.classList.remove('hide');
	});
});
