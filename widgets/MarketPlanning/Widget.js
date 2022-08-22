'use strict';

define([
	'dojo/query', 'dojo/on',
	'dojo/_base/declare', 'jimu/BaseWidget',
	'esri/dijit/Search', 'esri/symbols/PictureMarkerSymbol', 'esri/tasks/locator',
	'dojo/i18n!esri/nls/jsapi', 'esri/layers/GraphicsLayer',
	'esri/toolbars/draw', 'esri/graphic', 'esri/geometry/webMercatorUtils',
	'esri/IdentityManager', 'jimu/PanelManager',
	'dojo/_base/lang', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/dom-style',
	'dojo/parser', 'dijit/form/TextBox', 'dijit/form/Select', 'dijit/Tooltip', 'dijit/form/CheckBox',
	'dijit/form/NumberTextBox', 'dijit/form/MultiSelect',
	'dojo/_base/window', 'dijit/Dialog', 'dijit/registry',
	'https://cdn.plot.ly/plotly-latest.min.js',
	'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.2.1/Chart.min.js',
	'https://cdnjs.cloudflare.com/ajax/libs/1000hz-bootstrap-validator/0.11.8/validator.min.js',
	'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/symbols/SimpleFillSymbol',
	'esri/tasks/query',
	'esri/layers/FeatureLayer',
	'libs/dojo-bootstrap/Dropdown',
	'libs/dojo-bootstrap/Tab',
	'libs/dojo-bootstrap/Modal',
	'libs/dojo-bootstrap/Collapse',
	'libs/dojo-bootstrap/Tooltip',
	'./Utilities'
], function (
	query, on,
	declare, BaseWidget,
	Search, PictureMarkerSymbol, Locator,
	esriBundle, GraphicsLayer,
	Draw, Graphic, webMercatorUtils,
	esriId, PanelManager,
	lang, domConstruct, domClass, domStyle,
	parser, TextBox, Select, Tooltip, CheckBox,
	NumberTextBox, MultiSelect, win, Dialog, registry,
	Plotly, Chart,
	Validator,
	SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol,
	Query,
	FeatureLayer,
	Dropdown,
	Tab,
	Modal,
	Collapse,
	bootstrapTooltip,
	Utilities
) {
	return declare([BaseWidget], {
		baseClass: 'jimu-widget-marketPlanning',
		name: 'Market Planning',
		layerResult: null,
		drawingPolygon: false,
		drawingPoint: false,
		pinDropped: false,
		currentSiteSelected: false,
		currentSite: null,

		onClose: function () {
			this.scratchGraphicsLayer.clear();
			this.drawToolbar.deactivate();
			this.pinDropped = false;
			this.currentSiteSelected = false;
		},

		toDefaultSize: function () {
			this.getPanel().setPosition({
				left: 50,
				top: 50,
				right: 0,
				bottom: 30,
				width: window.innerWidth * 0.55,
				height: window.innerHeight * 0.75
			});
		},

		toLargeSize: function () {
			this.getPanel().setPosition({
				left: 50,
				top: 50,
				right: 0,
				bottom: 30,
				width: window.innerWidth * 0.75,
				height: window.innerHeight * 0.75
			});
		},

		onOpen: function(){
			this.toDefaultSize();
		},

		postCreate: function () {
			this.charts1 = [], this.charts2 = [];

			this.toDefaultSize();

			Chart.defaults.global.responsive = true;
			Chart.defaults.global.legend.display = false;
			Chart.defaults.global.maintainAspectRatio = false;
			Chart.defaults.global.title.fontColor = 'black';
			Chart.defaults.global.title.fontStyle = 'bold';
			Chart.defaults.global.title.fontSize = 14;

			let icon = {
				"iconAddPoint": "widgets/MarketPlanning/images/pin.png",
				"width": 32,
				"height": 32
			};

			this.picSearch = new PictureMarkerSymbol(
				icon.iconAddPoint,
				icon.width,
				icon.height)
				.setOffset(0, 16);

			this.scratchGraphicsLayer = new GraphicsLayer({
				id: 'mp_graphicSearch'
			});
			this.map.addLayer(this.scratchGraphicsLayer);

			// Search bar for geocoding
			let s = new Search({
				map: this.map,
				enableHighlight: false,
				enableSourcesMenu: false,
				sources: [{
					locator: new Locator(this.config.urlLocator),
					singleLineFieldName: 'SingleLine',
					outFields: ['Addr_type'],
					name: esriBundle.widgets.Search.main.esriLocatorName,
					localSearchOptions: {
						minScale: 300000,
						distance: 50000
					},
					placeholder: esriBundle.widgets.Search.main.placeholder,
					highlightSymbol: this.picSearch
				}],
				addLayersFromMap: true
			}, this.txtGeocoder);
			s.startup();
			s.on('select-result', lang.hitch(this, 'processSearch'));

			// Handle drawing
			this.drawToolbar = new Draw(this.map, {
				tooltipOffset: 20,
				drawTime: 90
			});
			this.drawToolbar.on('draw-end', lang.hitch(this, '_drawEnd'));

			// Handle selection of features
			this.selectQuery = new Query();
			this.featureLayer = this.map.getLayer(this.config.idQueryLayer);

			let context = this;
			//debugger;
			this.featureLayer.on('selection-complete', function (event) {
				if (event.features.length < 1) {
					alert('No features were selected.');
				} else {
					let t = 200;
					context.currentSite = event.features[0].attributes;
					// Needed to match multiple instances with duplicate IDs
					$('span[id="current_site"]')
						.fadeOut(t, function () {
							$(this)
								.html('Site ' + context.currentSite.id + ' with sales of ' + toMoney(context.currentSite.lat*25000) + '.')
								.fadeIn(t);
						});
					context.currentSiteSelected = true;
				}
			});

			// Highlight selected features
			let line = new SimpleLineSymbol()
				.setColor(new dojo.Color([0, 92, 230, 0.6]));

			let marker = new SimpleMarkerSymbol()
				.setSize(19)
				.setOutline(line)
				.setStyle(SimpleMarkerSymbol.STYLE_SQUARE);

			this.featureLayer.setSelectionSymbol(marker);
		},

		// Hook into resize function to inform Charts.js and Plotly
		resize: function () {
			this.resizeCharts();
		},

		dropdownClick: function () {
			alert('Sorry, this functionality is not available in the demo.');
		},

		_onDrawPointClick: function () {
			$('html,body,#map_container').css('cursor', 'url("widgets/MarketPlanning/images/pin.png") 16 32, default');
			$('#_9_panel').css({opacity: 0.15, 'pointer-events': 'none'});
			this.drawToolbar.activate(Draw.POINT);
			this.drawingPoint = true;
		},

		_onDrawPolygonClick: function () {
			$('html,body,#map_container').css('cursor', 'crosshair');
			$('#_9_panel').css({opacity: 0.15, 'pointer-events': 'none'});
			this.drawToolbar.activate(Draw.FREEHAND_POLYGON);
			this.drawingPolygon = true;
		},

		_drawEnd: function (evt) {
			$('html,body,#map_container').css('cursor', 'auto');
			$('#_9_panel').css({opacity: 1, 'pointer-events': 'auto'});

			this.drawToolbar.deactivate();

			if (this.drawingPolygon) {
				if (this.polygonGraphic) {
					this.scratchGraphicsLayer.remove(this.polygonGraphic);
				}
				let symbol = new SimpleFillSymbol();
				this.polygonGraphic = new Graphic(evt.geometry, symbol);
				this.scratchGraphicsLayer.add(this.polygonGraphic);
				this.selectQuery.geometry = evt.geometry;
				this.featureLayer.selectFeatures(this.selectQuery, FeatureLayer.SELECTION_NEW);
				this.drawingPolygon = false;
				this.currentSiteSelected = true;
			} else if (this.drawingPoint) {
				if (this.pointGraphic) {
					this.scratchGraphicsLayer.remove(this.pointGraphic);
				}
				this.pointGraphic = new Graphic(evt.geometry, this.picSearch);
				this.scratchGraphicsLayer.add(this.pointGraphic);
				this.drawingPoint = false;
				this.pinDropped = true;
			}
		},

		processSearch: function (e) {
			let graphic = new Graphic(e.result.feature.geometry, this.picSearch);
			this.scratchGraphicsLayer.add(graphic);
		},

		_selectResult: function(e) {
			this.markPoint(e.result.feature)
		},


		/*_searchLayer: function () {
			for (let i = 0; i < this.map.graphicsLayerIds.length; i++) {
				if (this.map.graphicsLayerIds[i].toUpperCase().indexOf(this.config.idLayer.toUpperCase()) >= 0) {
					let layer = this.map.getLayer(this.map.graphicsLayerIds[i]);
					this.layerResult = layer;
					break;
				}
			}
		},

		_saveResult: function (gra, attr) {
			gra.attributes = attr;
			if (!this.layerResult) {
				this._searchLayer();
			}
			this.layerResult.applyEdits([gra], null, null, function (e) {
				console.log(e);
			}, function (e) {
				console.log(e);
			});
		},*/

		_parseForm: function (context, e) {
			let formID = e.target.id;
			// Because errors short-circuit the "return false"
			// and attempt to submit the form.
			try {
				if (e.isDefaultPrevented()) {
					throw 'Not all form fields have been filled out.';
				} else {
					let location, currentSite, data = {};
					$('#' + formID).serializeArray()
						.map((o) => {
							data[o.name] = o.value;
						});

					switch (formID) {
					case 'tab1Form':
						if (!context.pinDropped) {
							throw 'Please select the new relocation site.';
						}
						if (!context.currentSiteSelected) {
							throw 'Please select the current site.';
						}
						location = context._getGeoData();
						currentSite = context.currentSite;
						$.extend(data, location);
						break;
					case 'tab2Form':
						if (!context.pinDropped) {
							throw 'Please select the new site.';
						}
						location = context._getGeoData();
						$.extend(data, location);
						break;
					case 'tab3Form':
						if (!context.currentSiteSelected) {
							throw 'Please select the current site';
						}
						currentSite = context.currentSite;
						break;
					}
					context._callAPI(data, formID);
				}
			} catch (err) {
				alert(err);
			} finally {
				return false;
			}
		},

		startup: function () {
			query('[data-toggle="tooltip"]').tooltip();

			$('.needsValidation').validator();
			// Since "this" in parseForm refers to the form's DOM node
			let newFn = this._parseForm.bind(null, this);
			$('.needsValidation').validator().on('submit', newFn);
			let context = this;
			$('a[data-toggle=tab]').click(function () {
				context.toDefaultSize();
				setTimeout(function () {
					context.resizeCharts();
				}, 300);
			});

			this._getToken();
		},

		_getGeoData: function () {
			if (!this.pointGraphic) {
				return {};
			}
			let geo = webMercatorUtils.webMercatorToGeographic(this.pointGraphic.geometry);
			return {
				longitude: geo.x.toString(),
				latitude: geo.y.toString()
			};
		},

		_onBack: function (evt) {
			let formName, inputContainer, outputContainer;
			switch (evt.target.id) {
			case 'backForm1':
				formName = tab1Form;
				inputContainer = inputForm1;
				outputContainer = outputForm1;
				break;
			case 'backForm2':
				formName = tab2Form;
				inputContainer = inputForm2;
				outputContainer = outputForm2;
				break;
			case 'backForm3':
				formName = tab3Form;
				inputContainer = inputForm3;
				outputContainer = outputForm3;
				break;
			}

			$(outputContainer).fadeOut();
			$(inputContainer).fadeIn();
			$(formName)[0].reset();
			$(formName).validator('validate');

			this.toDefaultSize();

			$('#dijit__WidgetBase_6').scrollTop(0);
		},

		_handleResponse: function (resp, context, inputData, formID) {
			let estimate = resp.estimate[0], prior, delta;

			let gsf = inputData.gross_sq_ft, nos = inputData.number_of_seats;

			delete inputData.gross_sq_ft;
			delete inputData.number_of_seats;
			delete inputData.latitude;
			delete inputData.longitude;
			delete inputData.apikey;

			let fuzz = (x, p) => randomWindow(x, p);
			let f = (x) => 60000 - (Number(x) * 10000);
			let c = Object.values(inputData).map(f).reduce((a, b) => a + b, 0);

			context.toLargeSize();

			switch (formID) {
			case 'tab1Form':
				estimate = fuzz(context.currentSite.lat, 0.25) + gsf * 500 + nos * 10000 + c;
				resp.estimate = estimate;
				resp.analogs = [...new Array(2)]
					.map(a => randomBetter(estimate, 0.25))
					.concat([...new Array(4)]
						.map(a => randomWorse(estimate, 0.25))
					);

				buildCharts1(Plotly, resp, context);

				prior = context.currentSite.lat*25000;
				delta = estimate - prior;

				$('#salesEstimate1').html(toMoney(estimate));
				$('#priorSales1').html(toMoney(prior));

				if (delta < 0) {
					$('#salesImpact1').html('(' + toMoney(Math.abs(delta)) + ')')
						.css('color', 'red');
				} else {
					$('#salesImpact1').html(toMoney(Math.abs(delta)))
						.css('color', 'green');
				}

				$('#inputForm1').fadeOut();
				$('#outputForm1').fadeIn();
				context.resizeCharts();
				break;

			case 'tab2Form':
				estimate = fuzz(1000000, 0.10) + (gsf * 500) + (nos * 10000) + c;
				resp.estimate = estimate;
				resp.analogs = [
					...[...new Array(2)].map(a => randomBetter(estimate, 0.25)),
					...[...new Array(4)].map(a => randomWorse(estimate, 0.25))
				];

				buildSiteSelectionCharts(Plotly, resp, context);
				$('#salesEstimate2').html(toMoney(estimate));
				$('#salesImpact2').html(toMoney(Math.abs(estimate)))
					.css('color', (estimate < 1000000 ? 'red' : 'green'));

				$('#inputForm2').fadeOut();
				$('#outputForm2').fadeIn();
				context.resizeCharts();
				break;

			case 'tab3Form':
				estimate = fuzz(context.currentSite.lat, 0.10) + gsf * 500 + c;

				prior = context.currentSite.lat;
				delta = estimate - prior;
				$('#salesEstimate3').html(toMoney(estimate));
				if (delta < 0) {
					$('#salesImpact3').html('(' + toMoney(Math.abs(delta)) + ')')
						.css('color', 'red');
				} else {
					$('#salesImpact3').html(toMoney(Math.abs(delta)))
						.css('color', 'green');
				}

				// Left Side
				$('#currentSales3').html(toMoney(context.currentSite.Sales));
				$('#centerConditionOutput').html(inputData.center_condition);
				$('#entranceScoreOutput').html(inputData.entrance_score);

				// Right Side
				$('#newSales3').html(toMoney(estimate));
				$('#centerConditionOutput2').html(getRandomInt(1, 5));
				$('#entranceScoreOutput2').html(getRandomInt(1, 5));

				$('#inputForm3').fadeOut();
				$('#outputForm3').fadeIn();
				break;
			}
		},

		_callAPI: function (data, formID) {
			let context = this;
			data.apikey = this.config.apikey;

			query('#myModal').modal('show');

			$.ajax({
				url: this.config.urlService,
				type: 'POST',
				data: data,
				inputData: data,
				formID: formID,
				success: function (resp) {
					context._handleResponse(resp, context, this.inputData, this.formID);
				},
				error: function (xhr) {
					let errMsg = xhr.responseJSON ?
						xhr.responseJSON.msg ?
							xhr.responseJSON.msg[0] : xhr.statusText
						: 'Unknown';
					new Dialog({
						title: context.nls.titleErrorCall,
						content: errMsg
					}).show();
				},
				complete: function () {
					query('#myModal').modal('hide');
				}
			});
		},

		resizeCharts: function () {
			this.charts1.map(o => o.resize());
			this.charts2.map(o => o.resize());

			Plotly.Plots.resize(Plotly.d3.select('div[id="mapDiv"]').node());
			Plotly.Plots.resize(Plotly.d3.select('div[id="plotly-div"]').node());
			Plotly.Plots.resize(Plotly.d3.select('div[id="gaugeDiv"]').node());

			Plotly.Plots.resize(Plotly.d3.select('div[id="mapDiv-ss"]').node());
			Plotly.Plots.resize(Plotly.d3.select('div[id="plotly-div-ss"]').node());
			Plotly.Plots.resize(Plotly.d3.select('div[id="gaugeDiv-ss"]').node());
		},

		_getToken: function () {
			let context = this,
				esriAuthData = {
					f: 'json',
					client_id: this.config.credentials.client_id,
					client_secret: this.config.credentials.client_secret,
					grant_type: this.config.credentials.grant_type,
					expiration: this.config.credentials.expiration
				};

			$.ajax({
				url: this.config.credentials.url,
				type: 'POST',
				dataType: 'json',
				async: true,
				data: esriAuthData,
				success: function (data) {
					context.tokenEsri = data.access_token;
				},
				error: function () {
					console.log('Esri token generation failed within Marketplanning widget.');
				}
			});
		}

	});
});
