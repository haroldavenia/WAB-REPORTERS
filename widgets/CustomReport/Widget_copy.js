define([
    'dojo/_base/declare',
    'jimu/BaseWidget',
    "esri/dijit/Search",
    "esri/symbols/PictureMarkerSymbol",
    "esri/tasks/locator",
    "dojo/i18n!esri/nls/jsapi",
    "esri/layers/GraphicsLayer",
    "esri/toolbars/draw",
    "esri/graphic",
    "esri/geometry/webMercatorUtils",
    "esri/IdentityManager",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/query",
    "dojo/parser",
    "dijit/form/TextBox",
    "dijit/form/Select",
    "dijit/Tooltip",
    "dijit/form/CheckBox",
    "dijit/form/NumberTextBox",
    "dijit/form/MultiSelect",
    "dojo/_base/window",
    "dijit/Dialog",
    "dijit/registry"
],
    function(declare, BaseWidget, Search, PictureMarkerSymbol, Locator, esriBundle, GraphicsLayer, Draw, Graphic, webMercatorUtils, esriId, lang, dom, domConstruct, domClass, domStyle, query, parser, TextBox, Select, Tooltip, CheckBox, NumberTextBox, MultiSelect, win, Dialog, registry) {

        //To create a widget, you need to derive from BaseWidget.
        return declare([BaseWidget], {
            // Custom widget code goes here

            baseClass: '_onPlayBtnClicked',
            isClick: false,
            layerResult: null,
            //this property is set by the framework when widget is loaded.
            //name: 'CustomWidget',


            //methods to communication with app container:
    
            onClose: function(){
                this.lgisGraphicLayerSearch.clear();
			    this.drawToolbar.deactivate();
            },

            postCreate: function() {
                this.inherited(arguments);

                let icon = {
                    "iconAddPoint": "widgets/CustomReport/images/pin.png",
                    "width": 32,
                    "height": 32,
                    "XOffSet": 0,
                    "YOffSet": 16
                };

                //Create markersymbol for de serach dijit
                this.picSearch = new PictureMarkerSymbol(icon.iconAddPoint, icon.width, icon.height).setOffset(icon.XOffSet, icon.YOffSet);
                //Create graphic layer search
                this.lgisGraphicLayerSearch = new GraphicsLayer({
                    id: "cr_graphicSearch"
                });
                this.map.addLayer(this.lgisGraphicLayerSearch);
                this.lgisGraphicLayerSearch.on("click", lang.hitch(this, '_clickGraphicLayerSearch'));

                //Create dijit search
                var s = new Search({
                    map: this.map,
                    enableHighlight: false,
                    enableSourcesMenu: false,
                    sources: [{
                        locator: new Locator(this.config.urlLocator),
                        singleLineFieldName: "SingleLine",
                        outFields: ["Addr_type"],
                        name: esriBundle.widgets.Search.main.esriLocatorName,
                        localSearchOptions: {
                            minScale: 300000,
                            distance: 50000
                        },
                        placeholder: esriBundle.widgets.Search.main.placeholder,
                        highlightSymbol: this.picSearch,
                    }],
                    addLayersFromMap: true,
                }, this.txtGeocoder);
                s.startup();
                s.on('select-result', lang.hitch(this, '_selectResult'));


                //Create toolbar for insert points
                this.drawToolbar = new Draw(this.map, {
                    tooltipOffset: 20,
                    drawTime: 90
                });
                this.drawToolbar.on("draw-end", lang.hitch(this, '_drawEnd'));
                esriBundle.toolbars.draw.addPoint = this.nls.popupAddLocation;

                var contendor = domConstruct.create("div", null, this.containerCheckLayer);
                domClass.add(contendor, "margin-check");
                var checkBox = new CheckBox({
                    name: "checkLayer",
                    checked: this.config.visibleLayer,
                    onChange: lang.hitch(this, "_showHideLayer")
                });
                //domConstruct.place(contendor, rowDom);
                domConstruct.place(checkBox.domNode, contendor);
                domConstruct.create("label", {
                    innerHTML: this.nls.titleCheckLayer
                }, contendor);

                this._renderDynamicRow();
            },
            _showHideLayer: function(b) {
                if (!this.layerResult) {
                    this._searchLayer();
                }
                if (b === true) {
                    this.layerResult.setVisibility(true);
                } else {
                    this.layerResult.setVisibility(false);
                }
            },
            _searchLayer: function() {
                
                for (var i = 0; i < this.map.graphicsLayerIds.length; i++) {
                    if (this.map.graphicsLayerIds[i].toUpperCase().indexOf(this.config.idLayer.toUpperCase()) >= 0) {
                        var layer = this.map.getLayer(this.map.graphicsLayerIds[i]);
                        this.layerResult = layer;
                        break;
                    }
                }
            },
            _saveResult: function(gra, attr) {
                
                gra.attributes = attr;
                /*gra.attributes.ValueInt1=null;
        gra.attributes.ValueStr2=result.toString();
        gra.attributes.ValueStr1=result.toString();
        gra.attributes.Date=null;*/
                if (!this.layerResult) {
                    this._searchLayer();
                }
                this.layerResult.applyEdits([gra], null, null, function(e) {
                    console.log(e)
                    
                }, function(e) {
                    console.log(e)
                    
                });
            },
            startup: function() {
                var map = this.map;
                //get token
                this._getToken();
            },

            // onOpen: function(){
            //   console.log('onOpen');
            // },

            // onMinimize: function(){
            //   console.log('onMinimize');
            // },

            // onMaximize: function(){
            //   console.log('onMaximize');
            // },

            // onSignIn: function(credential){
            //   /* jshint unused:false*/
            //   console.log('onSignIn');
            // },

            // onSignOut: function(){
            //   console.log('onSignOut');
            // }

            // onPositionChange: function(){
            //   console.log('onPositionChange');
            // },

            // resize: function(){
            //   console.log('resize');
            // }
            _renderDynamicRow: function() {
                this.config.configFields.rows.forEach(lang.hitch(this, function(row){
                    //Create row
                    var rowDom = domConstruct.create("div", null, this.dynamicRow);
                    domClass.add(rowDom, "jimu-r-row");
                    domClass.add(rowDom, "margin-top");

                    row.forEach(lang.hitch(this, function(element, j){
                        var elementNode;
                        switch (element.type.toUpperCase()) {
                            case "TEXT":
                                elementNode = this._createTextBox(rowDom, element, row.length, j);
                                break;
                            case "COMBO":
                                elementNode = this._createSelect(rowDom, element, row.length, j);
                                break;
                            case "NUMBER":
                                elementNode = this._createNumber(rowDom, element, row.length, j);
                                break;
                            case "CHECK":
                                elementNode = this._createCheck(rowDom, element, row.length, j);
                                break;
                            case "LIST":
                                elementNode = this._createList(rowDom, element, row.length, j);
                                break;
                        }

                        if (element.visible === false) {
                            domClass.add(rowDom, "hidden");
                        }
                        //Insert element in dom
                        this._positionElement(rowDom, row.length, j, elementNode, element);

                        //check if help
                        if (element.help) {
                            let helpId = registry.getUniqueId("helpcontent");
                            var help = domConstruct.create("span", {id: helpId});
                            domStyle.set(help, {
                                "margin-top": "5px",
                            });
                            domClass.add(help, "esriFloatTrailing");
                            domClass.add(help, "helpIcon");

                            domConstruct.place(help, rowDom, "first");
                            
                            new Tooltip({
                                connectId: [helpId],
                                label: element.help
                            });
                        }
                        if (element.subCheck) {
                            var contendor = domConstruct.create("div", null, rowDom);
                            domClass.add(contendor, "margin-check");

                            var checkBox = new CheckBox({
                                name: element.subCheck.id,
                                checked: element.subCheck.defaultValue,
                            });
                            domConstruct.place(contendor, rowDom);
                            domConstruct.place(checkBox.domNode, contendor);
                            domConstruct.create("label", {
                                innerHTML: element.subCheck.text
                            }, contendor);
                        }
                    }))
                }));
            },
            _createTextBox: function(rowDom, element, totalElements, indexActualElement) {
                var myTextBox = new dijit.form.TextBox({
                    name: element.id,
                    value: (element.defaultValue) ? element.defaultValue : "",
                    placeHolder: (element.placeHolder) ? this.nls[element.placeHolder] : ""
                });
                return myTextBox;
            },
            _createNumber: function(rowDom, element, totalElements, indexActualElement) {
                var myNumericBox = new NumberTextBox({
                    name: element.id,
                    value: (element.defaultValue) ? element.defaultValue : "",
                    placeHolder: (element.placeHolder) ? this.nls[element.placeHolder] : ""
                });
                if (element.defaultValue) {
                    $(myNumericBox.domNode).find("input").attr("value", element.defaultValue);
                }
                return myNumericBox;
            },
            _createSelect: function(rowDom, element, totalElements, indexActualElement) {
                var mySelect = new Select({
                    name: element.id,
                    options: element.values
                });

                for (var i = 0; i < element.values.length; i++) {
                    if (element.values[i].selected) {
                        mySelect.setValue(element.values[i].value);
                        break;
                    }
                }
                return mySelect;
            },
            _createCheck: function(rowDom, element, totalElements, indexActualElement) {
                var contendor = domConstruct.create("div", null, rowDom);
                var myCheckBox = new CheckBox({
                    name: element.id,
                    checked: (element.defaultValue) ? element.defaultValue : 0,
                });
                domConstruct.place(contendor, rowDom);
                domConstruct.place(myCheckBox.domNode, contendor);
                domConstruct.create("label", {
                    innerHTML: this.nls[element.text]
                }, contendor);
                domClass.add(contendor, "padding-top");
                domClass.add(contendor, "width-check");
                contendor = {
                    domNode: contendor
                };
                return contendor;
            },
            _createList: function(rowDom, element, totalElements, indexActualElement) {
                var sel = domConstruct.create("select", null, rowDom);
                for (var i = 0; i < element.values.length; i++) {
                    var c = win.doc.createElement('option');
                    c.innerHTML = element.values[i].label;
                    c.value = element.values[i].value;
                    sel.appendChild(c);
                }
                var myMultiSelect = new MultiSelect({
                    name: element.id
                }, sel);
                for (var i = 0; i < element.values.length; i++) {
                    if (element.values[i].selected) {
                        myMultiSelect.setValue(element.values[i].value);
                        break;
                    }
                }

                return myMultiSelect;
            },
            _positionElement: function(rowDom, totalElements, indexActualElement, elementNode, element) {
                if (totalElements == 1) {
                    domClass.add(elementNode.domNode, "jimu-r-row");
                } else if (totalElements == 2) {
                    if (indexActualElement == 0) {
                        domStyle.set(elementNode.domNode, {
                            "float": "left",
                        });
                    } else {
                        domStyle.set(elementNode.domNode, {
                            "float": "right",
                        });
                    }
                    domStyle.set(elementNode.domNode, {
                        width: "49%",
                    });
                }

                if (element.title) {
                    var title = domConstruct.create("p", {
                        innerHTML: element.title
                    }, rowDom);
                    
                    domStyle.set(title, {
                        "line-height": "30px",
                    });
                }
                dom.byId(rowDom).appendChild(elementNode.domNode);
            },
            _onPlayBtnClicked: function() {
                $('html,body,#map_container').css('cursor', 'url("widgets/MarketPlanning/images/pin.png") 16 32, default');
			    $('#_9_panel').css({opacity: 0.15, 'pointer-events': 'none'});
                this.drawToolbar.activate(Draw.POINT);
            },
            _drawEnd: function(evt) {
                $('html,body,#map_container').css('cursor', 'auto');
			    $('#_9_panel').css({opacity: 1, 'pointer-events': 'auto'});
                //clear layer always, only one point
                this.lgisGraphicLayerSearch.clear();
                this.drawToolbar.deactivate();

                if (!this.isClick) {
                    var graphic = new Graphic(evt.geometry, this.picSearch);
                    this.lgisGraphicLayerSearch.add(graphic);
                }
                this.isClick = false;
                this.lgisGraphicToInsert = new Graphic(evt.geometry);
            },
            _selectResult: function(e) {
                var graphic = new Graphic(e.result.feature.geometry, this.picSearch);
                this.lgisGraphicLayerSearch.add(graphic);
            },
            _onDeleteBtnClicked: function() {
                this.lgisGraphicLayerSearch.clear();
            },
            _clickGraphicLayerSearch: function(e) {
                this.lgisGraphicLayerSearch.remove(e.graphic);
                this.isClick = true;
            },
            _callServiceR: function(e) {
                if (this._requiredFieldsCheck()) {
                    if (this.tokenEsri) {
                        var data = this._getDataForInputs(this.tokenEsri);
                        var dataGIS = this._getDataForGIS(this.tokenEsri);
                        
                        // Call AzureML
                        console.log(JSON.stringify(data));
                        $.ajax({
                            url: this.config.urlService,
                            type: 'POST',
                            data: data
                        }).then(
                            (function success(resp) {
                                

                                function format(s) {
                                  return parseInt(s).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                }

                                function nextChar(c) {
                                    return String.fromCharCode(c.charCodeAt(0) + 1);
                                }

                                domClass.add(this.calculated, "hidden");
                                domClass.remove(this.panelResult, "hidden");

                                var letter  = 'A',
                                    output  = resp["estimate"][0],
                                    analogs = resp["analogs"];
                                    
                                $(this.populationResult).text(this.nls.msgSuccess + format(output));
                                $(".tableMak").find("tr:not(.cabeceraColum)").remove();

                                for (var i = 0; i < 5 ; i++) {

                                    var j = (i+1).toString(),

                                    sname = "Store" + letter,
                                    idnum = "ID00" + j,
                                    cannib = analogs[i];

                                    $(this.tableAnalog).append(
                                        "<tr><td>"  + sname + "</td>" +
                                        "<td>"      + idnum + "</td>" +
                                        "<td style='text-align: right;'>$" + format(cannib) + "</td></tr>"
                                    );

                                    letter = nextChar(letter);

                                    dataGIS["A_Name_"     + j] = sname;
                                    dataGIS["A_ID_"       + j] = idnum;
                                    dataGIS["A_Cannib_"   + j] = cannib;

                                }

                                dataGIS["BK_Site_Name"] = dataGIS["Name"];
                                dataGIS["BK_Sales"]     = output;
                                dataGIS["Lat"]          = dataGIS["Latitude"];
                                dataGIS["Long"]         = dataGIS["Longitude"];
                                dataGIS["BK_Cannib"]    = analogs.reduce(function(x,y) {return x+y;}, 0);

                                this._saveResult(this.lgisGraphicToInsert, dataGIS);

                            }).bind(this), (function fail(data, status) {
                                
                                var resp = JSON.parse(data.responseText).message[0];
                                //var returnCode = r[0], returnMsg = r[1];
                                var myDialog = new Dialog({
                                    title: this.nls.titleErrorCall,
                                    content: resp
                                });
                                myDialog.show();
                                this._cancelAndBack();
                            }).bind(this)
                        ).always((function(jqXHR, textStatus) {}).bind(this));
                        domClass.add(this.contentInsertParams, "hidden");
                        domClass.remove(this.contentResult, "hidden");
                        domClass.remove(this.calculated, "hidden");
                        domClass.add(this.panelResult, "hidden");
                    }
                }
            },
            _getDataForInputs: function(token) {
                //capture the params from de config data and spatial data
                var objectServices = {};
                for (var i = 0; i < this.config.configFields.rows.length; i++) {
                    var row = this.config.configFields.rows[i];
                    for (var j = 0; j < row.length; j++) {
                        var element = row[j];
                        if (element.serviceParam) {
                            var domElement = query("[name='" + element.id + "']");
                            switch (element.type.toUpperCase()) {
                                case "LIST":
                                    if (domElement.val()) {
                                        for (var k = 0; k < domElement.val().length; k++) {
                                            var key, value, text;
                                            text = domElement.val()[k].split("-");
                                            key = text[0];
                                            value = text[1];
                                            objectServices[key] = value;
                                        }
                                    }
                                    if (element.allValues) {
                                        for (key in element.allValues) {
                                            if (!objectServices[key]) {
                                                objectServices[key] = element.allValues[key];
                                            }
                                        }
                                    }
                                    break;
                                case "TEXT":
                                case "COMBO":
                                case "NUMBER":
                                    objectServices[element.serviceParam] = domElement.val();
                                    break;
                                case "CHECK":
                                    $(domElement).prop("checked") ? objectServices[element.serviceParam] = 1 : objectServices[element.serviceParam] = 0;
                                    break;
                            }
                        }
                    }
                }
                objectServices["Token"] = token;
                objectServices = this._addGeoData(objectServices);
                objectServices = this._addToken(objectServices, token);
                objectServices = this._addCustomData(objectServices);
                return objectServices;
            },
            _addCustomData: function(data) {
                data.UniqueID = 1;
                return data;
            },
            _getDataForGIS: function(token) {
                //capture the params from de config data and spatial data
                var objectServices = {};
                for (var i = 0; i < this.config.configFields.rows.length; i++) {
                    var row = this.config.configFields.rows[i];
                    for (var j = 0; j < row.length; j++) {
                        var element = row[j];
                        if (element.serviceParamGIS) {
                            var domElement = query("[name='" + element.id + "']");
                            switch (element.type.toUpperCase()) {
                                case "LIST":
                                    if (domElement.val()) {
                                        for (var k = 0; k < domElement.val().length; k++) {
                                            var key, value, text;
                                            text = domElement.val()[k].split("-");
                                            key = text[0];
                                            value = text[1];
                                            objectServices[key] = value;
                                        }
                                    }
                                    if (element.allValuesGIS) {
                                        for (key in element.allValuesGIS) {
                                            if (!objectServices[key]) {
                                                objectServices[key] = element.allValuesGIS[key];
                                            }
                                        }
                                    }
                                    break;
                                case "TEXT":
                                case "COMBO":
                                case "NUMBER":
                                    objectServices[element.serviceParamGIS] = domElement.val();
                                    break;
                                case "CHECK":
                                    $(domElement).prop("checked") ? objectServices[element.serviceParamGIS] = 1 : objectServices[element.serviceParam] = 0;
                                    break;
                            }
                        }
                    }
                }
                objectServices = this._addGeoDataGIS(objectServices);
                objectServices = this._addCustomGisData(objectServices);
                return objectServices;
            },
            _addCustomGisData: function(data) {
                data.Username = esriId.credentials.length?esriId.credentials[0].userId: "Anonymous";

                var date;
                date = new Date();
                date = date.getUTCFullYear() + '-' +
                    ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
                    ('00' + date.getUTCDate()).slice(-2) + ' ' +
                    ('00' + date.getUTCHours()).slice(-2) + ':' +
                    ('00' + date.getUTCMinutes()).slice(-2) + ':' +
                    ('00' + date.getUTCSeconds()).slice(-2);

                data.DateStamp = date;
                data.DateTime = date;

                return data;

            },
            _addGeoData: function(data) {
                var graphic = this.lgisGraphicLayerSearch.graphics[0];
                var geo = webMercatorUtils.webMercatorToGeographic(graphic.geometry);
                data.longitude = geo.x.toString();
                data.latitude = geo.y.toString();
                return data;
            },
            _addGeoDataGIS: function(data) {
                var graphic = this.lgisGraphicLayerSearch.graphics[0];
                var geo = webMercatorUtils.webMercatorToGeographic(graphic.geometry);
                data.Longitude = geo.x.toString();
                data.Latitude = geo.y.toString();
                return data;
            },
            _addToken: function(data, token) {
                data.Token = token;
                data.apikey = this.config.apikey;
                return data;
            },
            _requiredFieldsCheck: function() {
                var status = true;
                for (var i = 0; i < this.config.configFields.rows.length; i++) {
                    var row = this.config.configFields.rows[i];
                    for (var j = 0; j < row.length; j++) {
                        var element = row[j];
                        if (element.required) {
                            var domElement = query("[name='" + element.id + "']");
                            var $elementNode;
                            switch (element.type.toUpperCase()) {
                                case "TEXT":
                                    $elementNode = $(domElement).parent();
                                    break;
                                case "COMBO":
                                    $elementNode = $(domElement).parents("table:first");
                                    break;
                                case "NUMBER":
                                    $elementNode = $(domElement).parent();
                                    break;
                                case "LIST":
                                    $elementNode = $(domElement);
                                    break;
                                case "CHECK":
                                    $elementNode = $(domElement);
                                    break;
                            }
                            if (!domElement.val()) {
                                $elementNode.addClass("dijitTextBoxError");
                                status = false;
                            } else {
                                $elementNode.removeClass("dijitTextBoxError");
                            }
                        }

                    }
                }
                if (this.lgisGraphicLayerSearch.graphics.length == 0) {
                    status = false;
                    $(".searchGroup").addClass("dijitTextBoxError");
                } else {
                    $(".searchGroup").removeClass("dijitTextBoxError");
                }
                if (!status) {
                    var myDialog = new Dialog({
                        title: this.nls.titleMessageValidation,
                        content: this.nls.messageValidation,
                        style: "width: 300px"
                    });
                    myDialog.show();
                }
                return status;
            },
            _cancelAndBack: function() {
                domClass.remove(this.contentInsertParams, "hidden");
                domClass.add(this.contentResult, "hidden");

            },
            _onBack: function() {
                domClass.remove(this.contentInsertParams, "hidden");
                domClass.add(this.contentResult, "hidden");
            },
            _getToken: function() {
                var esriAuthData = {
                    'f': 'json',
                    'client_id': this.config.credentials.client_id,
                    'client_secret': this.config.credentials.client_secret,
                    'grant_type': this.config.credentials.grant_type,
                    'expiration': this.config.credentials.expiration
                }
                var self = this;
                $.ajax({
                    url: this.config.credentials.url,
                    type: "POST",
                    dataType: 'json',
                    async: true,
                    data: esriAuthData
                }).success(function(data) {
                    self.tokenEsri = data["access_token"];
                }).error(function(data) {
                    console.log("Esri token generation failed.")
                });
            }
            //methods to communication between widgets:

        });
    });
