function toMoney(value) {
	var d = value.toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	return '$' + d.slice(0, -2);
}

function randomWindow(x, p) {
	let min = x - (x * p), max = x + (x * p);
	return (Math.random() * (max - min)) + min;
}

function randomBetter(x, p) {
	let w = x * p;
	let min = x;
	let max = x + w;
	return (Math.random() * (max - min)) + min;
}

function randomWorse(x, p) {
	let w = x * p;
	let min = x - w;
	let max = x;
	return (Math.random() * (max - min)) + min;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function onPrint() {
	var popup = open('','Report','width=950, height=650');
	var newdoc = popup.document;
	var p = $(popup.document.body)[0]

	var scripts = [
	  'http://bootbarn.retailscientifics.com/jqboot.cat.js'
	  , 'https://cdn.plot.ly/plotly-latest.min.js'
	  , 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.1.4/Chart.min.js'
	];

	var css = [
	  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'
	]

	///////////////////////////
	var row1 = newdoc.createElement('div');
	row1.className = 'row'
	row1.style.cssText = 'border: 1px inset gray; margin-top: 2%;'

	var row1col1 = newdoc.createElement('div');
	row1col1.className = 'col-xs-6'
	row1col1.style.cssText = 'margin-top: 3%;'

	var row1col2 = newdoc.createElement('div');
	row1col2.className = 'col-xs-6'

	p.appendChild(row1);
	row1.appendChild(row1col1)
	row1.appendChild(row1col2)

	row1col1.innerHTML = document.getElementById('forecast').innerHTML;

	row1col2.innerHTML = document.getElementById('summary').innerHTML;
	///////////////////////////
	var row2 = newdoc.createElement('div');
	row2.className = 'row'

	var header1 = newdoc.createElement('h1')
	header1.innerHTML = 'Store Sales Analogs'
	header1.style.cssText = 'text-align: center; margin-bottom: 5px;'

	var row2col1 = newdoc.createElement('div');
	row2col1.className = 'col-xs-6'

	var row2col2 = newdoc.createElement('div');
	row2col2.className = 'col-xs-5'

	p.appendChild(row2);
	row2.appendChild(header1)
	row2.appendChild(row2col1)
	row2.appendChild(row2col2)

	row2col1.appendChild(
	  document.getElementById('analogs1').cloneNode(true)
	);

	var chart1 = newdoc.createElement('canvas');
	row2col2.appendChild(chart1);
	makeChart1(chart1, arr1);
	///////////////////////////
	var row3 = newdoc.createElement('div');
	row3.className = 'row'

	var header2 = newdoc.createElement('h1')
	header2.innerHTML = 'Store Characteristic Analogs'
	header2.style.cssText = 'text-align: center; margin-bottom: 5px;'

	var row3col1 = newdoc.createElement('div');
	row3col1.className = 'col-xs-6'

	var row3col2 = newdoc.createElement('div');
	row3col2.className = 'col-xs-5'

	p.appendChild(row3);
	row3.appendChild(header2)
	row3.appendChild(row3col1)
	row3.appendChild(row3col2)

	row3col1.appendChild(
	  document.getElementById('analogs2').cloneNode(true)
	);

	var chart2 = newdoc.createElement('canvas');
	row3col2.appendChild(chart2);
	makeChart2(chart2, arr2);
	///////////////////////////

	for(c of css) {
	  var style = newdoc.createElement('link');
	  style.rel = 'stylesheet';
	  style.href = c;
	  newdoc.getElementsByTagName('head')[0].appendChild(style);
	}

	for(s of scripts) {
	  var script = newdoc.createElement('script');
	  script.src = s;
	  newdoc.getElementsByTagName('head')[0].appendChild(script);
	}

	newdoc.body.style.cssText = 'margin-left: 25px; margin-right: 25px;';

	var script = newdoc.createElement('script');
	script.src = 'Chart.defaults.global.responsive = true;'
	newdoc.body.appendChild(script);
}

function verticalBarChart(divID, data) {
	return new Chart(document.getElementById(divID), {
		type: 'horizontalBar',
		data: data,
		options: {
			title: {
				display: true,
				text: 'Store Analogs'
			},
			scales: {
				yAxes: [{
					id: 'y-axis-0',
					gridLines: {
						display: false,
						lineWidth: 1,
						color: 'rgba(0,0,0,0.30)'
					},
					ticks: {
						beginAtZero: true,
						mirror: false,
						suggestedMin: 0
					}
				}],
				xAxes: [{
					id: 'x-axis-0',
					gridLines: {
						display: true
					},
					ticks: {
						beginAtZero: true,
						userCallback: function(value, index, values) {
							return toMoney(value);
						}
					}
				}]
			}
		}
	});
};

function makeChart1(node, data) {

	chart1 = new Chart(node, {
		type: 'horizontalBar',
		data: {
			labels: data,
			datasets: [{
				label: 'Analog Sales 1',
				data: data.map(a => a.sales),
				backgroundColor: data.map(a => a.bgColor),
				borderColor: data.map(a => a.borderColor),
				borderWidth: 1
			}]
		},
		options: {
			legend: {
				display: false
			},
			tooltipTemplate: "<%= toMoney(value) %>",
			title: {
				display: false,
				text: 'Store Analogs'
			},
			scales: {
				yAxes: [{
					id: 'y-axis-0',
					gridLines: {
						display: false,
						lineWidth: 1,
						color: 'rgba(0,0,0,0.30)'
					},
					ticks: {
						beginAtZero: true,
						mirror: false,
						suggestedMin: 0
					}
				}],
				xAxes: [{
					id: 'x-axis-0',
					gridLines: {
						display: true
					},
					ticks: {
						beginAtZero: true,
						userCallback: function(value, index, values) {
							return toMoney(value);
						}
					}
				}]
			}
		}
	});
}

function renderTable(table, rows) {
	for (var i = 0; i < rows.length; i++) {
		$(table).append(
			'<tr><td>' + rows[i].id + '</td>' +
			'<td>' + rows[i].name + '</td>' +
			'<td style="text-align: right;">$' + formatMoney(rows[i].sales) + '</td></tr>'
		);
	}
};

function buildCharts2(data, context) {
	console.log('Building charts for Form 2.')
	var letter = 'A',
		estimate = data['estimate'][0],
		analogs = data['analogs'],
		cannibalizationData = data['cannibalization'],
		demogData = data['demography'],
		rData = data['radarData'],
		pData = data['pieData'],
		x1 = data['x1'],
		x2 = data['x2'],
		y1 = data['y1'],
		y2 = data['y2'];

	for (var i in context.charts2) {
		if (context.charts2[i]) {
			context.charts2[i].destroy();
		}
	}

	var storeLabels = ['Store A', 'Store B', 'New Site', 'Store C', 'Store D', 'Store E', 'Store F'],
		cannibalizationLabels = ['Store 1', 'Store 2', 'Store 3', 'Store 4', 'Store 5', 'Store 6'],
		demographyLabels = ['Median Household Income', 'Households', 'Quick Serve Revenue', 'Dining Out Inexpensive', 'Diversity Index'],
		pieLabels = ['Direct Mail', 'Circulars', 'Radio', 'Television', 'Local Marketing', 'Grand Opening'],
		radarLabels = ['12','1','2','3','4','5','6','7','8','9','10','11'];

	// Enter a value between 0 and 180
	var gaugeLevel = +(180 * (estimate / 5100000)).toFixed(2);

	var totalCannibalization = cannibalizationData.reduce((a, b) => a + b);

	context.charts2 = [];

	var analogData = {
		labels: storeLabels,
		datasets: [{
			label: 'Yearly Sales',
			data: analogs.sort((a, b) => a - b).reverse().slice(0, 2)
				.concat([estimate])
				.concat(analogs.sort((a, b) => a - b).reverse().slice(2)),
			backgroundColor: [
				'rgba(91, 155, 213, 0.4)',
				'rgba(91, 155, 213, 0.4)',
				'rgba(75, 192, 192, 0.2)',
				'rgba(91, 155, 213, 0.4)',
				'rgba(91, 155, 213, 0.4)',
				'rgba(91, 155, 213, 0.4)',
				'rgba(91, 155, 213, 0.4)'
			],
			borderColor: [
				'rgba(54, 162, 235, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(75, 192, 192, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(54, 162, 235, 1)'
			],
			borderWidth: 1
		}]
	};

	// Cannibalization
	var maxCannibIndex = cannibalizationData.indexOf(Math.max(...cannibalizationData));

	var bgcolor = Array(7).fill('rgba(64, 64, 64, 0.4)'),
		bordercolor = Array(7).fill('rgba(64, 64, 64, 0.9)');

	bgcolor[maxCannibIndex] = 'rgba(219, 64, 64, 0.4)';
	bordercolor[maxCannibIndex] = 'rgba(219, 64, 64, 0.9)';

	context.charts2.push(new Chart(document.getElementById('form2-vertical-bar-1'), {
		type: 'horizontalBar',
		data: {
			labels: cannibalizationLabels,
			datasets: [{
				label: 'Cannibalization',
				data: cannibalizationData,
				backgroundColor: bgcolor,
				borderColor: bordercolor,
				borderWidth: 1
			}]
		},
		options: {
			title: {
				display: true,
				text: 'Cannibalization (' + toMoney(totalCannibalization) + ')'
			},
			scales: {
				xAxes: [{
					id: 'y-axis-0',
					gridLines: {
						display: true,
						lineWidth: 1,
						color: 'rgba(0,0,0,0.05)'
					},
					ticks: {
						beginAtZero: true,
						mirror: false,
						suggestedMin: 0,
						userCallback: function(value, index, values) {
							return toMoney(value);
						}
					}
				}],
				yAxes: [{
					id: 'x-axis-0',
					gridLines: {
						display: false
					},
					ticks: {
						beginAtZero: true
					}
				}]
			},
			responsive: true
		}
	}));

	// Store Analogs
	context.charts2.push(new Chart(document.getElementById('form2-vertical-bar-2'), {
		type: 'horizontalBar',
		data: analogData,
		options: {
			title: {
				display: true,
				text: 'Store Analogs'
			},
			scales: {
				yAxes: [{
					id: 'y-axis-0',
					gridLines: {
						display: false,
						lineWidth: 1,
						color: 'rgba(0,0,0,0.30)'
					},
					ticks: {
						beginAtZero: true,
						mirror: false,
						suggestedMin: 0
					}
				}],
				xAxes: [{
					id: 'x-axis-0',
					gridLines: {
						display: true
					},
					ticks: {
						beginAtZero: true,
						userCallback: function(value, index, values) {
							return toMoney(value);
						}
					}
				}]
			}
		}
	}));
}

function buildCharts1(data, context) {
	var baseController = Chart.controllers.horizontalBar;
	Chart.defaults.hBarWithLine = Chart.defaults.horizontalBar;

	Chart.controllers.hBarWithLine = Chart.controllers.horizontalBar.extend({
		draw: function (ease) {
			baseController.prototype.draw.apply(this, arguments);

			var ctx = this.chart.chart.ctx;

			var point = this.chart.chart.config.lineAt;
			var yScale = this.chart.scales['x-axis-0'];
			var scale = this.chart.scales['y-axis-0'];

			var left = (point / scale.end * (scale.right - scale.left));

			ctx.beginPath();
			ctx.strokeStyle = 'rgba(135, 157, 193,0.7)';
			ctx.fillStyle = 'rgba(135, 157, 193,0.7)';

			ctx.moveTo(scale.left + left - 10, yScale.top);
			ctx.lineTo(scale.left + left - 10, yScale.bottom);
			ctx.stroke();

			ctx.lineWidth = 10;
			ctx.textAlign = 'center';
			ctx.fillText('100', scale.left + left - 10, 15);
		}
	});

	var letter = 'A',
		estimate = data.estimate,
		analogs = data.analogs,
		cannibalizationData = data['cannibalization'],
		demogData = data['demography'],
		rData = data['radarData'],
		pData = data['pieData'],
		x1 = data['x1'],
		x2 = data['x2'],
		y1 = data['y1'],
		y2 = data['y2'];

	for (var i in context.charts1) {
		if (context.charts1[i]) {
			context.charts1[i].destroy();
		}
	}

	var storeLabels = ['Store A', 'Store B', 'New Site', 'Store C', 'Store D', 'Store E', 'Store F'],
		cannibalizationLabels = ['Store 1', 'Store 2', 'Store 3', 'Store 4', 'Store 5', 'Store 6'],
		demographyLabels = ['Median Household Income', 'Households', 'Quick Serve Revenue', 'Dining Out Inexpensive', 'Diversity Index'],
		pieLabels = ['Direct Mail', 'Circulars', 'Radio', 'Television', 'Local Marketing', 'Grand Opening'],
		radarLabels = ['12','1','2','3','4','5','6','7','8','9','10','11'];

	// Enter a value between 0 and 180
	var gaugeLevel = +(180 * (estimate / 5100000)).toFixed(2);

	var totalCannibalization = cannibalizationData.reduce((a, b) => a + b);

	context.charts1 = [];

	var radarData = {
		labels: radarLabels,
		datasets: [{
			label: 'Make Index',
			fillColor: 'rgba(220,220,220,0.5)',
			strokeColor: 'rgba(220, 220, 220, 1)',
			data: rData
		}]
	};

	var pieData = {
		labels: pieLabels,
		datasets: [{
			data: pData,
			backgroundColor: [
				'#5B9BD5',
				'#ED7D31',
				'#A5A5A5',
				'#FFC000',
				'#4472C4',
				'#70AD47'
			],
			label: 'My dataset' // for legend
		}]
	};

	var analogData = {
		labels: storeLabels,
		datasets: [{
			label: 'Yearly Sales',
			data: analogs
				.sort((a, b) => a - b).reverse().slice(0, 2)
				.concat([estimate])
				.concat(analogs.sort((a, b) => a - b).reverse().slice(2))
				.map(a => +a.toFixed(2)),
			backgroundColor: [
				'rgba(91, 155, 213, 0.4)',
				'rgba(91, 155, 213, 0.4)',
				'rgba(75, 192, 192, 0.2)',
				'rgba(91, 155, 213, 0.4)',
				'rgba(91, 155, 213, 0.4)',
				'rgba(91, 155, 213, 0.4)',
				'rgba(91, 155, 213, 0.4)'
			],
			borderColor: [
				'rgba(54, 162, 235, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(75, 192, 192, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(54, 162, 235, 1)'
			],
			borderWidth: 1
		}]

	};

	// Build Charts

	// Store Analogs
	context.charts1.push(new Chart(document.getElementById('horizontal-bar'), {
		type: 'horizontalBar',
		data: analogData,
		options: {
			title: {
				display: true,
				text: 'Store Analogs'
			},
			scales: {
				yAxes: [{
					id: 'y-axis-0',
					gridLines: {
						display: false,
						lineWidth: 1,
						color: 'rgba(0,0,0,0.30)'
					},
					ticks: {
						beginAtZero: true,
						mirror: false,
						suggestedMin: 0
					}
				}],
				xAxes: [{
					id: 'x-axis-0',
					gridLines: {
						display: true
					},
					ticks: {
						beginAtZero: true,
						userCallback: function(value, index, values) {
							return toMoney(value);
						}
					}
				}]
			}
		}
	}));

	// Cannibalization
	var maxCannibIndex = cannibalizationData.indexOf(Math.max(...cannibalizationData));

	var bgcolor = Array(7).fill('rgba(64, 64, 64, 0.4)'),
		bordercolor = Array(7).fill('rgba(64, 64, 64, 0.9)');

	bgcolor[maxCannibIndex] = 'rgba(219, 64, 64, 0.4)';
	bordercolor[maxCannibIndex] = 'rgba(219, 64, 64, 0.9)';

	context.charts1.push(new Chart(document.getElementById('vertical-bar-1'), {
		type: 'horizontalBar',
		data: {
			labels: cannibalizationLabels,
			datasets: [{
				label: 'Cannibalization',
				data: cannibalizationData,
				backgroundColor: bgcolor,
				borderColor: bordercolor,
				borderWidth: 1
			}]
		},
		options: {
			title: {
				display: true,
				text: 'Cannibalization (' + toMoney(totalCannibalization) + ')'
			},
			scales: {
				xAxes: [{
					id: 'y-axis-0',
					gridLines: {
						display: true,
						lineWidth: 1,
						color: 'rgba(0,0,0,0.05)'
					},
					ticks: {
						beginAtZero: true,
						mirror: false,
						suggestedMin: 0,
						userCallback: function(value, index, values) {
							return toMoney(value);
						}
					}
				}],
				yAxes: [{
					id: 'x-axis-0',
					gridLines: {
						display: false
					},
					ticks: {
						beginAtZero: true
					}
				}]
			},
			responsive: true
		}
	}));

	// Indexed Key Demography
	context.charts1.push(new Chart(document.getElementById('vertical-bar-2'), {
		type: 'hBarWithLine',
		data: {
			labels: demographyLabels,
			datasets: [{
				label: 'Indexed Key Demography',
				data: demogData,
				backgroundColor: 'rgba(170, 102, 68, 0.4)',
				borderColor: 'rgba(170, 102, 68, 0.9)',
				borderWidth: 1
			}]
		},
		lineAt: 100,
		options: {
			pointLabelFontSize: 20,
			title: {
				display: true,
				text: 'Indexed Key Demography'
			},
			scales: {
				xAxes: [{
					id: 'y-axis-0',
					gridLines: {
						display: true,
						lineWidth: 1,
						color: 'rgba(0,0,0,0.05)'
					},
					ticks: {
						beginAtZero: true,
						mirror: false,
						suggestedMin: 0,
						userCallback: function(value, index, values) {
							return value;
						}
					}
				}],
				yAxes: [{
					id: 'x-axis-0',
					gridLines: {
						display: false
					},
					ticks: {
						beginAtZero: true
					}
				}]
			},
			responsive: true
		}
	}));

	// Predicted Ingredient Distribution
	context.charts1.push(new Chart(document.getElementById('radar1'), {
		type: 'radar',
		data: radarData,
		options: {
			legend: {
				display: false,
				position: 'top'
			},
			title: {
				display: true,
				text: 'Predicted Daily Revenue Distribution'
			},
			scale: {
				reverse: false,
				gridLines: {
					color: [
						'rgba(219, 64, 64, 0.2)', 'rgba(219, 64, 64, 0.8)',
						'rgba(91, 155, 213, 0.2)', 'rgba(91, 155, 213, 0.8)',
						'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.8)'
					]
				},
				ticks: {
					beginAtZero: true,
					userCallback: function(value, index, values) {
						return value + '%';
					},
					min: 0,
					max: 30,
					stepSize: 5
				}
			}
		},
		responsive: true
	}));

	context.charts1.push(new Chart(document.getElementById('pie1'), {
		type: 'pie',
		data: pieData,
		options: {
			title: {
				display: true,
				text: 'Incremental Marketing Allocation'
			},
			legend: {
				position: 'right',
				display: 'true'
			}
		}
	}));

	Plotly.d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/2014_us_cities.csv', function(err, rows) {
		if (err) console.log(err);

		function unpack(rows, key) {
			return rows.map(row => row[key]);
		}

		var cityName = unpack(rows, 'name'),
			cityPop = unpack(rows, 'pop'),
			cityLat = unpack(rows, 'lat'),
			cityLon = unpack(rows, 'lon'),
			citySize = [],
			hoverText = [],
			scale = 50000;

		for (var i = 0; i < cityPop.length; i++) {
			var currentSize = cityPop[i] / scale;
			var currentText = cityName[i] + ' pop: ' + cityPop[i];
			citySize.push(currentSize);
			hoverText.push(currentText);
		}

		var data = [{
			type: 'scattergeo',
			locationmode: 'USA-states',
			lat: cityLat,
			lon: cityLon,
			hoverinfo: 'text',
			text: hoverText,
			marker: {
				size: citySize,
				line: {
					color: 'black',
					width: 2
				}
			}
		}];

		var layout = {
			title: 'National Revenue Distribution',
			showlegend: false,
			geo: {
				scope: 'usa',
				projection: {
					type: 'albers usa'
				},
				showland: true,
				landcolor: 'rgb(217, 217, 217)',
				subunitwidth: 1,
				countrywidth: 1,
				subunitcolor: 'rgb(255,255,255)',
				countrycolor: 'rgb(255,255,255)'
			}
		};

		Plotly.purge('mapDiv');
		Plotly.newPlot('mapDiv', data, layout, {
			showLink: false
		});
	});

	var trace1 = {
		x: x1,
		y: y1,
		name: 'Distribution',
		type: 'scatter'
	};

	var trace2 = {
		x: x2,
		y: y2,
		fill: 'tozeroy',
		name: 'Lowest Percentage',
		type: 'scatter'
	};

	var layout = {
		title: 'Distribution of<br>Relocation Performance',
		showlegend: false,
		yaxis: {
			showticklabels: false,
			showgrid: false
		},
		xaxis: {
			autorange: true
		},
		margin: {
			l: 0,
			r: 0,
			b: 0,
			t: 35,
			pad: 10
		}
	};

	var data = [trace1, trace2];
	Plotly.newPlot('plotly-div', data, layout);

	/* Gauge */

	// Trig to calculate meter point
	var degrees = 180 - gaugeLevel,
		radius = 0.5;
	var radians = degrees * Math.PI / 180;
	var x = radius * Math.cos(radians);
	var y = radius * Math.sin(radians);

	// Path: may have to change to create a better triangle
	var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
		pathX = String(x),
		space = ' ',
		pathY = String(y),
		pathEnd = ' Z',
		path = mainPath.concat(pathX, space, pathY, pathEnd);

	var data2 = [{
		type: 'scatter',
		x: [0],
		y: [0],
		marker: {
			size: 28,
			color: '850000'
		},
		showlegend: false,
		name: 'Performance Index',
		text: gaugeLevel,
		hoverinfo: 'text+name'
	}, {
		values: [50 / 6, 50 / 6, 50 / 6, 50 / 6, 50 / 6, 50 / 6, 50],
		rotation: 90,
		text: [
			'Ideal', 'Excellent', 'Good',
			'Average', 'Poor', 'Very Poor'
		],
		textinfo: 'text',
		textposition: 'inside',
		marker: {
			colors: [
				'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
				'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
				'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
				'rgba(255, 255, 255, 0)'
			]
		},
		labels: ['151-200', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
		hoverinfo: 'label',
		hole: 0.5,
		type: 'pie',
		showlegend: false
	}];

	var layout2 = {
		shapes: [{
			type: 'path',
			path: path,
			fillcolor: '850000',
			line: {
				color: '850000'
			}
		}],
		title: '<b>Expected Performance</b>',
		xaxis: {
			zeroline: false,
			showticklabels: false,
			showgrid: false,
			range: [-1, 1],
			fixedrange: true
		},
		yaxis: {
			zeroline: false,
			showticklabels: false,
			showgrid: false,
			range: [-1, 1],
			fixedrange: true
		},
		margin: {
			l: 0,
			r: 0,
			b: 0,
			t: 35,
			pad: 10
		}
	};

	Plotly.newPlot('gaugeDiv', data2, layout2);
}

function buildSiteSelectionCharts(data, context) {
	var baseController = Chart.controllers.horizontalBar;
	Chart.defaults.hBarWithLine = Chart.defaults.horizontalBar;

	Chart.controllers.hBarWithLine = Chart.controllers.horizontalBar.extend({
		draw: function (ease) {
			baseController.prototype.draw.apply(this, arguments);

			var ctx = this.chart.chart.ctx;

			var point = this.chart.chart.config.lineAt;
			var yScale = this.chart.scales['x-axis-0'];
			var scale = this.chart.scales['y-axis-0'];

			var left = (point / scale.end * (scale.right - scale.left));

			ctx.beginPath();
			ctx.strokeStyle = 'rgba(135, 157, 193,0.7)';
			ctx.fillStyle = 'rgba(135, 157, 193,0.7)';

			ctx.moveTo(scale.left + left - 10, yScale.top);
			ctx.lineTo(scale.left + left - 10, yScale.bottom);
			ctx.stroke();

			ctx.lineWidth = 10;
			ctx.textAlign = 'center';
			ctx.fillText('100', scale.left + left - 10, 15);
		}
	});

	var letter = 'A',
		estimate = data['estimate'],
		analogs = data['analogs'],
		xaidataname = data['xaidataname'],
		xaidataimpact1 = data['xaidataimpact1'],
		xaidatapercentile=data['xaidatapercentile'],
		xaicatname = data['xaicatname'],
		xaicatimpact1 = data['xaicatimpact1'],
		cannibalizationData = data['cannibalization'],
		demogData = data['demography'],
		rData = data['radarData'],
		pData = data['pieData'],
		x1 = data['x1'],
		x2 = data['x2'],
		y1 = data['y1'],
		bgColorvar='rgba(0, 177, 106, 0.2)',
		borderColorvar='rgba(0, 177, 106, 1)',
		y2 = data['y2'];
		dataxai = [];
		dataxaicat = [];


		for (var i = 0; i <= 19; i++) {
							xaiName = xaidataname[i];
							xaiImpact = xaidataimpact1[i];
							xaipercentile=xaidatapercentile[i];

							bgColorvar='rgba(0, 177, 106, 0.2)';
							borderColorvar='rgba(0, 177, 106, 1)';
							if (xaiImpact<0) {
								bgColorvar='rgba(207, 0, 15, 0.2)';
								borderColorvar='rgba(207, 0, 15, 1)';
							}
							
							dataxai.push({
								//id: xaiName,
								name: xaiName,
								impact1: xaiImpact,
								bgColor: bgColorvar,
								borderColor: borderColorvar,
								xaidatapercentile: xaipercentile
							});						
						}
		for (var i = 0; i <= 4; i++) {
							xaiName = xaicatname[i];
							xaiImpact = xaicatimpact1[i];

							bgColorvar='rgba(0, 177, 106, 0.2)';
							borderColorvar='rgba(0, 177, 106, 1)';
							if (xaiImpact<0) {
								bgColorvar='rgba(207, 0, 15, 0.2)';
								borderColorvar='rgba(207, 0, 15, 1)';
							}
							
							dataxaicat.push({
								//id: xaiName,
								name: xaiName,
								impact1: xaiImpact,
								bgColor: bgColorvar,
								borderColor: borderColorvar
							});						
						}
	for (var i in context.charts2) {
		if (context.charts2[i]) {
			context.charts2[i].destroy();
		}
	}
	context.charts2 = [];

	var storeLabels = ['Store A', 'Store B', 'New Site', 'Store C', 'Store D', 'Store E', 'Store F'],
		cannibalizationLabels = ['Store 1', 'Store 2', 'Store 3', 'Store 4', 'Store 5', 'Store 6'],
		demographyLabels = ['Median Household Income', 'Households', 'Quick Serve Revenue', 'Dining Out Inexpensive', 'Diversity Index'],
		pieLabels = ['Direct Mail', 'Circulars', 'Radio', 'Television', 'Local Marketing', 'Grand Opening'],
		radarLabels = ['12','1','2','3','4','5','6','7','8','9','10','11'];

	// Enter a value between 0 and 180
	var gaugeLevel = +(180 * (estimate / 5100000)).toFixed(2);

	var totalCannibalization = cannibalizationData.reduce((a, b) => a + b);

	var radarData = {
		labels: radarLabels,
		datasets: [{
			label: 'Make Index',
			fillColor: 'rgba(220,220,220,0.5)',
			strokeColor: 'rgba(220, 220, 220, 1)',
			data: rData
		}]
	};

	var pieData = {
		labels: pieLabels,
		datasets: [{
			data: pData,
			backgroundColor: [
				'#5B9BD5',
				'#ED7D31',
				'#A5A5A5',
				'#FFC000',
				'#4472C4',
				'#70AD47'
			],
			label: 'My dataset' // for legend
		}]
	};

	var analogData = {
		labels: storeLabels,
		datasets: [{
			label: 'Yearly Sales',
			data: analogs.sort((a, b) => a - b).reverse().slice(0, 2)
				.concat([estimate])
				.concat(analogs.sort((a, b) => a - b).reverse().slice(2))
				.map(a => +a.toFixed(2)),
			backgroundColor: [
				'rgba(91, 155, 213, 0.4)',
				'rgba(91, 155, 213, 0.4)',
				'rgba(75, 192, 192, 0.2)',
				'rgba(91, 155, 213, 0.4)',
				'rgba(91, 155, 213, 0.4)',
				'rgba(91, 155, 213, 0.4)',
				'rgba(91, 155, 213, 0.4)'
			],
			borderColor: [
				'rgba(54, 162, 235, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(75, 192, 192, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(54, 162, 235, 1)'
			],
			borderWidth: 1
		}]

	};

	// Build Charts

	// Store Analogs
	context.charts2.push(new Chart(document.getElementById('horizontal-bar-ss'), {
		type: 'horizontalBar',
		data: analogData,
		options: {
			title: {
				display: true,
				text: 'Store Analogs'
			},
			scales: {
				yAxes: [{
					id: 'y-axis-0',
					gridLines: {
						display: false,
						lineWidth: 1,
						color: 'rgba(0,0,0,0.30)'
					},
					ticks: {
						beginAtZero: true,
						mirror: false,
						suggestedMin: 0
					}
				}],
				xAxes: [{
					id: 'x-axis-0',
					gridLines: {
						display: true
					},
					ticks: {
						beginAtZero: true,
						userCallback: function(value, index, values) {
							return toMoney(value);
						}
					}
				}]
			}
		}
	}));

	context.charts2.push(new Chart(document.getElementById('horizontal-bar-xaiss'), {
		type: 'horizontalBar',
		data: {
			//labels: xaidataname,
			//datasets: [{
			//	label: 'Impact $',
			//	data: xaidataimpact1,
			//	backgroundColor: bgColorarr,
			//	borderColor: borderColorarr,
			//	borderWidth: 1
			//}]
			labels: dataxai.map(a => a.name),
			datasets: [{
				label: 'Impact $',
				data: dataxai.map(a => a.impact1),
				backgroundColor: dataxai.map(a => a.bgColor),
				borderColor: dataxai.map(a => a.borderColor),
				borderWidth: 1
			}]
		},
		options: {
			legend: {
				display: false
			},
			title: {
				display: true,
				text: 'Top 20 Explainable AI Estimated Impacts'
			},
			tooltips: {
        		callbacks: {
            		        afterLabel: function(tooltipItem, data) {
        						const tt = dataxai[tooltipItem['index']].xaidatapercentile
 						        return '(Site Value Percentile: ' + tt + '%)';
    						}
        		}
    		},
			scales: {
				yAxes: [{
					id: 'y-axis-0',
					gridLines: {
						display: true,
						lineWidth: .5
					},
					ticks: {
						beginAtZero: true,
						mirror: false,
						suggestedMin: 0,
						fontSize: 9
					},
					barPercentage: 0.75,
					categoryPercentage: 0.75
				}],
				xAxes: [{
					position: 'top',
					id: 'x-axis-0',
					gridLines: {
						display: true,
						lineWidth: .5
					},
					ticks: {
						beginAtZero: true,
						fontSize: 9,
						userCallback: function (value, index, values) {
							 if(parseInt((value)) >= 1000 || parseInt((value)) <= 1000){
                				return (toMoney(value/1000).toString()+'K');
              					} else {
                				return toMoney(value).toString();
              					}
						}
					}
				}]
			}
		}
	}));

	context.charts2.push(new Chart(document.getElementById('horizontal-bar-xaicatss'), {
		type: 'horizontalBar',
		data: {
			//labels: xaidataname,
			//datasets: [{
			//	label: 'Impact $',
			//	data: xaidataimpact1,
			//	backgroundColor: bgColorarr,
			//	borderColor: borderColorarr,
			//	borderWidth: 1
			//}]
			labels: dataxaicat.map(a => a.name),
			datasets: [{
				label: 'Impact $',
				data: dataxaicat.map(a => a.impact1),
				backgroundColor: dataxaicat.map(a => a.bgColor),
				borderColor: dataxaicat.map(a => a.borderColor),
				borderWidth: 1
			}]
		},
		options: {
			legend: {
				display: false
			},
			title: {
				display: true,
				text: 'Explainable AI: Category Aggregate Impact'
			},
			scales: {
				yAxes: [{
					id: 'y-axis-0',
					gridLines: {
						display: true,
						lineWidth: .5
					},
					ticks: {
						beginAtZero: true,
						mirror: false,
						suggestedMin: 0,
						fontSize: 11
					},
					barPercentage: 0.75,
					categoryPercentage: 0.75
				}],
				xAxes: [{
					position: 'top',
					id: 'x-axis-0',
					gridLines: {
						display: true,
						lineWidth: .5
					},
					ticks: {
						beginAtZero: true,
						fontSize: 9,
						userCallback: function (value, index, values) {
							 if(parseInt((value)) >= 1000 || parseInt((value)) <= 1000){
                				return (toMoney(value/1000).toString()+'K');
              					} else {
                				return toMoney(value).toString();
              					}
						}
					}
				}]
			}
		}
	}));

	// Cannibalization
	var maxCannibIndex = cannibalizationData.indexOf(Math.max(...cannibalizationData));

	var bgcolor = Array(7).fill('rgba(64, 64, 64, 0.4)'),
		bordercolor = Array(7).fill('rgba(64, 64, 64, 0.9)');

	bgcolor[maxCannibIndex] = 'rgba(219, 64, 64, 0.4)';
	bordercolor[maxCannibIndex] = 'rgba(219, 64, 64, 0.9)';

	context.charts2.push(new Chart(document.getElementById('vertical-bar-1-ss'), {
		type: 'horizontalBar',
		data: {
			labels: cannibalizationLabels,
			datasets: [{
				label: 'Cannibalization',
				data: cannibalizationData,
				backgroundColor: bgcolor,
				borderColor: bordercolor,
				borderWidth: 1
			}]
		},
		options: {
			title: {
				display: true,
				text: ' Site Cannibalization (' + toMoney(totalCannibalization) + ')'
			},
			scales: {
				xAxes: [{
					id: 'y-axis-0',
					gridLines: {
						display: true,
						lineWidth: 1,
						color: 'rgba(0,0,0,0.05)'
					},
					ticks: {
						beginAtZero: true,
						mirror: false,
						suggestedMin: 0,
						userCallback: function(value, index, values) {
							return toMoney(value);
						}
					}
				}],
				yAxes: [{
					id: 'x-axis-0',
					gridLines: {
						display: false
					},
					ticks: {
						beginAtZero: true
					}
				}]
			},
			responsive: true
		}
	}));

	// Indexed Key Demography
	context.charts2.push(new Chart(document.getElementById('vertical-bar-2-ss'), {
		type: 'hBarWithLine',
		data: {
			labels: demographyLabels,
			datasets: [{
				label: 'Indexed Key Demography',
				data: demogData,
				backgroundColor: 'rgba(170, 102, 68, 0.4)',
				borderColor: 'rgba(170, 102, 68, 0.9)',
				borderWidth: 1
			}]
		},
		lineAt: 100,
		options: {
			pointLabelFontSize: 20,
			title: {
				display: true,
				text: 'Indexed Key Demography'
			},
			scales: {
				xAxes: [{
					id: 'y-axis-0',
					gridLines: {
						display: true,
						lineWidth: 1,
						color: 'rgba(0,0,0,0.05)'
					},
					ticks: {
						beginAtZero: true,
						mirror: false,
						suggestedMin: 0,
						userCallback: function(value, index, values) {
							return value;
						}
					}
				}],
				yAxes: [{
					id: 'x-axis-0',
					gridLines: {
						display: false
					},
					ticks: {
						beginAtZero: true
					}
				}]
			},
			responsive: true
		}
	}));

	// Predicted Ingredient Distribution
	context.charts2.push(new Chart(document.getElementById('radar1-ss'), {
		type: 'radar',
		data: radarData,
		options: {
			legend: {
				display: false,
				position: 'top'
			},
			title: {
				display: true,
				text: 'Predicted Distribution'
			},
			scale: {
				reverse: false,
				gridLines: {
					color: [
						'rgba(219, 64, 64, 0.2)', 'rgba(219, 64, 64, 0.8)',
						'rgba(91, 155, 213, 0.2)', 'rgba(91, 155, 213, 0.8)',
						'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.8)'
					]
				},
				ticks: {
					beginAtZero: true,
					userCallback: function(value, index, values) {
						return value + '%';
					},
					min: 0,
					max: 30,
					stepSize: 5
				}
			}
		},
		responsive: true
	}));

	context.charts2.push(new Chart(document.getElementById('pie1-ss'), {
		type: 'pie',
		data: pieData,
		options: {
			title: {
				display: true,
				text: 'Incremental Marketing Allocation'
			},
			legend: {
				position: 'right',
				display: 'true'
			}
		}
	}));

	Plotly.d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/2014_us_cities.csv', function(err, rows) {
		if (err) console.log(err);

		function unpack(rows, key) {
			return rows.map(row => row[key]);
		}

		var cityName = unpack(rows, 'name'),
			cityPop = unpack(rows, 'pop'),
			cityLat = unpack(rows, 'lat'),
			cityLon = unpack(rows, 'lon'),
			citySize = [],
			hoverText = [],
			scale = 50000;

		for (var i = 0; i < cityPop.length; i++) {
			var currentSize = cityPop[i] / scale;
			var currentText = cityName[i] + ' pop: ' + cityPop[i];
			citySize.push(currentSize);
			hoverText.push(currentText);
		}

		var data = [{
			type: 'scattergeo',
			locationmode: 'USA-states',
			lat: cityLat,
			lon: cityLon,
			hoverinfo: 'text',
			text: hoverText,
			marker: {
				size: citySize,
				line: {
					color: 'black',
					width: 2
				}
			}
		}];

		var layout = {
			title: 'City Populations',
			showlegend: false,
			geo: {
				scope: 'usa',
				projection: {
					type: 'albers usa'
				},
				showland: true,
				landcolor: 'rgb(217, 217, 217)',
				subunitwidth: 1,
				countrywidth: 1,
				subunitcolor: 'rgb(255,255,255)',
				countrycolor: 'rgb(255,255,255)'
			}
		};

		Plotly.purge('mapDiv-ss');
		Plotly.newPlot('mapDiv-ss', data, layout, {
			showLink: false
		});
	});

	var trace1 = {
		x: x1,
		y: y1,
		name: 'Distribution',
		type: 'scatter'
	};

	var trace2 = {
		x: x2,
		y: y2,
		fill: 'tozeroy',
		name: 'Lowest Percentage',
		type: 'scatter'
	};

	var layout = {
		title: 'New Store Sales Distribution<br>($ Millions)',
		showlegend: false,
		yaxis: {
			showticklabels: false,
			showgrid: false
		},
		xaxis: {
			autorange: true
		},
		margin: {
			l: 0,
			r: 0,
			b: 0,
			t: 35,
			pad: 10
		}
	};

	var data = [trace1, trace2];
	Plotly.newPlot('plotly-div-ss', data, layout);

	/* Gauge */

	// Trig to calculate meter point
	var degrees = 180 - gaugeLevel,
		radius = 0.5;
	var radians = degrees * Math.PI / 180;
	var x = radius * Math.cos(radians);
	var y = radius * Math.sin(radians);

	// Path: may have to change to create a better triangle
	var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
		pathX = String(x),
		space = ' ',
		pathY = String(y),
		pathEnd = ' Z',
		path = mainPath.concat(pathX, space, pathY, pathEnd);

	var data2 = [{
		type: 'scatter',
		x: [0],
		y: [0],
		marker: {
			size: 28,
			color: '850000'
		},
		showlegend: false,
		name: 'Performance Index',
		text: gaugeLevel,
		hoverinfo: 'text+name'
	}, {
		values: [50 / 6, 50 / 6, 50 / 6, 50 / 6, 50 / 6, 50 / 6, 50],
		rotation: 90,
		text: [
			'Ideal', 'Excellent', 'Good',
			'Average', 'Poor', 'Very Poor'
		],
		textinfo: 'text',
		textposition: 'inside',
		marker: {
			colors: [
				'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
				'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
				'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
				'rgba(255, 255, 255, 0)'
			]
		},
		labels: ['151-200', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
		hoverinfo: 'label',
		hole: 0.5,
		type: 'pie',
		showlegend: false
	}];

	var layout2 = {
		shapes: [{
			type: 'path',
			path: path,
			fillcolor: '850000',
			line: {
				color: '850000'
			}
		}],
		title: '<b>Expected Performance</b>',
		xaxis: {
			zeroline: false,
			showticklabels: false,
			showgrid: false,
			range: [-1, 1],
			fixedrange: true
		},
		yaxis: {
			zeroline: false,
			showticklabels: false,
			showgrid: false,
			range: [-1, 1],
			fixedrange: true
		},
		margin: {
			l: 0,
			r: 0,
			b: 0,
			t: 35,
			pad: 10
		}
	};

	Plotly.newPlot('gaugeDiv-ss', data2, layout2);
}
