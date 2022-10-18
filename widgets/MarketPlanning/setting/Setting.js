define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/on',
    'dijit/registry',
    'jimu/BaseWidgetSetting',
    'jimu/dijit/Message',
    'jimu/dijit/_FeaturelayerSourcePopup',
    './FieldSetting',
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
    Message,
    _FeaturelayerSourcePopup,
    FieldSetting,
    CustomFeatureLayerSourcePopup
) {

return declare([BaseWidgetSetting], {
    baseClass: 'market-planning-setting',
    layerId: null,
    queryLayerId: null,
    rowsData: {},

    postCreate: function() {
        this.rowsData = {};
        this.setConfig(this.config);
    },

    setConfig: function(config) {
        this.urlLocator.value = config.urlLocator;
        this.urlService.value = config.urlService;
        this.apikey.value = config.apikey;

        this.idQueryLayer.value = config.idQueryLayer;
        this.urlTrackingLayer.value = config.urlTrackingLayer;
        //this.idLayer.value = config.idLayer;

        this.cred_Url.value = config.credentials.url;
        this.cred_clientId.value = config.credentials.client_id;
        this.cred_clientSecret.value = config.credentials.client_secret;

        if(config.configFields.rows){
            this.addConfigFields(config.configFields, this.rowsData, this.rows);
        }
    },

    addConfigFields: function(configFields, rowsData, contentElement){
        configFields.rows.forEach(lang.hitch(this, function(row){
            //Create row
            let rowId = registry.getUniqueId("rowcontent");
            let rowContent = this._createRowElement(rowsData, contentElement, rowId);

            let configFieldsRow = {};

            row.forEach(lang.hitch(this, function(field){
                // Create field into row
                let fieldId= registry.getUniqueId("fieldcontent");
                this._createFieldElement(rowsData, rowContent, field.title, rowId, fieldId);
                configFieldsRow[fieldId] = field;
            }));

            rowsData[rowId] = configFieldsRow;
        }));
    },

    getConfig: function() {
        this.config.urlLocator = this.urlLocator.value;
        this.config.urlService = this.urlService.value;
        this.config.apikey = this.apikey.value;

        this.config.idQueryLayer = this.idQueryLayer.value;
        this.config.urlTrackingLayer = this.urlTrackingLayer.value;

        //this.config.idLayer = this.idLayer.value;
        
        this.config.credentials = {
            url: this.cred_Url.value,
            client_id: this.cred_clientId.value,
            client_secret: this.cred_clientSecret.value,
            grant_type: "client_credentials",
            expiration: "1440"
        };

        let rowsList = Object.values(this.rowsData).map(lang.hitch(this, function(row){
            return Object.values(row);
        }));

        this.config.configFields.rows = rowsList;

        return this.config;
    },

    _setQueryLayer: function(){
        this.openPopupSetLayerId(this.idQueryLayer);
    },

    _setTrackingLayer: function(){
        this.openPopupSetLayerUrl(this.urlTrackingLayer);
    },
    
    openPopupSetLayerId: function(inputElement){
        var args = {
            titleLabel: "Set layer source",
    
            dijitArgs: {
                multiple: false,
                createMapResponse: this.map.webMapResponse,
                portalUrl: this.appConfig.portalUrl,
                style: {
                    height: '100%'
                }
            }
        };

        var featurePopup = new CustomFeatureLayerSourcePopup(args);
        on.once(featurePopup, 'ok', lang.hitch(this, function (item) {
            featurePopup.close();
            inputElement.value = item.layerInfo && item.layerInfo.id || null;;
        }));

        on.once(featurePopup, 'cancel', lang.hitch(this, function () {
            featurePopup.close();
            featurePopup = null;
        }));
    },

    openPopupSetLayerUrl: function(inputElement){
        var args = {
            titleLabel: "Set layer source",
    
            dijitArgs: {
                multiple: false,
                createMapResponse: this.map.webMapResponse,
                portalUrl: this.appConfig.portalUrl,
                style: {
                    height: '100%'
                }
            }
        };

        var featurePopup = new _FeaturelayerSourcePopup(args);
        on.once(featurePopup, 'ok', lang.hitch(this, function (item) {
            featurePopup.close();
            inputElement.value = item.url || null;;
        }));

        on.once(featurePopup, 'cancel', lang.hitch(this, function () {
            featurePopup.close();
            featurePopup = null;
        }));
    },

    _addNewRowSelection: function(evt){
        evt.preventDefault();
        
        let rowId = registry.getUniqueId("rowcontent");
        this.rowsData[rowId] = {};
        this._createRowElement(this.rowsData, this.rows, rowId);
    },

    _createRowElement: function(rowsData, contentElement, rowId){            
        var rowElement = domConstruct.toDom('<div class="panel panel-default" style="position: relative;"></div>');
        var rowContentButtons = domConstruct.toDom('<div class="content-buttons text-right"></div>');
        var rowButtonAdd = domConstruct.toDom('<button type="button" title="Add field" class="btn-add"><span class="glyphicon glyphicon-plus"></span></button>');
        var rowButtonDelete = domConstruct.toDom('<button type="button" title="Delete row" class="btn-delete" style="margin-left: 5px;"><span class="glyphicon glyphicon-trash"></span></button>');
        var rowBody = domConstruct.toDom(`<div id="${rowId}" class="panel-body"></div>`);

        domConstruct.place(rowButtonAdd, rowContentButtons);
        domConstruct.place(rowButtonDelete, rowContentButtons);
        domConstruct.place(rowContentButtons, rowElement);
        domConstruct.place(rowBody, rowElement);
        domConstruct.place(rowElement, contentElement);

        this.own(on(rowButtonAdd, "click", lang.hitch(this, function(){
            this._openEditorField(rowsData, true, rowId, {});
        })));
        
        this.own(on(rowButtonDelete, "click", lang.hitch(this, function(){
            var popup = new Message({
                message: "Are you sure to delete the row?",
                buttons: [
                    {
                        label: "Delete",
                        onClick: lang.hitch(this, function() {
                            popup.close();
                            domConstruct.destroy(rowElement);
                            delete rowsData[rowBody];
                        })
                    },
                    {
                        label: "Cancel",
                        onClick: function(){
                            popup.close();
                        }
                    }                        
                ]
            });
        })));

        return rowBody;
    },

    _openEditorField: function(rowsData, isCreated, rowId, config){            
        domStyle.set(this.configFieldPanel, "display", "block");

        let fieldSetting = new FieldSetting({
            config: config
        });
        fieldSetting.placeAt(this.configFieldPanel);
        fieldSetting.startup();

        fieldSetting.on("saveField", lang.hitch(this, function(field){
            if(isCreated){
                this._createField(rowsData, field, rowId);
            } else {
                this._editField(rowsData, field, rowId);
            }

            fieldSetting.destroy();
            domConstruct.empty(this.configFieldPanel);
        }));

        fieldSetting.on("cancel", lang.hitch(this, function(){
            domStyle.set(this.configFieldPanel, "display", "none");
            fieldSetting.destroy();
            domConstruct.empty(this.configFieldPanel);
        }));
    },

    _createField: function(rowsData, field, rowId){
        let currentNodeRow = dom.byId(rowId);
        let fieldId = registry.getUniqueId("fieldcontent");

        this.rowsData[rowId][fieldId] = field;

        this._createFieldElement(rowsData, currentNodeRow, field.title, rowId, fieldId);
        rowsData[rowId][fieldId] = field;

        domStyle.set(this.configFieldPanel, "display", "none");
    },

    _editField: function(rowsData, field, rowId){
        let currentNodeField= dom.byId(this.currentNodeFieldId);

        currentNodeField.innerText = field.title;

        rowsData[rowId][this.currentNodeFieldId] = field;

        domStyle.set(this.configFieldPanel, "display", "none");
    },

    _createFieldElement: function(rowsData, rowContent, title, rowId, fieldId){
        var fieldElement = domConstruct.toDom(`<div class="row"></div>`);
        var fieldColumnText = domConstruct.toDom(`<div class="col-md-11"></div>`);
        var fieldText = domConstruct.toDom(`<div class="field-text" title="Edit field" id="${fieldId}">${title}</div>`);
        var fieldDeleteContent = domConstruct.toDom(`<div class="col-md-1 text-right"></div>`);
        var fieldDelete = domConstruct.toDom(`<button class="btn-delete-field" title="Delete field"><span class="glyphicon glyphicon-minus"></span></button>`);
        

        domConstruct.place(fieldDelete, fieldDeleteContent);
        domConstruct.place(fieldDeleteContent, fieldElement);
        domConstruct.place(fieldText, fieldColumnText);
        domConstruct.place(fieldColumnText, fieldElement);
        domConstruct.place(fieldElement, rowContent);

        this.own(on(fieldText, "click", lang.hitch(this, function(){
            let fieldConfig = rowsData[rowId][fieldId];
            this.currentNodeFieldId = fieldId;
            this._openEditorField(rowsData, false, rowId, fieldConfig);
        })));
        
        this.own(on(fieldDelete, "click", lang.hitch(this, function(){
            var popup = new Message({
                message: "Are you sure to delete the field?",
                buttons: [
                    {
                        label: "Delete",
                        onClick: lang.hitch(this, function() {
                            popup.close();
                            domConstruct.destroy(fieldElement);
                            delete rowsData[rowId][fieldId];
                        })
                    },
                    {
                        label: "Cancel",
                        onClick: function(){
                            popup.close();
                        }
                    }                        
                ]
            });
        })));
    }
});
});