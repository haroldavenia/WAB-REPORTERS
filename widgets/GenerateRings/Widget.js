define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  "dojo/dom",
  "dojo/dom-class",
  'dojo/dom-construct',
  "dojo/dom-style",
  "dojo/on",
  "dojo/keys",
  "dijit/form/CheckBox",
  'jimu/BaseWidget',
  'jimu/dijit/Message',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dstore/Memory',
	'dstore/Trackable',
	'dgrid1/OnDemandGrid',
  'dgrid/extensions/ColumnResizer',
  'dgrid/extensions/DijitRegistry',
  "esri/Color",
  "esri/graphic",
  "esri/geometry/geometryEngine",
  "esri/layers/GraphicsLayer",
  "esri/toolbars/draw",
  "esri/symbols/PictureMarkerSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/TextSymbol",
],
function(declare, lang, dom, domClass, domConstruct, domStyle, on, keys, CheckBox, BaseWidget, Message, _TemplatedMixin, _WidgetsInTemplateMixin, Memory, Trackable, OnDemandGrid, ColumnResizer, 
  DijitRegistry, Color, Graphic, geometryEngine, GraphicsLayer, Draw, PictureMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, TextSymbol) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {

    // Custom widget code goes here

    baseClass: 'generate-rings',
    activeTool: false,
    // this property is set by the framework when widget is loaded.
    // name: 'GenerateRings',
    // add additional properties here

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('GenerateRings::postCreate');

      this.graphicsLayer = new GraphicsLayer();

      this.map.addLayer(this.graphicsLayer);

      this.initToolbar();
      this.initGrid();
    },
    
    onClose: function(){
      this.setStateTool(false);
    },

    addPoint: function(){
      this.setStateTool(!this.activeTool);
    },

    initToolbar: function() {
      this.tb = new Draw(this.map);
      this.tb.on("draw-end", lang.hitch(this, this.addGraphic));
    },

    setStateTool: function(state){
      this.activeTool = state;
      let panel = dom.byId(`${this.id}_panel`);

      if(state){
        // Hide panel to add point
        domStyle.set(panel, "opacity", 0.15);
        domStyle.set(panel, "pointer-events", "none");

        domClass.add(this.pointAdd, "activate");

        this.tb.activate(Draw.POINT);
      } else {
        // Show panel
        domStyle.set(panel, "opacity", 1);
        domStyle.set(panel, "pointer-events", "auto");

        domClass.remove(this.pointAdd, "activate");        
        
        //deactivate the toolbar and clear existing graphics 
        this.tb.deactivate();
      }
    },

    initGrid() {
      var content = domConstruct.toDom('<div></div>');
			domConstruct.place(content, this.gridItem);

      let store = new (declare([Memory, Trackable]))({
        data: []
      });

      this.grid = new (declare([OnDemandGrid, ColumnResizer]))({
        className: "dgrid-autoheight",
        columns: [
          { field: "ringName", label: "Ring", resizable: false, sortable: false, renderCell: (attributes, data, td, options) => {
            
            var editLabelInput = new dijit.form.TextBox({
              name: "edit-label",
              class: "edit-label",
              value: attributes.ringName /* no or empty value! */,
              placeHolder: "Edit ring label"
            });
            
            var nodeRingName = domConstruct.toDom('<div class="ring-name">' + attributes.ringName + '</div>');
            var nodeOkButton = domConstruct.toDom('<div class="button-ring ok-button"></div>');
            var nodeEditButton = domConstruct.toDom('<div class="button-ring edit-button"></div>');            
            
						domConstruct.place(nodeRingName, td);
						domConstruct.place(nodeEditButton, td);
            
						domConstruct.place(editLabelInput.domNode, td);
						domConstruct.place(nodeOkButton, td);
            
            domStyle.set(editLabelInput.domNode, "display", "none");
            domStyle.set(nodeOkButton, "display", "none");

            let editLabel = (attributes) => {
              let graphic = this.graphicsLayer.graphics.find(lang.hitch(this, function(graphic) {
                return graphic.attributes.uuid == attributes.uuid && graphic.attributes.type == 3;
              }));

              domStyle.set(editLabelInput.domNode, "display", "none");
              domStyle.set(nodeOkButton, "display", "none");
              
              domStyle.set(nodeRingName, "display", "inline-block");
              domStyle.set(nodeEditButton, "display", "inline-block");

              let ringName = editLabelInput.get("value");

              attributes.ringName = ringName;
              nodeRingName.innerHTML = ringName;

              let newGraphic = graphic.clone();

              var txtSymbol = new TextSymbol({
                text: ringName,
                horizontalAlignment: "center",
                haloColor: "white",
                haloSize: 1,
                yoffset: -10
              });
              newGraphic.symbol = txtSymbol;

              this.graphicsLayer.remove(graphic);
              this.graphicsLayer.add(newGraphic);
            }

            on(nodeEditButton, "click", lang.hitch(this, function() {
              domStyle.set(editLabelInput.domNode, "display", "inline-block");
              domStyle.set(nodeOkButton, "display", "inline-block");
              
              domStyle.set(nodeRingName, "display", "none");
              domStyle.set(nodeEditButton, "display", "none");
            }));
            
            
            on(nodeOkButton, "click", lang.hitch(this, function() {
              editLabel(attributes);
						}));
            
            on(editLabelInput, "keydown", lang.hitch(this, function(event) {
              if(event.keyCode === keys.ENTER){
                editLabel(attributes);
              }
            }));
          }},
          { field: "zoom", label: "Locate", width: 50, resizable: false, sortable: false, renderCell: (attributes, data, td, options) => {
            var nodeButton = domConstruct.toDom('<a class="button-grid button-marker" title="Zoom to point"></a>');
						domConstruct.place(nodeButton, td);

						on(nodeButton, "click", lang.hitch(this, function() {
							this._onZoom(attributes);
						}));
          }},
          { field: "ring1", label: "2.5 mi", width: 50, resizable: false, sortable: false, renderCell: (attributes, data, td, options) => {
            var cb = new CheckBox({
              name: "checkBox",
              checked: attributes.isSelect2_5,
              onChange: lang.hitch(this, function(b) {
                let graphic = this.graphicsLayer.graphics.find(lang.hitch(this, function(graphic) {
                  return graphic.attributes.uuid == attributes.uuid && graphic.attributes.type == 1;
                }));

                if(b) {
                  attributes.isSelect2_5 = true;
                  graphic.show();
                } else {
                  attributes.isSelect2_5 = false;
                  graphic.hide();
                }
              })
            });

            domConstruct.place(cb.domNode, td);
          }},
          {field: "ring2", label: "5 mi", width: 50, resizable: false, sortable: false, renderCell: (attributes, data, td, options) => {
            var cb = new CheckBox({
              name: "checkBox",
              checked: attributes.isSelect5,
              onChange: lang.hitch(this, function(b) {
                let graphic = this.graphicsLayer.graphics.find(lang.hitch(this, function(graphic) {
                  return graphic.attributes.uuid == attributes.uuid && graphic.attributes.type == 2;
                }));

                if(b) {
                  attributes.isSelect5 = true;
                  graphic.show();
                } else {
                  attributes.isSelect5 = false;
                  graphic.hide();
                }
              })
            });

            domConstruct.place(cb.domNode, td);
          }},
          {field: "delete", label: "", width: 30, resizable: false, sortable: false, renderCell: (attributes, data, td, options) => {
            var nodeButton = domConstruct.toDom('<a class="button-grid button-delete" title="Delete"></a>');
            domConstruct.place(nodeButton, td);				
  
            on(nodeButton, "click", lang.hitch(this, function() {
              this._onDelete(attributes);							
            }));
          }}
        ],
        noDataMessage: this.nls.notFoundResults,
        collection: store,
        adjustLastColumn: false
      }, content);

      this.grid.startup();
      this.grid.resize();
    },

    _onZoom: function(attributes){
      let graphic = this.graphicsLayer.graphics.find(lang.hitch(this, function(graphic){
        return graphic.attributes.uuid == attributes.uuid;
      }));

      if(graphic){
        var maxZoom = this.map.getMaxZoom();
        this.map.centerAndZoom(graphic.geometry, maxZoom - 12);
      }
    },

    _onDelete: function(attributes){
      let graphics = this.graphicsLayer.graphics.filter(lang.hitch(this, function(graphic){
        return graphic.attributes.uuid == attributes.uuid;
      }));
      
      graphics.forEach(lang.hitch(this, function(graphic) {
        if(graphic.attributes.uuid == attributes.uuid) {
          this.graphicsLayer.remove(graphic);
        }        
      }))

      let collection = this.grid.get("collection");
      
      var index = collection.data.findIndex(function(attrs) {
        return attrs.uuid == attributes.uuid;
      })

      collection.data.splice(index, 1);

      var data = collection.data.map(function(attrs, pos) {
        return attrs;
      })

      let store = new (declare([Memory, Trackable]))({
        data: data
      });

      this.grid.set("collection", store);
      this.grid.refresh();
      this.grid.resize();
    },

    addGraphic: function(evt) {
      this.setStateTool(false);

      // maxRings is multiplied by 3 because each one has 3 graphics, a point, a 2.5-mile ring, a 5-mile ring, and text label graphic
      if(this.graphicsLayer.graphics.length >= (this.config.maxRings * 4)) {
        new Message({message: "It is not allowed to add more than " + this.config.maxRings +" graphics"})
        return;
      }

      let collection = this.grid.get("collection");

      // figure out which symbol to use
      var symbol = new PictureMarkerSymbol('./widgets/GenerateRings/css/images/marker-icon.png', 25, 25);
      symbol.yoffset = 12;

      let uuidGraphics = this.uuidv4();

      let attrs = {
        uuid: uuidGraphics
      };

      let attrs2_5 = {
        uuid: uuidGraphics,
        type: 1
      };

      let attrs5 = {
        uuid: uuidGraphics,
        type: 2
      };
      
      let attrsText = {
        uuid: uuidGraphics,
        type: 3
      };

      let ringName = "Ring " + (collection.data.length + 1);
      var point = new Graphic(evt.geometry, symbol, attrs);

      this.graphicsLayer.add(point);
      
      var ring1 = geometryEngine.geodesicBuffer(evt.geometry, 2.5, 9035);
      var ring2 = geometryEngine.geodesicBuffer(evt.geometry, 5, 9035);

      var sfs1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
        new Color(this.config.ring1.fill), 4), new Color(this.config.ring1.border)
      );

      var sfs2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
        new Color(this.config.ring2.fill), 4), new Color(this.config.ring2.border)
      );

      var txtSymbol = new TextSymbol({
        text: ringName,
        horizontalAlignment: "center",
        haloColor: "white",
        haloSize: 1,
        yoffset: -10
      });

      this.graphicsLayer.add(new Graphic(ring1, sfs1, attrs2_5));
      this.graphicsLayer.add(new Graphic(ring2, sfs2, attrs5));
      this.graphicsLayer.add(new Graphic(evt.geometry, txtSymbol, attrsText));


      collection.data.push({
        uuid: uuidGraphics,
        ringName: ringName,
        isSelect2_5: true,
        isSelect5: true
      });

      let store = new (declare([Memory, Trackable]))({
        data: collection.data
      });

      this.grid.set("collection", store);
      this.grid.refresh();
      this.grid.resize();
    },

    uuidv4: function() {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    }
    

  });
});
