define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  './ReportUtils',
  'dojo/text!./waterUnderground.html',
  './jspdf',
  './autotable'
], function (
  declare,
  lang,
  ReportUtils,
  waterTable,
  JSPDF,
  autotable
) {
return declare(null, {
    constructor: function(options){
        this.inherited(arguments);

        lang.mixin(this, options);    
    },

    exportPDF: function(data, images) {
        let doc = new JSPDF.jsPDF();

        autotable.default(doc, {
            theme: "grid",
            html: this.headerTable(1, images),
            bodyStyles: {minCellHeight: 3, cellPadding: {
                top: 1,
                bottom: 1,
                left: 1,
                right: 1,
            }},
            columnStyles: {
                0: { cellWidth: 18 }, //Logo CorTolima
                1: { halign: 'center', fontSize: 13, fontStyle: 'bold' }, //Titulo
            },
            didDrawCell: function(data) {
                if (data.column.index === 0 && data.cell.section === 'body') {
                    var td = data.cell.raw;
                    var img = td.getElementsByTagName('img')[0];
                    var dim = data.cell.height - data.cell.padding('vertical');
                    var textPos = data.cell;
                    doc.addImage(img.src, textPos.x+ 1, textPos.y + 1, dim, dim);
                }
            }
        });

        doc.setFontSize(10);
        doc.setFont(undefined,'bold').text("I.	DATOS GENERALES:", 20, 45);

        autotable.default(doc, {
            theme: "grid",
            html: this.generalData(data),
            startY: 50,
            lineColor: "#000",
            textColor: "#000",
            bodyStyles: {minCellHeight: 3, cellPadding: {
                top: 1,
                bottom: 1,
                left: 1,
                right: 1,
            }}
        });

        doc.setFont(undefined,'bold').text("II.	ÍNDICE DE USO DE AGUA (IUA) PARA CONCESIÓN DE AGUA SUBTERRANEA.", 20, 85);

        doc.setFont(undefined,'bold').text(`Provincia hidrogeológica:`, 15, 95);
        doc.setFont(undefined,'normal').text(`${data.provinciaHidrogeo}`, 65, 95);

        doc.setFont(undefined,'bold').text(`Sistema acuífero:`, 15, 100);
        doc.setFont(undefined,'normal').text(`${data.sistemaAcuifero}`, 65, 100);

        doc.setFont(undefined,'bold').text(`Unidades hidrogeológicas:`, 15, 105);
        doc.setFont(undefined,'normal').text(`${data.unidadesHidrogeo}`, 65, 105);

        ReportUtils.printCharacters(doc, "**Fuente:** Resolución 1926 de 2017, Plan de Manejo Ambiental del Acuífero de Ibagué", 15, 115, 180);

        doc.setFont(undefined,'bold').text("A.	Valor del Índice de Uso de Agua (IUA) subterránea.", 20, 125);

        doc.setFont(undefined,'normal');
        ReportUtils.printCharacters(doc, `Una vez ubicada la información contenida en el formulario Único Nacional de solicitud de concesión de aguas subterráneas, se evidencia que el área consultada corresponde a provincia hidrogeológica del **${data.provinciaHidrogeo}** y pertenece al **${data.acuifero}**. Una vez ubicada geográficamente la información y revisada las bases de datos, se establece que el Índice de Uso de Agua se encuentra en Categoría de **${data.categoria}** con un valor de **${data.iua}**.`, 15, 135, 180);
        ReportUtils.printCharacters(doc, "**Fuente:** Resolución 1926 de 2017, Plan de Manejo Ambiental del Acuífero de Ibagué", 15, 160, 180);

        doc.setFont(undefined,'bold').text("Tabla 1. Índices de Uso de Agua subterránea son los siguientes: ", 15, 170);
        
        autotable.default(doc, {
            theme: "grid",
            html: this.waterUsesIndexes(),
            startY: 175,
            lineColor: "#000",
            textColor: "#000",
            bodyStyles: {minCellHeight: 3, cellPadding: {
                top: 1,
                bottom: 1,
                left: 1,
                right: 1,
            }}
        });

        doc.setFont(undefined,'normal');
        ReportUtils.printCharacters(doc, "**Fuente:** Subdirección de Planificación Ambiental y Desarrollo Sostenible 2022", 15, 230, 180);
        ReportUtils.printCharacters(doc, "**S/I:** Sin Información		**PMAA:** Plan de Manejo Ambiental de Acuíferos", 15, 235, 180);

        //---------------------------------------------//
        //---------------------------------------------//
        // Página Número 2
        doc.addPage();

        autotable.default(doc, {
            theme: "grid",
            html: this.headerTable(2, images),
            bodyStyles: {minCellHeight: 3, cellPadding: {
                top: 1,
                bottom: 1,
                left: 1,
                right: 1,
            }},
            columnStyles: {
                0: { cellWidth: 18 }, //Logo CorTolima
                1: { halign: 'center', fontSize: 13, fontStyle: 'bold' }, //Titulo
            },
            didDrawCell: function(data) {
                if (data.column.index === 0 && data.cell.section === 'body') {
                    var td = data.cell.raw;
                    var img = td.getElementsByTagName('img')[0];
                    var dim = data.cell.height - data.cell.padding('vertical');
                    var textPos = data.cell;
                    doc.addImage(img.src, textPos.x+ 1, textPos.y + 1, dim, dim);
                }
            }
        });

        doc.setFont(undefined, 'normal');
        
        doc.addImage(images.mapa, 15, 35, 180, 110);

        doc.text("Figura de localización del punto propuesto para la captación.", 105, 150, {
            align: 'center'
        });

        ReportUtils.printCharacters(doc, `Acorde a lo anterior, esta subdirección manifiesta que, una vez, revisada la información disponible en CORTOLIMA, se evidencia que el área de interés se encuentra ubicada dentro del área del **${data.acuifero}**, el cual cuenta con una categoría de IUA para este punto de **${data.iua}**. Así las cosas, **${data.comentario}**`, 15, 160, 180);

        ReportUtils.printCharacters(doc, `**Nota**: Es de importancia indicar que, la base cartográfica del GeoVisor, corresponde a la información proporcionada por el Instituto Geográfico Agustín Codazzi – IGAC. Con escala de trabajo 1:25.000, y la escala de los permisos ambientales es menor.  Razón por la cual puede no existir coincidencia entre la nomenclatura de la fuente hídrica. Así las cosas, solicitamos que, de presentarse este caso, el funcionario que realice la visita haga la respectiva claridad dentro del informe técnico.`, 15, 185, 180)

        ReportUtils.printCharacters(doc, `El presente certificado de Índice de Uso de Agua (IUA), se expide el día **${data.fechaActual}** dentro del trámite de solicitud de concesión de aguas, acorde a la normatividad legal vigente. Sin embargo, se aclara que el presente documento no otorga la concesión de aguas solicitada, y es necesario que se realice la visita de evaluación del permiso y analice la totalidad de la información presentada por el interesado, donde el funcionario encargado se pronunciará de fondo respecto a la pertinencia o no de la viabilidad del respectivo permiso.`, 15, 215, 180);

        doc.addImage(images.firma, 80, 240, 50, 20);
        doc.text(data.signatoryName, 105, 265, {
            align: 'center'
        });
        doc.text(data.signatoryPosition, 115, 260, {
            align: 'center'
        });

        doc.addImage(images.qr, 170, 240, 25, 25);

        doc.save("Indices de uso de agua.pdf");
    },

    generalData: function(data){
        let table =`
            <table>
                <tr>
                    <td>FECHA:</td>
                    <td>${data.fechaActual}</td>
                </tr>
                <tr>
                    <td>Sistema de Acuífero:</td>
                    <td>${data.sistemaAcuifero}</td>
                </tr>
                <tr>
                    <td>Acuífero:</td>
                    <td>${data.acuifero}</td>
                </tr>
                <tr>
                    <td>COORDENADAS GEOGRAFICAS DATUM WGS84:</td>
                    <td>
                        Latitud: ${data.latitud}
                        <br>
                        Longitud: ${data.longitud}
                    </td>
                </tr>
            </table>
        `;

        return ReportUtils.stringToHTML(table).firstChild;
    },

    waterUsesIndexes: function(){
        let table = ReportUtils.stringToHTML(waterTable).firstChild;
        return table;
    },

    headerTable: function(page, images){
        let image = images.logo;
        let table = `
        <table class="header-table">
            <colgroup>
                <col style="width: 72px">
                <col style="width: auto">
                <col style="width: 70px">
                <col style="width: 70px">
            </colgroup>
            <tr>
                <td rowspan="3" style="padding: 0;">
                    <img id="reportLogo"
                        src="${image}"
                        width="70" height="70" />
                </td>
                <td rowspan="3" style="font-size: 20px;">
                    CERTIFICADO DE INDICE DE USO DE AGUA SUBTERRANEA
                </td>
                <td>Código</td>
                <td>F_RH_001</td>
            </tr>
            <tr>
                <td colspan="2">Versión: 1</td>
            </tr>
            <tr>
                <td>Pág.</td>
                <td>1 de ${page}</td>
            </tr>
        </table>`;

        return ReportUtils.stringToHTML(table).firstChild;
    }
})
})