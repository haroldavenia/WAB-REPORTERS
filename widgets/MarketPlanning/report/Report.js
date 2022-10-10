define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/promise/all',
  'esri/tasks/LegendLayer',
  'esri/tasks/PrintParameters',
  'esri/tasks/PrintTemplate',
  'esri/tasks/PrintTask',
  './ReportUtils',
  './jspdf',
  './html2canvas'
], function (
  declare,
  lang,
  Deferred,
  all,
  LegendLayer,
  PrintParameters,
  PrintTemplate,
  PrintTask,
  ReportUtils,
  JSPDF,
  html2canvas
) {
return declare(null, {
    constructor: function(options){
        this.inherited(arguments);

        lang.mixin(this, options);    
    },
    
    save: function(report){
        let rows = [
            document.querySelector("#outputForm2").children[3],
            document.querySelector("#outputForm2").children[5],
            document.querySelector("#outputForm2").children[7],
            document.querySelector("#outputForm2").children[9],
            document.querySelector("#outputForm2").children[11],
            document.querySelector("#outputForm2").children[13]
        ];

        let positions = [
            {y: 20, x: 20},
            {y: 78, x: 20},
            {y: 176, x: 20},
            {y: 235, x: 20},

            {y: 20, x: 20},
            {y: 78, x: 20},
        ];

        let promises = rows.map((row)=> {
            return html2canvas(row);
        })

        all(promises).then((results)=>{
            let doc = new JSPDF.jsPDF();

            results.forEach((canvas, i) => {
                // Calulate height
                let width  = 750/3.7795275591; // in pixels
                let height = ((canvas.height * 750) /canvas.width) /3.7795275591; // in pixels

                //let img = canvas.toDataURL("image/png");

                let postion = positions[i];
        
                doc.addImage(canvas,'JPEG', 5, postion.y, width, height);
                
                if(i == 3){
                    doc.addPage();
                }
            })

            doc.save('test.pdf');
        })       
    },

    _executePrintTask: function (data) {
        let df = new Deferred();

        this._printService = new PrintTask(data.printTaskURL, { async: !1 });       

        var printParams = this._createPrintMapParameters(data.mapParams);

        this._printService.execute(printParams, lang.hitch(this, function (printResult) {
            df.resolve(printResult.url);
        }), lang.hitch(this, function () {
        }));

        return df;
    },

    _createPrintMapParameters: function (mapParams) {
        let printTemplate = new PrintTemplate();        

        this._printService.legendAll = true;
        this._printService._getPrintDefinition(mapParams.map, printTemplate);

        let legendLayers = [];

        //Iterate through all legends layer and skip aoi, buffer & highlight graphics layer
        this._printService.allLayerslegend.forEach(lang.hitch(this, function (legendLayer) {
            var newLayer;
            if (legendLayer.id !== this._aoiGraphicsLayer.id &&
                legendLayer.id !== this._drawnOrSelectedGraphicsLayer.id &&
                legendLayer.id !== this._highlightGraphicsLayer.id) {
                newLayer = new LegendLayer();
                newLayer.layerId = legendLayer.id;
                if (legendLayer.subLayerIds) {
                newLayer.subLayerIds = legendLayer.subLayerIds;
                }
                legendLayers.push(newLayer);
            }
        }));

        this._printService.legendAll = false;

        printTemplate.layout = "Tabloid ANSI B Landscape";
        //set legend layers in layout option
        printTemplate.layoutOptions = {
            legendLayers: legendLayers,
                customTextElements: [{
                Date: ""
            }]
        };

        let printParams = new PrintParameters();
            printParams.map = mapParams.map;
            printParams.template = printTemplate;
        return printParams;
    }    
});
});