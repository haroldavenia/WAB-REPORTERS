///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'dojo/Evented',
    'dojo/on',
    'dojo/_base/lang',
    'dojo/_base/html',
    'jimu/dijit/Popup',
    'jimu/dijit/_FeaturelayerChooserWithButtons',
    'jimu/dijit/LoadingIndicator',
    'esri/request'
  ],
  function(declare, Evented, on, lang, html, Popup, _FeaturelayerChooserWithButtons, LoadingIndicator,
    esriRequest) {
    return declare([Popup, Evented], {
      width: 830,
      height: 560,
      titleLabel: '',
  
      //dijitArgs: {
      //  layerChooserFromMap:,// optional, default value is 'jimu/dijit/_FeaturelayerChooserWithButtons'
      //  multiple: false,
      //  createMapResponse: ,
      //  portalUrl: ,
      //}
      dijitArgs: null,//refer to the parameters of dijit _FeaturelayerChooserWithButtons
  
      //events:
      //ok return {name,url,definition}
      //cancel
  
      postCreate: function(){
        this.inherited(arguments);
        html.addClass(this.domNode, 'jimu-featurelayer-source-popup');
        this._initFls();
        this._initLoading();
      },
  
      getSelectedRadioType: function(){
        return this.fls.getSelectedRadioType();
      },
  
      _initFls: function(){
        this.fls = new _FeaturelayerChooserWithButtons(this.dijitArgs);
        this.fls.placeAt(this.contentContainerNode);
        this.fls.startup();
  
        this.own(on(this.fls, 'ok', lang.hitch(this, function(items){
          if(items.length === 0){
            return;
          }
          var item = items[0];
          if(item.definition){
            try{
              item.definition.name = item.name;
              item.definition.url = item.url;
              this.emit('ok', item);
            }
            catch(e){
              console.error(e);
            }
          }
          else{
            this.loading.show();
            esriRequest({
              url: item.url,
              content: {f:'json'},
              handleAs: 'json',
              callbackParamName: 'callback'
            }).then(lang.hitch(this, function(response){
              if(!this.domNode){
                return;
              }
              this.loading.hide();
              item.definition = response;
              try{
                item.definition.name = item.name;
                item.definition.url = item.url;
                this.emit('ok', item);
              }
              catch(e){
                console.error(e);
              }
            }), lang.hitch(this, function(err){
              console.error(err);
              if(!this.domNode){
                return;
              }
              this.loading.hide();
            }));
          }
        })));
  
        this.own(on(this.fls, 'cancel', lang.hitch(this, function(){
          try{
            this.emit('cancel');
          }
          catch(e){
            console.error(e);
          }
        })));
      },
  
      _initLoading: function(){
        this.loading = new LoadingIndicator({
          hidden: true
        });
        this.loading.placeAt(this.domNode);
        this.loading.startup();
      }
  
    });
  });