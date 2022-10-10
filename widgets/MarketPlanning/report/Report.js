define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/dom-geometry',
  'dojo/promise/all',
  './jspdf',
  './html2canvas'
], function (
  declare,
  lang,
  Deferred,
  domGeom,
  all,
  JSPDF,
  html2canvas
) {
return declare(null, {
    constructor: function(options){
        this.inherited(arguments);

        lang.mixin(this, options);    
    },
    
    save: function(idContainer){
        let deferred = new Deferred();

        let rows = [
            document.querySelector(`#${idContainer}`).children[3],
            document.querySelector(`#${idContainer}`).children[5],
            document.querySelector(`#${idContainer}`).children[7],
            document.querySelector(`#${idContainer}`).children[9],
            document.querySelector(`#${idContainer}`).children[11],
            document.querySelector(`#${idContainer}`).children[13]
        ];

        let positions = [/*First page -->*/20,78,176,235, /*Second page -->*/ 20,78];

        let promises = rows.map((row)=> {
            var contentBox = domGeom.getContentBox(row);
            let height = (contentBox.h*750)/contentBox.w;

            return html2canvas(row, {
                windowWidth: 750,
                windowHeight: height
            });
        })

        all(promises).then((results)=>{
            let doc = new JSPDF.jsPDF();

            results.forEach((canvas, i) => {
                // Calulate height
                let width  = 750/3.7795275591;
                let height = ((canvas.height * 750) /canvas.width) /3.7795275591;

                //let img = canvas.toDataURL("image/png");

                let postion = positions[i];
        
                doc.addImage(canvas,'JPEG', 5, postion, width, height);
                
                if(i == 3){
                    doc.addPage();
                }
            })

            doc.save('Report Marketing Planning.pdf');

            let file = doc.output('blob', {
                filename: "Report Marketing Planning.pdf"
            });

            return deferred.resolve(file);
        });

        return deferred;
    } 
});
});