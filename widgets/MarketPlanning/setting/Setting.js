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
    CustomFeatureLayerSourcePopup
) {

    return declare([BaseWidgetSetting], {
        baseClass: 'market-planning-setting',
        layerId: null,
        queryLayerId: null,

        postCreate: function() {
            this.setConfig(this.config);
        },

        setConfig: function(config) {
            this.urlLocator.value = config.urlLocator;
            this.urlService.value = config.urlService;
            this.apikey.value = config.apikey;

            this.idQueryLayer.value = config.idQueryLayer;
            this.idLayer.value = config.idLayer;

            this.cred_Url.value = config.credentials.url;
            this.cred_clientId.value = config.credentials.client_id;
            this.cred_clientSecret.value = config.credentials.client_secret;
        },

        getConfig: function() {
            this.config.urlLocator = this.urlLocator.value;
            this.config.urlService = this.urlService.value;
            this.config.apikey = this.apikey.value;

            this.config.idQueryLayer = this.idQueryLayer.value;

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
            this.openPopupSetLayer(this.idLayer);
        },

        _setQueryLayer: function(){
            this.openPopupSetLayer(this.idQueryLayer);
        },
        
        openPopupSetLayer: function(inputElement){
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
                inputElement.value = this.queryLayerId;
            }));
    
            on.once(featurePopup, 'cancel', lang.hitch(this, function () {
                featurePopup.close();
                featurePopup = null;
            }));
        }
    });
});