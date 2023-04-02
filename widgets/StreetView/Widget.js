define([
  "dojo/_base/declare",
  "dijit/_WidgetsInTemplateMixin",
  "jimu/BaseWidget",
  "esri/graphic",
  "jimu/PanelManager",
  "esri/symbols/PictureMarkerSymbol",
  "esri/geometry/webMercatorUtils",
  "esri/layers/GraphicsLayer",
  "dojo/_base/lang",
  "dojo/on",
  "dojo/_base/html",
  "dojo/_base/array",
  "dojo/dom-style",
  "jimu/dijit/Message",
  "esri/SpatialReference",
  "esri/tasks/ProjectParameters",
  "dojo/dom-construct",
  "dojo/_base/window",
  "esri/config"
],
function (declare, _WidgetsInTemplateMixin, BaseWidget, Graphic, PanelManager,
    PictureMarkerSymbol, webMercatorUtils, GraphicsLayer, lang, on, html,
    array, domStyle, Message, SpatialReference, ProjectParameters,
    domConstruct, win, esriConfig) {

  return declare([BaseWidget, _WidgetsInTemplateMixin], {
      name: "Google Street View",
      baseClass: "widget-street-view",
      
      img: null,
      handlers: null,
      graphicsLayerGSV: null,
      _mapWkid: null,
      lastDragX: 0,

      postMixInProperties: function () {
        this.inherited(arguments);
      },

      postCreate: function () {
        this.handlers = [];
        this.inherited(arguments);

        this.img = domConstruct.create("img", null, win.body(), "first");
        this.img.src = this.folderUrl + "images/flying_gsv_man_e.png";
        this.img.style.position = "absolute";

        this.graphicsLayerGSV = new GraphicsLayer();
        this.graphicsLayerGSV.name = "Google Street View Location";
        this.map.addLayer(this.graphicsLayerGSV);

        this.own(on(this.domNode, 'mousedown', lang.hitch(this, function (event) {
          event.stopPropagation();
          if (event.altKey) {
            var msgStr = this.nls.widgetverstr + ': ' + this.manifest.version;
            msgStr += '\n' + this.nls.wabversionmsg + ': ' + this.manifest.wabVersion;
            msgStr += '\n' + this.manifest.description;
            new Message({
              titleLabel: this.nls.widgetversion,
              message: msgStr
            });
          }
        })));
      },

      onClose: function () {
        this.graphicsLayerGSV.setVisibility(false);
      },

      onOpen: function(){
        if(this.graphicsLayerGSV){
          this.graphicsLayerGSV.setVisibility(true);
        }
      },

      onMinimized: function(){
        if(this.graphicsLayerGSV){
          this.graphicsLayerGSV.visible = false;
        }
        document.winobj.close();
      },

      destroy: function () {
        this.inherited(arguments);
        document.winobj.close();
      },

      startup: function () {
        this.inherited(arguments);
        this._mapWkid = this.map.spatialReference.isWebMercator() ? 3857 : this.map.spatialReference.wkid;
      },

      _cleanup: function(targets) {
        array.forEach(targets, function(t) {
          t.remove();
        });
      },

      _isWebMercator: function(wkid) {
        // true if this spatial reference is web mercator
        if (SpatialReference.prototype._isWebMercator) {
          return SpatialReference.prototype._isWebMercator.apply({
            wkid: parseInt(wkid, 10)
          }, []);
        } else {
          var sr = new SpatialReference(parseInt(wkid, 10));
          return sr.isWebMercator();
        }
      },

      _onSvgMoveHandler: function(event){
        if (event && event.preventDefault) {
          event.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        domStyle.set(this.img, {
          "left": parseInt(event.clientX - (this.img.width /2), 10) + "px",
          "top": parseInt(event.clientY - this.img.height, 10) + "px"
        });
        if(this.lastDragX < parseInt(event.clientX - (this.img.width /2), 10)){
          if(this.img.src !== this.folderUrl + "images/flying_gsv_man_e.png"){
            this.img.src = this.folderUrl + "images/flying_gsv_man_e.png";
          }
        }else if(this.lastDragX > parseInt(event.clientX - (this.img.width /2), 10)){
          if(this.img.src !== this.folderUrl + "images/flying_gsv_man_w.png"){
            this.img.src = this.folderUrl + "images/flying_gsv_man_w.png";
          }
        }
        this.lastDragX = parseInt(event.clientX - (this.img.width /2), 10);
        return false;
      },

      _onSVGMouseDown: function(event){
        if (event && event.preventDefault) {
          event.preventDefault();
        } else {
          window.event.returnValue = false;
        }

        this.map.disablePan();
        html.replaceClass(this.gsvDragIcon, "gsviconplaced", "gsviconnormal");

        domStyle.set(this.img, {
          "left": parseInt(event.clientX - (this.img.width /2), 10) + "px",
          "top": parseInt(event.clientY - this.img.height, 10) + "px"
        });

        this.img.style.zIndex = 9999;
        this.img.style.visibility = "visible";

        this._cleanup(this.handlers);

        this.handlers.push(on(win.body(), "mousemove", lang.hitch(this, this._onSvgMoveHandler)));
        this.handlers.push(this.map.on("mouse-up", lang.hitch(this, this._onSVGMouseUP)));

        return false;
      },

      _onSVGMouseUP: function (event) {
        event.preventDefault();

        this.img.style.zIndex = 0;
        this.img.style.visibility = "hidden";
        this.graphicsLayerGSV.clear();
        this._cleanup(this.handlers);

        var svgGraphic = new Graphic(event.mapPoint);
        
        svgGraphic.symbol = new PictureMarkerSymbol( this.folderUrl + "images/SVM.png", 60, 60);
        this.handlers.push(this.graphicsLayerGSV.on("mouse-down", lang.hitch(this, this._onSVGMouseDown)));

        var svgGraphicLOS = new Graphic(event.mapPoint);

        svgGraphicLOS.symbol = new PictureMarkerSymbol( this.folderUrl + "images/los.png", 80, 80);
        svgGraphicLOS.symbol.setAngle(this.gsvHeading);
        
        this.graphicsLayerGSV.add(svgGraphicLOS);
        this.graphicsLayerGSV.add(svgGraphic);

        if (this._mapWkid === 4326 || this._isWebMercator(this._mapWkid)){
          var mPoint;
          if(this._mapWkid === 4326){
            mPoint = event.mapPoint;
          }else{
            mPoint = webMercatorUtils.webMercatorToGeographic(event.mapPoint);
          }
          var lng = mPoint.x.toFixed(12);
          var lat = mPoint.y.toFixed(12);
          var atts = {
            rotation: this.gsvHeading,
            lat: lat,
            lng: lng
          };
          svgGraphic.setAttributes(atts);
          svgGraphicLOS.setAttributes(atts);
          
          // Open street view in another tab
          window.open(`${this.config.streetViewUrl}${lng},${lng}&cbll=${lat},${lng}&layer=c`, '_blank');
        }else{
          var projectParameters = new ProjectParameters();
          projectParameters.geometries = [svgGraphic.geometry];
          projectParameters.outSR = new SpatialReference(4326);
          esriConfig.defaults.geometryService.project(projectParameters, lang.hitch(this, this.project2Geographic), lang.hitch(this, this.onError));
        }

        this.map.enablePan();
      },

      project2Geographic: function(geometries){
        try{
          var mPoint = geometries[0];

          if (mPoint){
            var svgGraphic = this.graphicsLayerGSV.graphics[1];
            var svgGraphicLOS = this.graphicsLayerGSV.graphics[0];
            svgGraphic.attr("rotation", this.gsvHeading);
            svgGraphicLOS.symbol.setAngle(this.gsvHeading);
            var lng = mPoint.x.toFixed(6);
            var lat = mPoint.y.toFixed(6);
            var atts = {
              rotation: this.gsvHeading,
              lat: lat,
              lng: lng
            };
            svgGraphic.setAttributes(atts);
            svgGraphicLOS.setAttributes(atts);

            // Open street view in another tab
            window.open(`${this.config.streetViewUrl}{lng},${lng}&cbll=${lat},${lng}&layer=c`, '_blank');

            this.graphicsLayerGSV.refresh();
          }
        }catch(err){
          alert.show(err.toString());
        }
      },

      onError: function(msg) {
        alert(msg);
      }
    });
  });
