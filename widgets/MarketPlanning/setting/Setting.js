define([
		'dojo/_base/declare',
		'jimu/BaseWidgetSetting'
	],
	function(declare, BaseWidgetSetting) {

		return declare([BaseWidgetSetting], {
			baseClass: 'asdsdsa-setting',

			postCreate: function() {
				this.setConfig(this.config);
			},

			setConfig: function(config) {
        this.config = config;
				this.idLayer.value = config.idLayer;
				this.urlLocator.value = config.urlLocator;
				this.urlService.value = config.urlService;
				this.apikey.value = config.apikey;
				this.client_id.value = config.credentials.client_id;
				this.client_secret.value = config.credentials.client_secret;
				// 
			},

			getConfig: function() {

				this.config.idLayer = this.idLayer.value,
				this.config.urlLocator = this.urlLocator.value,
				this.config.urlService = this.urlService.value,
				this.config.apikey = this.apikey.value,
				this.config.idLayer = this.idLayer.value,
				this.config.credentials = {
					url: "https://www.arcgis.com/sharing/rest/oauth2/token/",
					client_id: this.client_id.value,
					client_secret: this.client_secret.value,
					grant_type: "client_credentials",
					expiration: "1440"
				};
				return this.config;
			}
		});
	});