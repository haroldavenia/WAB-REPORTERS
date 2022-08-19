define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/on',
    'dijit/registry',
    'jimu/BaseWidgetSetting',
    './CustomFeatureLayerSourcePopup',
    'libs/dojo-bootstrap/Dropdown',
	'libs/dojo-bootstrap/Tab',
	'libs/dojo-bootstrap/Modal',
	'libs/dojo-bootstrap/Collapse',
	'libs/dojo-bootstrap/Tooltip'
],
function(
    declare,
    lang,
    dom,
    domConstruct,
    domStyle,
    on,
    registry,
    BaseWidgetSetting,
    CustomFeatureLayerSourcePopup
) {

    return declare([BaseWidgetSetting], {
        baseClass: 'custom-report-setting',
        rowsIds: [],

        currentNodeFieldId: null,

        postCreate: function() {
            this.setConfig(this.config);
        },


        setConfig: function(config) {
            this.configText.value = config.configText;
            this.idLayer.value = config.idLayer;
            this.urlLocator.value = config.urlLocator;
            this.cred_Url.value = config.credentials.url;
            this.cred_clientId.value = config.credentials.client_id;
            this.cred_clientSecret.value = config.credentials.client_secret;
        },

        getConfig: function() {

            this.config.configText = this.configText.value;
            this.config.urlLocator = this.urlLocator.value;
            this.config.idLayer = this.idLayer.value;
            this.config.credentials = {
                url: this.cred_Url.value,
                client_id: this.cred_clientId.value,
                client_secret: this.cred_clientSecret.value,
                grant_type: "client_credentials",
                expiration: "1440"
            };


            return this.config;
        },

        _setLayer: function(){
            var args = {
                titleLabel: "Set layer source",
        
                dijitArgs: {
                    multiple: false,
                    createMapResponse: this.map.webMapResponse,
                    portalUrl: null,
                    style: {
                        height: '100%'
                    }
                }
            };
    
            var featurePopup = new CustomFeatureLayerSourcePopup(args);
            on.once(featurePopup, 'ok', lang.hitch(this, function (item) {
                featurePopup.close();
                this.layerId = item.layerInfo && item.layerInfo.id || null;
                this.idLayer.value = this.layerId;
            }));
    
            on.once(featurePopup, 'cancel', lang.hitch(this, function () {
                featurePopup.close();
                featurePopup = null;
            }));

        },

        _addRow: function(evt){
            evt.preventDefault();

            let id = registry.getUniqueId("rowfield");
            
            var rowElement = domConstruct.toDom('<div class="panel panel-default"></div>');
            var rowButtonAdd = domConstruct.toDom('<button type="button" class="btn btn-primary">Add field</button>');
            var rowBody = domConstruct.toDom(`<div id="${id}" class="panel-body"></div>`);

            domConstruct.place(rowButtonAdd, rowBody);
            domConstruct.place(rowBody, rowElement);
            domConstruct.place(rowElement, this.configFields_rows);

            rowButtonAdd.config = {
                id_body: id
            };

            this.own(on(rowButtonAdd, "click", lang.hitch(this, this._addField)));
            
        },

        _addField: function(evt){
            this.currentNodeFieldId = evt.target.config.id_body;

            
            domStyle.set(this.configFieldPanel, "display", "block");
        },

        _cancelEditField: function(){
            domStyle.set(this.configFieldPanel, "display", "none");
        },

        _saveField: function(){
            var fieldElement = domConstruct.toDom(`<div class="row"></div>`);
            var fieldText = domConstruct.toDom(`<div class="col-md-11"><div class="field-text">${this.fieldTitle.value}</div></div>`);
            var fieldDelete = domConstruct.toDom(`<div class="col-md-1"><button class="field-delete">X</button></div>`);

            let currentNodeField = dom.byId(this.currentNodeFieldId);
            
            domConstruct.place(fieldText, fieldElement);
            domConstruct.place(fieldDelete, fieldElement);
            domConstruct.place(fieldElement, currentNodeField);

            this.own(on(fieldDelete, "click", lang.hitch(this, function(){
                domConstruct.destroy(fieldElement);
            })));

            domStyle.set(this.configFieldPanel, "display", "none");
        }
    });
});