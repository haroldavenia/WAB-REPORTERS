define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  './ReportUtils',
  'dojo/text!./waterUses.html',
  './jspdf',
  './autotable'
], function (
  declare,
  lang,
  ReportUtils,
  waterUsesTable,
  JSPDF,
  autotable
) {
return declare(null, {
    constructor: function(options){
        this.inherited(arguments);

        lang.mixin(this, options);    
    },

    exportPDF: function(data, images){
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
        doc.setFont(undefined,'bold');
        doc.text("I.	DATOS GENERALES:", 20, 45);

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

        doc.setFont(undefined,'bold');
        doc.text("II.	ÍNDICE DE USO DE AGUA (IUA) PARA CONCESIÓN DE AGUA SUPERFICIAL.", 20, 85);

        doc.setFont(undefined,'bold').text(`Zona Hidrográfica:`, 15, 95);
        doc.setFont(undefined,'normal').text(`${data.zonaHidrografica}`, 55, 95);

        doc.setFont(undefined,'bold').text(`Subzona Hidrográfica:`, 15, 100);
        doc.setFont(undefined,'normal').text(`${data.subzonaHidrografica}`, 55, 100);

        doc.setFont(undefined,'bold').text(`Nivel subsiguiente:`, 15, 105);
        doc.setFont(undefined,'normal').text(`${data.nivelSubsiguiente}`, 55, 105);

        doc.setFont(undefined,'bold');
        doc.text("A.	Valor del Índice de Uso de Agua (IUA) superficial.", 20, 115);

        doc.setFont(undefined,'normal');
        ReportUtils.printCharacters(doc, `Una vez ubicada la información contenida en el formulario Único Nacional de solicitud de concesión de aguas superficiales, se evidencia que el área consultada corresponde a la cuenca del **${data.zonaHidrografica}**. Una vez ubicada geográficamente la información y revisada las bases de datos, se establece que el Índice de Uso de Agua se encuentra en Categoría de **${data.categoria}** con un valor de **${data.iua}%**.`, 15, 125, 180);

        doc.setFont(undefined, 'bold');
        doc.text("Fuente:", 15, 145);

        doc.setFont(undefined, 'normal');
        doc.text(data.fuente, 30, 145);

        doc.setFont(undefined,'bold');
        doc.text("Tabla 1. Índices de uso de Agua son los siguientes: ", 15, 155);
        
        autotable.default(doc, {
            theme: "grid",
            html: this.waterUsesIndexes(),
            startY: 160,
            lineColor: "#000",
            textColor: "#000",
            bodyStyles: {minCellHeight: 3, cellPadding: {
                top: 1,
                bottom: 1,
                left: 1,
                right: 1,
            }}
        });

        doc.text("Fuente:", 15, 230);

        doc.setFont(undefined, 'normal');
        doc.text("Estudio Nacional del Agua, 2014. IDEAM-MINAMBIENTE / CORTOLIMA.", 30, 230);
        doc.text("C: Continua		NC: No Continua ", 15, 235);

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

        ReportUtils.printCharacters(doc, `De acuerdo a la información consultada el **${data.fechaActual}**, se indica que acorde a los datos que reposan en CORTOLIMA, la categoría de IUA para este punto se encuentra categorizado como **${data.categoria}** con un valor de **${data.iua}%**. Lo anterior acorde a lo establecido en el Decreto 1076 de 2015. De esta forma, el punto propuesto de captación presenta las siguientes condiciones:`, 15, 160, 180);

        autotable.default(doc, {
            theme: "grid",
            html: this.viability(data),
            startY: 180,
            lineColor: "#000",
            textColor: "#000",
            bodyStyles: {minCellHeight: 3, cellPadding: {
                top: 1,
                bottom: 1,
                left: 1,
                right: 1,
            }}
        });

        doc.text(`Nota: Es de importancia indicar que, la base cartográfica del GeoVisor, corresponde a la información proporcionada por el Instituto Geográfico Agustín Codazzi - IGAC. Con escala de trabajo 1:25.000, y la escala de los permisos ambientales es menos.  Razón por la cual puede no existir coincidencia entre la nomenclatura de la fuente hídrica. Así las cosas, solicitamos que, de presentarse este caso, el funcionario que realice la visita, haga la respectiva claridad dentro del informe técnico. De igual manera se aclara que si la fuente consultada no registra en el GeoVisor de la Corporación, el sistema toma el drenaje inmediatamente anterior, y los datos usados para la establecer la disponibilidad o no del recurso hídrico, son tomados para la totalidad de la cuenca hidrográfica y sus afluentes.`, 15, 205, {
            maxWidth: 180,
            align: 'justify'
        })

        ReportUtils.printCharacters(doc, `El presente certificado de Índice de Uso de Agua (IUA), se expide el día **${data.fechaActual}**. Dentro del trámite de solicitud de concesión de aguas, acorde a la normatividad legal vigente.`, 15, 240, 180);

        doc.addImage(images.firma, 80, 250, 50, 20);
        doc.text(data.signatoryName, 105, 275, {
            align: 'center'
        });
        doc.text(data.signatoryPosition, 105, 280, {
            align: 'center'
        });

        doc.addImage(images.qr, 170, 250, 25, 25);

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
                    <td>FUENTE ABASTECEDORA y/o MICROCUENCA:</td>
                    <td>${data.microcuenta}</td>
                </tr>
                <tr>
                    <td>Código Cuenca:</td>
                    <td>${data.codigoCuenca}</td>
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
        let table = ReportUtils.stringToHTML(waterUsesTable).firstChild;
        return table;
    },

    viability: function(data){
        let table = `
            <table>
                <tr>
                    <th>Viabilidad</th>
                    <th>Uso Solicitado</th>
                </tr>
                <tr>
                    <td>ES VIABLE:</td>
                    <td>${data.viable}</td>
                </tr>
                <tr>
                    <td>NO ES VIABLE:</td>
                    <td>${data.noViable}</td>
                </tr>
            </table>
        `;

        return ReportUtils.stringToHTML(table).firstChild;
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
                    CERTIFICADO DE INDICE DE USO DE AGUA
                    <br>
                    <br>
                    COPIA CONTROLADA
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