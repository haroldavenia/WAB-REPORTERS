define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/Evented',
    'jimu/dijit/TabContainer',
    'jimu/dijit/Message',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/registry',
    'dojo/text!./FieldSetting.html',
    'libs/dojo-bootstrap/Dropdown',
	'libs/dojo-bootstrap/Tab',
	'libs/dojo-bootstrap/Modal',
	'libs/dojo-bootstrap/Collapse',
	'libs/dojo-bootstrap/Tooltip'
],
function(
    declare,
    lang,
    dom,
    domAttr,
    domClass,
    domConstruct,
    on,
    Evented,
    TabContainer,
    Message,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    registry,
    template
){
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
        templateString: template,
        baseClass: 'jimu-widget-fieldsetting',
        inputValues: {},
        currentType: null,

        postCreate: function() {
            this.tabContainer = new TabContainer({
                tabs: [{
                    title: "General",
                    content: this.generalContentPane
                }, {
                    title: "Values",
                    content: this.valuesContentPane
                }]
            });
            this.tabContainer.placeAt(this.controlNode);
            this.tabContainer.startup();

            this.inputValues = {};
            this.setConfig(this.config);
        },

        setConfig: function(config){
            this.fieldTitle.value = config.title ? config.title: null;
            this.fieldType.value = config.type ? config.type: null;
            this.fieldId.value = config.id ? config.id: null;
            this.fieldPlaceholder.value = config.placeHolder ? config.placeHolder: null;
            this.fieldDefaultValue.value = config.defaultValue ? config.defaultValue: null;
            this.fieldHelp.value = config.help ? config.help: null;
            this.fieldServiceParam.value = config.serviceParam ? config.serviceParam: null;
            this.fieldServiceParamGis.value = config.serviceParamGIS ? config.serviceParamGIS: null;

            let isRequired = config.required ? config.required: false;

            this.fieldRequired.checked = isRequired;

            //Create values
            if(config.values){
                config.values.forEach(lang.hitch(this, function(rowValue){
                    this._createValueElement(rowValue.value, rowValue.label);
                }))
            }

            this.currentType = config.type ? config.type: null;

            if(this.currentType != "combo"){
                this._hideValuesActions();
            }
        },

        _showMessage: function _showMessage(title, message) {
            new Message({
              titleLabel: title,
              message: message
            });
        },

        _changeType: function(){
            if(this.currentType != this.fieldType.value && this.currentType == "combo"){
                var popup = new Message({
                    message: "Combo values will be removed and will be lost",
                    buttons: [
                        {
                            label: "Ok",
                            onClick: lang.hitch(this, function() {
                                popup.close();
                                this.currentType = this.fieldType.value;
                                this._hideValuesActions();
                            })
                        },
                        {
                            label: "Cancel",
                            onClick: lang.hitch(this, function(){
                                popup.close();
                                this.fieldType.value = "combo";
                            })
                        }                        
                    ]
                }); 
            } else if(this.fieldType.value == "combo"){
                this.currentType = this.fieldType.value;
                this._showValuesActions();
            }
        },

        _showValuesActions: function(){
            domAttr.remove(this.buttonAddValue, "disabled");

            domClass.remove(this.valueBody, "hidden");
            domClass.add(this.valueBody, "show");
            
            domClass.remove(this.valuesMessage, "show");
            domClass.add(this.valuesMessage, "hidden");
        },

        _hideValuesActions: function(){
            domAttr.set(this.buttonAddValue, "disabled", "true");

            domClass.remove(this.valueBody, "show");
            domClass.add(this.valueBody, "hidden");

            domClass.remove(this.valuesMessage, "hidden");
            domClass.add(this.valuesMessage, "show");
        },

        _saveField: function(evt){
            evt.preventDefault();

            let config = {
                title: this.fieldTitle.value,
                type: this.fieldType.value,
                id: this.fieldId.value,
                placeHolder: this.fieldPlaceholder.value,
                defaultValue: this.fieldDefaultValue.value,
                help: this.fieldHelp.value,
                serviceParam: this.fieldServiceParam.value,
                serviceParamGIS: this.fieldServiceParamGis.value,
                required: this.fieldRequired.checked
            };

            if(config.type == "combo"){
                if (Object.values(this.inputValues).length > 0){
                    let values = Object.values(this.inputValues).map(lang.hitch(this, function(rowValue){
                        let valueInput = dom.byId(rowValue.value);
                        let labelInput = dom.byId(rowValue.label);
        
                        return {
                            value: valueInput.value,
                            label: labelInput.value
                        }
                    }));
        
                    if(values.length){
                        config.values = values;
                    }
                } else {
                    this._showMessage(this.nls.valuesFieldError, "Dropdown values doesn't exist")
                }
                
            }

            this.emit("saveField", config)
        },

        _addNewValue: function(){
            this._createValueElement();
        },

        _createValueElement: function(value="", label=""){
            let valueId = registry.getUniqueId("valuecontent");
            let labelId = registry.getUniqueId("labelcontent");            
            
            var panelRow = domConstruct.toDom(`<div class="row" style="margin-bottom: 5px"></div>`);            

            let valueElementValue = domConstruct.toDom(`
                <div class="col-md-1">
                    <label>Value</label>
                </div>
                <div class="col-md-5">
                    <input type="text" id="${valueId}" value="${value}" required class="form-control"/>
                </div>
            `);

            let valueElementLabel = domConstruct.toDom(`
                <div class="col-md-1">
                    <label>Label</label>
                </div>
                <div class="col-md-4">
                    <input type="text" id="${labelId}" value="${label}" required class="form-control"/>
                </div>
            `);

            var contentButtonDelete = domConstruct.toDom(`<div class="col-md-1 text-right vcenter"></div>`);

            var buttonDelete = domConstruct.toDom(`<button type="button" class="btn-delete" style="margin-right: 10px"><span class="glyphicon glyphicon-trash"></span></button>`);

            // Add to list to manage them
            this.inputValues[valueId] = {
                label: valueId,
                value: labelId
            };

            domConstruct.place(valueElementValue, panelRow);
            domConstruct.place(valueElementLabel, panelRow);
            domConstruct.place(buttonDelete, contentButtonDelete);
            domConstruct.place(contentButtonDelete, panelRow);
            domConstruct.place(panelRow, this.valueBody);

            this.own(on(buttonDelete, "click", lang.hitch(this, function(){
                var popup = new Message({
                    message: "Are you sure to delete the value?",
                    buttons: [
                        {
                            label: "Delete",
                            onClick: lang.hitch(this, function() {
                                popup.close();
                                domConstruct.destroy(panelRow);
                                delete this.inputValues[valueId];
                            })
                        },
                        {
                            label: "Cancel",
                            onClick: function(){
                                popup.close();
                            }
                        }                        
                    ]
                });                
            })));
        },

        _cancel: function(){
            this.emit("cancel")
        }
    });
})