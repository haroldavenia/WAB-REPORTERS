define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/promise/all',
  './jspdf',
  './CanvasToIMGL'
], function (
  declare,
  lang,
  Deferred,
  all,
  JSPDF,
  CanvasToIMGL
) {
    return declare(null, {

        imgResults: [],
        pdf: null,
        margins: [],

        constructor: function(options){
            this.inherited(arguments);
            lang.mixin(this, options);
            const pdfHeight = 880;
            this.pdf = new JSPDF.jsPDF("p", "pt", [610, pdfHeight]);
            this.margins = { x: [20 , 20], y: [40, 20] };
        },

        calRatio: function(pageSize, dViewSize) {
            return (pageSize / dViewSize);
        },

        fitRatio: function(size, ratio) {
            return (size * ratio);
        },
        
        fitSizeView: function(pageSize, dViewSizeA, dViewSizeB) {
            let ratio = 0;
            if (dViewSizeA > pageSize) {
              ratio = this.calRatio(pageSize, dViewSizeA);
              dViewSizeA = this.fitRatio(dViewSizeA, ratio);
            }
        
            if (ratio > 0) dViewSizeB = this.fitRatio(dViewSizeB, ratio);
        
            return { dViewSizeA, dViewSizeB };
        },
        
        fitScale: function (pageSizeWidth, pageSizeHeight, dWidth, dHeight) {
            let dView = this.fitSizeView(pageSizeWidth, dWidth, dHeight);
            dWidth = dView.dViewSizeA;
            dHeight = dView.dViewSizeB;
            dView = this.fitSizeView(pageSizeHeight, dHeight, dWidth);
            dWidth = dView.dViewSizeB;
            dHeight = dView.dViewSizeA;

            return { dWidth, dHeight };
        },

        fitAreaEditing: function(pageSizeWidth, pageSizeHeight, margins) {

            if (margings && margins.y) {
              let value = 0;
              if (margins.y.length > 1) {
                value = pageSizeHeight - (margins.y[0] + margins.y[1]);
              } else if (margins.y.length > 0) {
                value = pageSizeHeight - margins.y[0];
              }
              if (!value < 1) {
                pageSizeHeight = value;
              } else {
                console.error(new CustomError("size_height_img_error", 'height size image is less than 1'));
              }
            }
        
            if (margins && margins.x) {
              let value = 0;
              if (margins.x.length > 1) {
                value = pageSizeWidth - (margins.x[0] + margins.x[1]);
              } else if (margins.x.length > 0) {
                value = pageSizeWidth - margins.x[0];
              }
              if (!value < 1) {
                pageSizeWidth = value
              } else {
                console.error(new CustomError("size_width_img_error", 'width size image is less than 1'))
              }
            }
            return { pageSizeWidth, pageSizeHeight };
        },

        resolvePromise: function(deferred, elements, i){
            const row = elements[i];
            const canvasToIMGL = new CanvasToIMGL(row);
            canvasToIMGL.GetImageFile(i).then(lang.hitch(this, function(image){
                //const positions = [/*First page -->*/20,78,176,235, /*Second page -->*/ 20,78];
                const { pageSizeWidth, pageSizeHeight } = this.fitAreaEditing( this.pdf.internal.pageSize.getWidth(),  this.pdf.internal.pageSize.getHeight(), this.margins);
                const { dWidth, dHeight } = this.fitScale(pageSizeWidth, pageSizeHeight, image.width, image.height);
                const marginX = this.margins.x[0];
                let marginY = this.margins.y[0];
                if (marginY >= this.pdf.internal.pageSize.getHeight()) {
                    this.pdf.addPage();
                    this.margins = { x: [20 , 20], y: [40, 20] };
                    marginY = this.margins.y[0];
                }
                this.pdf.addImage(image.src,'JPEG', marginX, marginY, dWidth, dHeight);
                this.margins = { x: [20, 20], y: [ this.margins.y[0] + 20 + dHeight, 20] };
                if(i < elements.length-1){
                    this.resolvePromise(deferred, elements, i+1);
                } else {
                    this.pdf.save('Report Marketing Planning.pdf');
                    deferred.resolve( this.pdf.output('blob', {
                        filename: "Report Marketing Planning.pdf"
                    }));
                }
            }), function(error) {
                deferred.reject(error);   
            });   
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
            this.resolvePromise(deferred, rows, 0);
            return deferred;
        } 
    });
});