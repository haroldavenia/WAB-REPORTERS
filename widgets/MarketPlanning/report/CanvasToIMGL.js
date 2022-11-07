/*
 * Print Maps - High-resolution maps in the browser, for printing
 * Copyright (c) 2019-2022 Harold Avenia
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/Deferred',
    'dojo/dom-geometry',
    './html2canvas'
  ], function (
    declare,
    lang,
    Deferred,
    domGeom,
    html2canvas
  ) {
    return declare(null, {
        element: null,
        errors: null,
        unit: null,
        dpi: null,
        type: null,
        bufferPX: null,
        width: null,
        height: null,
        widthPixels: null,
        heightPixels: null,
        maxSize: null,
    
        constructor: function(element, options){
            let defaultOptions = {
                unit : 'in',
                dpi: 300,
                type: "image/png",
                buffer: 40,
                width: 750
            };
            
            options = Object.assign(defaultOptions, options);
            this.element = element;
            const canvas = document.createElement("canvas");
            const gl = canvas.getContext('experimental-webgl');
            this.maxSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
            this.type = options.type;
            this.width= options.width; 
            this.errors = {
                width: {
                    state: false,
                    msg: 'Width must be a positive number!',
                    grp: 'width_error'
                },
                height: {
                    state: false,
                    grp: 'height_error'
                },
                dpi: {
                    state: false,
                    msg: 'DPI must be a positive number!',
                    grp: 'dpi_error'
                }
            };

            if (options.unit !== 'in' && options.unit !== 'mm')  throw new CustomError("options_error", 'Unit is different to in or mm');
            this.unit = options.unit;
            if (!Number(options.dpi))  throw new CustomError("options_error", 'Dpi is not a Number');
            this.dpi = Number(options.dpi);
           
        },

        handleErrors: function() {
            let errorMsg = null;
            for (var e in this.errors) {
                e = this.errors[e];
                if (e.state) {
                    errorMsg = {name: e.grp, message: e.msg}
                    break;
                }
            }

            return errorMsg;
        },
        
        valErrorDpi: function() {
            if (this.dpi > 0) {
                this.errors.dpi.state = false;
            } else {
                this.errors.dpi.state = true;
            }
        },

        /**
        * crop images base64
        * @param {String} dataURI - image base64
        * @param {Number} width - length width in pixels of area to be cropped
        * @param {Number} height - length height in pixels of area to be cropped
        * @param {obj} options - options settings
        * @return {obj} - new base64 image cropped
        */
        getURLtoImageFile: function (dataURI, width, height, options) {
            //required, dataURI, width, height
            
            ////////////////////////////////////////////////////////////////////////////////
            // initialize default options
            ////////////////////////////////////////////////////////////////////////////////
            /**
            * options params
            * @param {String} type - format image
            * @param {Number} quality - quality range 0.0 to 1.0 
            */
            let defaultOptions = {
                type: "image/jpeg",
                quality: 1.0,
            };
        
            options = Object.assign(defaultOptions, options);
        
            var deferred = new Deferred();
            try {
                let { type, quality } = options;
                let image,
                context,
                result,
                canvas = document.createElement("canvas");
                
                // create image object and set with base64
                image = new Image();
                image.src = dataURI;
                
                image.onload = () => {
                    canvas.style.border = '0px solid #000';
                    context = canvas.getContext("2d");
                    // define new width canvas area with currrent dpi
                    canvas.width = width;
                    canvas.height = height;
                    result = canvas.toDataURL(type, quality);
                    deferred.resolve({
                        base64: result
                    });
                };
            } catch (err) {
                console.log(err);
                deferred.reject(err);
            } 
            
            return deferred.promise;
        },


        GetImageFile: function(id) {
            var deferred = new Deferred();
            this.valErrorDpi();
            const isError = this.handleErrors();

            if (isError) {
                throw new CustomError(isError.name, isError.message);
            }

            const contentBox = domGeom.getContentBox(this.element);
            this.heightPixels = (contentBox.h * this.width)/contentBox.w;

            this.createCanvasImg(id, this.element, this.dpi, this.width, this.heightPixels, this.type).then(function(res) {
                deferred.resolve(res);
            }, function(err) {
                console.log(err);
                deferred.reject(err);
            });
            return deferred.promise;
        },
        
        createCanvasImg: function(id, element, dpi, width, height, type) {
            var deferred = new Deferred();
            // Calculate pixel ratio
            const actualPixelRatio = window.devicePixelRatio;
            Object.defineProperty(window, 'devicePixelRatio', {
                get: function() {return dpi / 96}
            });

            width = width * window.devicePixelRatio;
            height = height * window.devicePixelRatio;

            try {
                // Create map container
                let canvas = element;
                html2canvas(canvas, {
                    removeContainer: true,
                    useCORS: true,
                    scale: window.devicePixelRatio
                }).then(lang.hitch(this, function(canvasClip){
                    const base64 = canvasClip.toDataURL(type, 1.0);
                    Object.defineProperty(window, 'devicePixelRatio', {
                        get: function() {return actualPixelRatio}
                    });
                    deferred.resolve({src: base64, width: canvasClip.width, height:canvasClip.height});
                }), function(err) {
                    Object.defineProperty(window, 'devicePixelRatio', {
                        get: function() {return actualPixelRatio}
                    });
                    console.log(err);
                    deferred.reject(err);
                });
            } catch (err) {
                Object.defineProperty(window, 'devicePixelRatio', {
                    get: function() {return actualPixelRatio}
                });
                console.log(err);
                deferred.reject(err);
            }
            return deferred.promise;
        }
    });
});

