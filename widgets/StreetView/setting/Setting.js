///////////////////////////////////////////////////////////////////////////
// Robert Scheitlin WAB Google Street View Widget
///////////////////////////////////////////////////////////////////////////
/*global define, dojo, setTimeout*/
/* jshint maxlen: 250 */
define([
  'dojo/_base/declare',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/BaseWidgetSetting',
  'dojo/_base/html',
  'dijit/form/NumberSpinner',
  'dijit/form/Select'
],
function(
  declare,
  _WidgetsInTemplateMixin,
  BaseWidgetSetting,
  html
) {
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    //these two properties is defined in the BaseWidget
    baseClass: 'widget-street-view-setting',

    startup: function() {
      this.setConfig(this.config);
    },

    setConfig: function(config) {
      this.config = config;
      this.streetViewUrl.set('value', this.config.streetViewUrl);
    },

    getConfig: function() {
      this.config.streetViewUrl = this.streetViewUrl.get('value');
      
      return this.config;
    }
  });
});
