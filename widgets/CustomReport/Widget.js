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
    "dijit/registry",
    "esri/tasks/geoenrichment/GeoenrichmentTask",
    "esri/tasks/geoenrichment/RingBuffer",
    "esri/tasks/geoenrichment/DriveBuffer",
    "esri/units",
],
function(declare, BaseWidget, Search, PictureMarkerSymbol, Locator, esriBundle,
    GraphicsLayer, Draw, Graphic, webMercatorUtils, esriId, lang, domConstruct,
    domClass, domStyle, query, parser, TextBox, Select, Tooltip, CheckBox,
    NumberTextBox, MultiSelect, win, Dialog, registry, GeoenrichmentTask, RingBuffer, DriveBuffer, Units) {

    return declare([BaseWidget], {
        baseClass: 'jimu-widget-customReport',
        isClick: false,
        layerResult: null,

        postCreate: function() {
            this.inherited(arguments);

            let icon = {
                "iconAddPoint": "widgets/CustomReport/images/pin.png",
                "width": 32,
                "height": 32,
                "XOffSet": 0,
                "YOffSet": 16
            };

            this.picSearch = new PictureMarkerSymbol(icon.iconAddPoint, icon.width, icon.height).setOffset(icon.XOffSet, icon.YOffSet);

            this.lgisGraphicLayerSearch = new GraphicsLayer({
                id: "cr_graphicSearch"
            });

            this.map.addLayer(this.lgisGraphicLayerSearch);
            this.lgisGraphicLayerSearch.on("click",
                lang.hitch(this, '_clickGraphicLayerSearch'));

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
                    highlightSymbol: this.picSearch
                }],
                addLayersFromMap: true
            }, this.txtGeocoder);

            s.startup();
            s.on('select-result', lang.hitch(this, '_selectResult'));

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

            domConstruct.place(checkBox.domNode, contendor);
            domConstruct.create("label", {
                innerHTML: this.nls.titleCheckLayer
            }, contendor);

            this._renderDynamicRow();

            this.task = new GeoenrichmentTask("https://geoenrich.arcgis.com/arcgis/rest/services/World/GeoenrichmentServer");
            this.country = "US";
            this.task.getReports(this.country);
            this.units = Units;
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
                if (this.map.graphicsLayerIds[i]
                    .toUpperCase()
                    .indexOf(this.config.idLayer.toUpperCase()) >= 0) {
                    var layer = this.map.getLayer(this.map.graphicsLayerIds[i]);
                    this.layerResult = layer;
                    break;
                }
            }
        },

        _saveResult: function(gra, attr) {
            gra.attributes = attr;
            if (!this.layerResult) {
                this._searchLayer();
            }
            this.layerResult.applyEdits([gra], null, null, function(e) {
                console.log(e);
            }, function(e) {
                console.log(e);
            });
        },

        startup: function() {
            this._getToken();
        },

        // onOpen: function(){
        //   console.log('onOpen');
        // },

        onClose: function() {
            this.lgisGraphicLayerSearch.clear();
            this.drawToolbar.deactivate();
        },

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
                        case "MULTICHECK":
                            elementNode = this._createMultiCheck(
                                rowDom, element, row.length, j);
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

                    if (element.help) {
                        let helpId = registry.getUniqueId("helpcontent");
                        var help = domConstruct.create("span", {id: helpId});

                        domStyle.set(help, {
                            "margin-top": "5px"
                        });
                        domClass.add(help, "esriFloatTrailing");
                        domClass.add(help, "helpIcon");
                        domConstruct.place(help, rowDom, "first");

                        // May not be used
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
                            checked: element.subCheck.defaultValue
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

        _createMultiCheck: function(rowDom, element, totalElements, indexActualElement) {
            var contendor = domConstruct.create("div", null, rowDom);
            domConstruct.place(contendor, rowDom);

            for (var i = 0; i < element.values.length; i++) {

                var myCheckBox = new CheckBox({
                    name: element.values[i].id,
                    checked: (element.defaultValue) ? element.defaultValue : 0
                });

                domConstruct.place(myCheckBox.domNode, contendor);

                domConstruct.create("label", {
                    innerHTML: element.values[i].label
                }, contendor);
            }

            domClass.add(contendor, "padding-top");
            domClass.add(contendor, "width-check");
            contendor = {
                domNode: contendor
            };

            return contendor;
        },

        _createCheck: function(rowDom, element, totalElements, indexActualElement) {
            var contendor = domConstruct.create("div", null, rowDom);
            var myCheckBox = new CheckBox({
                name: element.id,
                checked: (element.defaultValue) ? element.defaultValue : 0
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

            // Replace with iterator
            for (var i = 0; i < element.values.length; i++) {
                var c = win.doc.createElement('option');
                c.innerHTML = element.values[i].label;
                c.value = element.values[i].value;
                sel.appendChild(c);
            }

            var myMultiSelect = new MultiSelect({
                name: element.id
            }, sel);

            // Replace with iterator
            for (var i = 0; i < element.values.length; i++) {
                if (element.values[i].selected) {
                    myMultiSelect.setValue(element.values[i].value);
                    break;
                }
            }

            return myMultiSelect;
        },

        _positionElement: function(rowDom, totalElements,
            indexActualElement, elementNode, element) {
            if (totalElements === 1) {
                domClass.add(elementNode.domNode, "jimu-r-row");
            } else if (totalElements === 2) {
                if (indexActualElement === 0) {
                    domStyle.set(elementNode.domNode, {
                        "float": "left"
                    });
                } else {
                    domStyle.set(elementNode.domNode, {
                        "float": "right"
                    });
                }
                domStyle.set(elementNode.domNode, {
                    width: "49%"
                });
            }

            if (element.title) {
                var title = domConstruct.create("p", {
                    innerHTML: element.title
                }, rowDom);
                domStyle.set(title, {
                    "line-height": "30px"
                });
            }

            dojo.byId(rowDom).appendChild(elementNode.domNode);
        },

        _raddLocationToMap: function() {
            $('html,body,#map_container').css('cursor', 'url("widgets/MarketPlanning/images/pin.png") 16 32, default');
            $(`#${this.id}_panel`).css({opacity: 0.15, 'pointer-events': 'none'});
            this.drawToolbar.activate(Draw.POINT);
        },

        _drawEnd: function(evt) {
            $('html,body,#map_container').css('cursor', 'auto');
			$(`#${this.id}_panel`).css({opacity: 1, 'pointer-events': 'auto'});

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

        _rclearSelection: function() {
            this.lgisGraphicLayerSearch.clear();
        },

        _clickGraphicLayerSearch: function(e) {
            this.lgisGraphicLayerSearch.remove(e.graphic);
            this.isClick = true;
        },

        _parseBufferRadii: function(values) {
            return values.split(",").map(x => parseInt(x, 10));
        },

        _getDataForInputs: function() {
            var objectServices = {},
                key_i;

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
                                    for (key_i in element.allValues) {
                                        if (!objectServices[key_i]) {
                                            objectServices[key_i] = element.allValues[key_i];
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
                                objectServices[element.serviceParam] = $(domElement).prop("checked") ? 1 : 0;
                                break;
                            case "MULTICHECK":
                                var contents = {};
                                for (var l = 0; l < element.values.length; l++) {
                                    var e = element.values[l];
                                    var domCheckBox = query("[name='" + e.id + "']");
                                    contents[e.id] = $(domCheckBox).prop("checked") ? 1 : 0;
                                }
                                objectServices[element.serviceParam] = contents;
                                break;
                        }
                    }
                }
            }

            objectServices = this._addGeoData(objectServices);
            objectServices = this._addCustomData(objectServices);
            return objectServices;
        },

        _addCustomData: function(data) {
            data.UniqueID = 1;
            return data;
        },

        _getDataForGIS: function() {
            var objectServices = {},
                key_i;

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
                                    for (key_i in element.allValuesGIS) {
                                        if (!objectServices[key_i]) {
                                            objectServices[key_i] = element.allValuesGIS[key_i];
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
                                objectServices[element.serviceParamGIS] = $(domElement).prop("checked") ? 1 : 0;
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
            data.Username = esriId.credentials[0].userId;

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

        _parseObjectData: function(data) {
            console.log(data);
            var objectData = this.config.data;
            return objectData;
        },

        _addGeoData: function(data) {
            var graphic = this.lgisGraphicLayerSearch.graphics[0];
            var geo = webMercatorUtils.webMercatorToGeographic(graphic.geometry);
            data.longitude = geo.x.toString();
            data.latitude = geo.y.toString();
            data.point = geo;
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
            //data.Token = token;
            //data.apikey = this.config.apikey;
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

            if (this.lgisGraphicLayerSearch.graphics.length === 0) {
                status = false;
                $(".searchGroup").addClass("dijitTextBoxError");
            } else {
                $(".searchGroup").removeClass("dijitTextBoxError");
            }

            if (!status) {
                var myDialog = new Dialog({
                    title: this.nls.titleMessageValidation,
                    content: this.nls.messageValidation,
                    style: this.config.stylePanelValidation
                });
                myDialog.show();
            }
            return status;
        },

        _rcancelAndBack: function() {
            domClass.remove(this.rcontentInsertParams, "hidden");
            domClass.add(this.rcontentResult, "hidden");

        },

        _ronBack: function() {
            domClass.remove(this.rcontentInsertParams, "hidden");
            domClass.add(this.rcontentResult, "hidden");
        },

        _getToken: function() {
            this.tokenEsri = esri.id.credentials[0].token;
        },

        /*_getReports: function(context) {
            $.ajax({
                url: 'https://stzheairveyfbghv.maps.arcgis.com/sharing/rest/search',
                type: 'POST',
                data: {
                    q: '(type:"Report Template" (access:"shared" OR access:"org") typekeywords:"esriWebReport") NOT owner:"MY_USERNAME"',
                    num: 100,
                    sortOrder: 'asc',
                    sortField: 'title',
                    start: 1,
                    f: 'json',
                    token: context.mainToken
                },
                success: (resp) => {
                    var respObj = JSON.parse(resp);
                    if(respObj.results.length == 0) {
                        alert("No custom reports found in your organization, using Esri defaults.")
                        return;
                    }
                    var reportID = respObj.results[0].id;
                    var str  = `https://geoenrich.arcgis.com/arcgis/rest/services/World/GeoEnrichmentServer/Geoenrichment/Createreport?` +
                    `studyareas=[{"geometry":{"x": -122.435, "y": 37.785}}]&`+
                    `report={"itemid":"${reportID}","url":"www.arcgis.com","token":"${context.mainToken}"}&` +
                    `format=pdf&f=bin&token=${context.mainToken}`;
                },
                error: (err) => {
                    console.log("Token regeneration failed.");
                    consoloe.log(err);
                },
                complete: () => {
                    //query('#myModal').modal('hide');
                }
            });
        },*/

        _runReport: function(e) {
            if (this._requiredFieldsCheck()) {
                var data = this._getDataForInputs();
                var radii_array = this._parseBufferRadii(data.BufferRadii);

                var studyAreas = [{
                    "geometry": data.point
                }];

                var studyAreaOpts = data.BufferUnits.slice(0, 9) == "esriDrive"
                    ? new DriveBuffer({
                        radii: radii_array,
                        units: data.BufferUnits
                    }) : new RingBuffer({
                        radii: radii_array,
                        units: data.BufferUnits
                    });

                // For more configuration options, see
                // https://developers.arcgis.com/rest/geoenrichment/api-reference/create-report.htm
                var reportFields = {
                    //title: "Custom Report",
                    logo: "https://retailscientifics.com/Images/RS_Report_Logo.png"
                }

                if (data.ReportType == "c2c5f9e461a74cbeb78610caf260ae0b") {
                    this.task.createReport({
                        studyAreas: studyAreas,
                        report: {
                            itemID: data.ReportType,
                            url: 'www.arcgis.com',
                            token: this.mainToken
                        },
                        format: 'pdf',
                        f: 'bin',
                        token: this.mainToken
                    });
                } else {
                    this.task.createReport({
                        studyAreas: studyAreas,
                        studyAreaOptions: studyAreaOpts,
                        fields: reportFields,
                        reportID: data.ReportType,
                        navigateToURL: false
                    });
                }
            }
        }

    });
});