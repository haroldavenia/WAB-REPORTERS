// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.41/esri/copyright.txt and http://www.arcgis.com/apps/webappbuilder/copyright.txt for details.

//>>built
define(["dojo/_base/declare",
        "jimu/BaseWidget",
        "dojo/_base/lang",
        "dojo/_base/connect",
        "esri/layers/GraphicsLayer",
        "esri/symbols/SimpleMarkerSymbol",
        "dojo/_base/Color",
        "esri/graphic",
        "esri/tasks/GeometryService",
        "esri/SpatialReference",
],
function (declare,
    BaseWidget,
    lang,
    connect,
    GraphicsLayer,
    SimpleMarkerSymbol,
    Color,
    Graphic,
    GeometryService,
    SpatialReference
){
	var url;

    return declare([BaseWidget],
    {
        baseClass: "jimu-widget-customwidget",

        startup: function () {
            this.inherited(arguments);
            this.graphicLayer = new GraphicsLayer();
			this.btnStreetView.style.visibility = "hidden";
            this.map.addLayer(this.graphicLayer);
            this.map_connect = connect.connect(map, "click", lang.hitch(this, this.myClickHandler));
        },

        onOpen: function () {
            this.map_connect = connect.connect(map, "click", lang.hitch(this, this.myClickHandler));
        },

        onClose: function () {
            this.map_connect.remove();
            this.graphicLayer.clear();
            this.map.infoWindow.hide();
			this.btnStreetView.style.visibility = "hidden";
        },

        myClickHandler: function (evt) {            
            if (evt.mapPoint != undefined) {
                var gsvc = new GeometryService(this.config.urlGeometryService);
                var outSR = new SpatialReference(4326);
                //var templateString = this.createTemplateStreet();

                this.graphicLayer.clear();

                //lat = evt.mapPoint.y;
                //lon = evt.mapPoint.x;

                var symbol = new SimpleMarkerSymbol();
                symbol.setStyle(SimpleMarkerSymbol.STYLE_CIRCLE);
                symbol.setSize(10);
                symbol.setColor(new Color([228, 73, 73, 0.5]));

                var graphic = new Graphic(evt.mapPoint, symbol);
                this.graphicLayer.add(graphic);

                gsvc.project([graphic.geometry], outSR, lang.hitch(this, function (projectedPoints) {
                    var pt = projectedPoints[0];
					this.url = this.config.urlStreetViewService.replace("<LATITUD>", pt.y).replace("<LONGITUD>", pt.x);
                    this.btnStreetView.style.visibility = "visible";
                }));
            }
        },
		
		myFunction: function () {            
            window.open(this.url, 'prueba');
        },

        createTemplateStreet: function () {
			return "<a href= '#' onclick= 'window.open("+this.config.urlStreetViewService+",prueba)'>This link will open in new window/tab</a>";
        }
    })
});