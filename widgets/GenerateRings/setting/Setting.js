define([
  'dojo/_base/declare',
  'dojo/_base/Color',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/BaseWidgetSetting',
  './js/ColorPickerEditor',
  'dijit/form/TextBox',
],
function(declare, dojoColor, _WidgetsInTemplateMixin, BaseWidgetSetting, ColorPickerEditor) {

  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'generate-rings-setting',

    postCreate: function(){
      //the config object is passed in
      this.fillRing1 = this._createColorPicker(this.fillRingNode1, false);
      this.borderRing1 = this._createColorPicker(this.borderRingNode1);
      this.fillRing2 = this._createColorPicker(this.fillRingNode2, false);
      this.borderRing2 = this._createColorPicker(this.borderRingNode2);

      this.setConfig(this.config);
    },

    setConfig: function(config){
      this.fillRing1.setValues({
        color: new dojoColor(config.ring1.fill)
      });
      
      this.borderRing1.setValues({
        color: new dojoColor(config.ring1.border)
      });
      
      this.fillRing2.setValues({
        color: new dojoColor(config.ring2.fill)
      });
      
      this.borderRing2.setValues({
        color: new dojoColor(config.ring2.border)
      });

      this.maxRingsNode.set("value", this.config.maxRings);
    },

    getConfig: function(){
      //WAB will get config object through this method
      return {
        ring1: {
          fill: this.fillRing1.getValues(),
          border: this.borderRing1.getValues(),
        },
        ring2: {
          fill: this.fillRing2.getValues(),
          border: this.borderRing2.getValues(),
        },
        maxRings: this.maxRingsNode.get("value")
      };
    },

    _createColorPicker: function (node, hasAlfa=true) {
      var colorPicker = new ColorPickerEditor({
        nls: this.nls,
        hasAlfa: hasAlfa
      });
      colorPicker.placeAt(node);
      colorPicker.startup();
      return colorPicker;
    },
  });
});
