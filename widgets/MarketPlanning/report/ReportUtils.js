define([
  'dojo/Deferred',
  './qrcode'
], function (
  Deferred
) {
    var mo = {};
    
   /**
     * Se encarga de crear un texto combinado entre fuente normal y negrita, además lo justifica
     * @param {jsPDF} doc instancia de jsPDF
     * @param {string} text Texto a insertar
     * @param {number} startX Posición en X
     * @param {numbet} startY Posición en Y
     * @param {number} width Tamaño en el documento en mm
     */
     mo.printCharacters = function(doc, text, startX, startY, width) {
        const startXCached = startX;
        const boldStr = 'bold';
        const normalStr = 'normal';
        const fontSize = doc.getFontSize();
        const lineSpacing = doc.getLineHeightFactor() + mo.convert_pt_To_mm(fontSize);

        let adjustedWidth = width + 1; // Hay un desajuste de 1mm con respecto a la función doc.text

        let textObject = getTextRows(doc, text, adjustedWidth, fontSize);

        textObject.map((row, rowPosition) => {

            Object.entries(row.chars).map(([key, value]) => {
                doc.setFont(undefined, value.bold ? boldStr : normalStr);                
                doc.text(value.char, startX, startY);
                
                if(value.char == ' ' && rowPosition < textObject.length - 1){
                    startX += row.blankSpacing;
                } else {
                    startX += mo.convert_pt_To_mm(doc.getStringUnitWidth(value.char) * fontSize);
                }
            });

            startX = startXCached;
            startY += lineSpacing;
        });
    };

    var getTextRows = function(doc, text, width, fontSize){
        const regex = /(\*{2})+/g; // all "**" words
        let textWithoutBoldMarks = text.replace(regex, '');
        let splitTextWithoutBoldMarks = doc.splitTextToSize(
            textWithoutBoldMarks,
            width
        );
        const boldStr = 'bold';
        const normalStr = 'normal';

        let charsMapLength = 0;
        let position = 0;
        let isBold = false;
        
        let textRows = splitTextWithoutBoldMarks.map((row, i) => {
            const charsMap = row.split('');

            const chars = charsMap.map((char, j) => {
                position = charsMapLength + j + i;

                let currentChar = text.charAt(position);

                if (currentChar === "*") {
                    const spyNextChar = text.charAt(position + 1);
                    if (spyNextChar === "*") {
                    // double asterix marker exist on these position's so we toggle the bold state
                    isBold = !isBold;
                    currentChar = text.charAt(position + 2);

                        // now we remove the markers, so loop jumps to the next real printable char
                        let removeMarks = text.split('');
                        removeMarks.splice(position, 2);
                        text = removeMarks.join('');
                    }
                }

                return { char: currentChar, bold: isBold };
            });

            charsMapLength += charsMap.length;
            
            // Calcular el tamaño del espacio en blanco para justificar el texto
            let charsWihoutsSpacing = Object.entries(chars).filter(([key, value]) => value.char != ' ');
            let widthRow = 0;

            charsWihoutsSpacing.forEach(([key, value]) => {
                // Tener en cuenta que los calculos se ven afectados si la letra esta en bold o en normal
                doc.setFont(undefined, value.bold ? boldStr : normalStr);
                widthRow += mo.convert_pt_To_mm(doc.getStringUnitWidth(value.char) * fontSize);
            });

            let totalBlankSpaces = charsMap.length - charsWihoutsSpacing.length;
            let blankSpacing = (width - widthRow) / totalBlankSpaces;

            return {blankSpacing: blankSpacing, chars: { ...chars }};
        });

        return textRows;
    };

    mo.convert_pt_To_mm = function(pt){
        return (pt*25.4) / 72;
    },

    mo.stringToHTML = function (str) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(str, 'text/html');
        return doc.body;
    };

    mo.getQRCode = function(data){
        var parser = new DOMParser();
        var doc = parser.parseFromString('', 'text/html');
        let element =  doc.body;

        let urlQR = data.urlQR;

        if(urlQR[urlQR.length-1] != '/'){
            urlQR += '/';
        }

        return new QRCode(element, {
            text: `${data.urlQR}?globalid=${data.globalid}`,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    };

    mo.getBase64Image = function (url) {
        let df = new Deferred();

        const img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL("image/png");

            df.resolve(dataURL);
        }
        img.src = url;

        return df;
    };

    return mo;
});