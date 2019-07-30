// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/// <reference path="..\..\Scripts\typings\jquery\jquery.d.ts"/>
/// <reference path="..\..\Scripts\typings\jqueryui\jqueryui.d.ts"/>
declare var BMAExt: any;
declare var InteractiveDataDisplay: any;

(function ($) {
    $.widget("BMA.drawingsurface", {
        _plot: null,
        _gridLinesPlot: null,
        _svgPlot: null,
        _lightSvgPlot: null,
        _rectsPlot: null,
        _dragService: null,
        //_zoomObservable: undefined,
        _zoomObs: undefined,
        _onlyZoomEnabled: false,
        _mouseMoves: null,
        _domPlot: null,
        _zoomPlot: null,

        _bmaGesturesStream: null,
        _bmaZoomGesturesStream: null,

        _logoContainer: undefined,
        _versionContainer: undefined,

        options: {
            isNavigationEnabled: true,
            svg: undefined,
            zoom: 50,
            dropFilter: ["drawingsurface-droppable"],
            useContraints: true,
            showLogo: false,
            version: "1.0.0.0"
        },

        _plotSettings: {
            MinWidth: 0.01,
            MaxWidth: 1e5
        },

        _checkDropFilter: function (ui) {
            if (this.options !== undefined && this.options.dropFilter !== undefined) {
                var classes = this.options.dropFilter;
                for (var i = 0; i < classes.length; i++) {
                    if (ui.hasClass(classes[i]))
                        return true;
                }
            }

            return false;
        },


        _svgLoaded: function () {
            if (this.options.svg !== undefined && this._svgPlot !== undefined) {
                this._svgPlot.svg.clear();
                this._svgPlot.svg.add(this.options.svg);
            }
        },

        _lightSvgLoaded: function () {
            if (this.options.lightSvg !== undefined && this._lightSvgPlot !== undefined) {
                this._lightSvgPlot.svg.configure({ "pointer-events": "none" }, false);
                this._lightSvgPlot.svg.clear();
                //this._lightSvgPlot.svg.add(this.options.svg);
            }
        },

        _create: function () {
            var that = this;



            if (window.PlotSettings !== undefined) {
                this._plotSettings = window.PlotSettings;
            }

            //this._zoomObs = undefined;
            //this._zoomObservable = Rx.Observable.create(function (rx) {
            //    that._zoomObs = rx;
            //});

            var plotDiv = $("<div></div>").width(this.element.width()).height(this.element.height()).attr("data-idd-plot", "plot").appendTo(that.element);
            var gridLinesPlotDiv = $("<div></div>").attr("data-idd-plot", "scalableGridLines").appendTo(plotDiv);
            var rectsPlotDiv = $("<div></div>").attr("data-idd-plot", "rectsPlot").appendTo(plotDiv);
            var zoomPlotDiv = $("<div></div>").attr("data-idd-plot", "zoomPlot").attr("data-idd-name", "zoom-plot").appendTo(plotDiv);

            var logoСontainer1 = $("<div></div>").height("100%").appendTo(plotDiv);
            var logoСontainer2 = $("<div></div>").height("100%").css("position", "relative").appendTo(logoСontainer1);

            var logo = $("<div></div>").addClass("bma-logo-watermark").appendTo(logoСontainer2);
            that._versionContainer = $("<div></div>").addClass("bma-logo-version").text(that.options.version).appendTo(logoСontainer2);

            that._logoContainer = logoСontainer1;
            if (that.options.showLogo == false)
                that._logoContainer.hide();



            var svgPlotDiv2 = $("<div></div>").attr("data-idd-plot", "svgPlot").appendTo(plotDiv);
            var domPlotDiv = $("<div></div>").attr("data-idd-plot", "dom").appendTo(plotDiv);
            var svgPlotDiv = $("<div></div>").attr("data-idd-plot", "svgPlot").appendTo(plotDiv);


            this.lightSVGDiv = svgPlotDiv2;

            //empty div for event handling
            //$("<div></div>").attr("data-idd-plot", "plot").appendTo(plotDiv);

            that._plot = InteractiveDataDisplay.asPlot(plotDiv);
            this._plot.aspectRatio = 1;

            var zoomPlot = that._plot.get("zoom-plot");
            this._zoomPlot = zoomPlot;
            this._zoomPlot.order = InteractiveDataDisplay.MaxInteger;
            zoomPlotDiv.css("z-index", '');
            this._zoomPlot.minZoomWidth = 0.01;
            this._zoomPlot.maxZoomWidth = 1e5;
            this._zoomPlot.minZoomHeight = 0.01;
            this._zoomPlot.maxZoomHeight = 1e5;

            var svgPlot = that._plot.get(svgPlotDiv[0]);
            this._svgPlot = svgPlot;
            this._svgPlot.order = InteractiveDataDisplay.MaxInteger;
            svgPlotDiv.css("z-index", '');
            //this._svgPlot.IsAutomaticSizeUpdate = false;

            var lightSvgPlot = that._plot.get(svgPlotDiv2[0]);
            this._lightSvgPlot = lightSvgPlot;
            this._lightSvgPlot.order = InteractiveDataDisplay.MaxInteger;
            svgPlotDiv2.css("z-index", '');

            this._domPlot = that._plot.get(domPlotDiv[0]);

            this._rectsPlot = that._plot.get(rectsPlotDiv[0]);
            //rectsPlot.draw({ rects: [{ x: 0, y: 0, width: 500, height: 500, fill: "red" }] })
            this._rectsPlot.order = InteractiveDataDisplay.MaxInteger;
            rectsPlotDiv.css("z-index", '');
            if (this.options.svg !== undefined) {
                if (svgPlot.svg === undefined) {
                    svgPlot.host.on("svgLoaded", this._svgLoaded);
                } else {
                    svgPlot.svg.clear();
                    svgPlot.svg.add(this.options.svg);
                }
            }

            if (lightSvgPlot.svg === undefined) {
                lightSvgPlot.host.on("svgLoaded", this._lightSvgLoaded);
            } else {
                //lightSvgPlot.svg.configure({ style: "pointer-events:none;" }, false);
                lightSvgPlot.svg.clear();
                if (this.options.lightSvg !== undefined)
                    lightSvgPlot.svg.add(this.options.lightSvg);
            }

            that._bmaGesturesStream = InteractiveDataDisplay.Gestures.getGesturesStream(that._plot.host);
            that._bmaZoomGesturesStream = that._bmaGesturesStream.where(function (g) {
                var constraint = g.Type === "Zoom";
                return constraint;
            });

            plotDiv.droppable({
                drop: function (event, ui) {
                    var e = <MouseEvent>event;

                    event.stopPropagation();
                    if (!that._checkDropFilter(ui.draggable))
                        return;
                    var cs = svgPlot.getScreenToDataTransform();
                    var position = {
                        x: cs.screenToDataX(e.pageX - plotDiv.offset().left),
                        y: -cs.screenToDataY(e.pageY - plotDiv.offset().top),
                        screenX: e.pageX - plotDiv.offset().left,
                        screenY: e.pageY - plotDiv.offset().top
                    };
                    if (that.options.isNavigationEnabled !== true) {
                        that._executeCommand("DrawingSurfaceClick", position);
                    }

                    that._executeCommand("DrawingSurfaceDrop", position);
                }
            });


            plotDiv.bind("click touchstart", function (arg) {
                var cs = svgPlot.getScreenToDataTransform();

                if (arg.originalEvent !== undefined) {
                    arg = <any>arg.originalEvent;
                }

                var commandName = arg.shiftKey ? "DrawingSurfaceShiftClick" : "DrawingSurfaceClick";

                that._executeCommand(commandName,
                    {
                        x: cs.screenToDataX(arg.pageX - plotDiv.offset().left),
                        y: -cs.screenToDataY(arg.pageY - plotDiv.offset().top),
                        screenX: arg.pageX - plotDiv.offset().left,
                        screenY: arg.pageY - plotDiv.offset().top
                    });
            });

            //var timer = 0;
            //var delay = 200;
            //var prevent = false;

            //plotDiv.bind("click touchstart", function (arg) {
            //    timer = setTimeout(() => {
            //        if (!prevent) {
            //            var cs = svgPlot.getScreenToDataTransform();

            //            if (arg.originalEvent !== undefined) {
            //                arg = <any>arg.originalEvent;
            //            }

            //            that._executeCommand("DrawingSurfaceClick",
            //                {
            //                    x: cs.screenToDataX(arg.pageX - plotDiv.offset().left),
            //                    y: -cs.screenToDataY(arg.pageY - plotDiv.offset().top),
            //                    screenX: arg.pageX - plotDiv.offset().left,
            //                    screenY: arg.pageY - plotDiv.offset().top
            //                });
            //        }
            //        prevent = false;
            //    }, delay);
            //});

            //plotDiv.dblclick(function (arg) {
            //    clearTimeout(timer);
            //    prevent = true;

            //    var cs = svgPlot.getScreenToDataTransform();

            //    if (arg.originalEvent !== undefined) {
            //        arg = <any>arg.originalEvent;
            //    }

            //    that._executeCommand("DrawingSurfaceDoubleClick",
            //        {
            //            x: cs.screenToDataX(arg.pageX - plotDiv.offset().left),
            //            y: -cs.screenToDataY(arg.pageY - plotDiv.offset().top),
            //            screenX: arg.pageX - plotDiv.offset().left,
            //            screenY: arg.pageY - plotDiv.offset().top
            //        });
            //});

            //Subject that converts input mouse events into Pan gestures 
            var createPanSubject = function (vc) {

                var _doc = $(document);

                var mouseDown = Rx.Observable.fromEvent<any>(vc, "mousedown");
                var mouseMove = Rx.Observable.fromEvent<any>(vc, "mousemove");
                var mouseUp = Rx.Observable.fromEvent<any>(_doc, "mouseup");

                var stopPanning = mouseUp;

                var mouseDrags = mouseDown.selectMany(function (md) {
                    var cs = svgPlot.getScreenToDataTransform();
                    var x0 = cs.screenToDataX(md.pageX - plotDiv.offset().left);
                    var y0 = -cs.screenToDataY(md.pageY - plotDiv.offset().top);

                    return mouseMove.select(function (mm) {
                        //var cs = svgPlot.getScreenToDataTransform();
                        var x1 = cs.screenToDataX(mm.pageX - plotDiv.offset().left);
                        var y1 = -cs.screenToDataY(mm.pageY - plotDiv.offset().top);

                        return { x0: x0, y0: y0, x1: x1, y1: y1, btn: md.button };

                    }).takeUntil(stopPanning);
                });


                var touchStart = Rx.Observable.fromEvent<any>(vc, "touchstart");
                var touchMove = Rx.Observable.fromEvent<any>(vc, "touchmove");
                var touchEnd = Rx.Observable.fromEvent<any>(_doc, "touchend");
                var touchCancel = Rx.Observable.fromEvent<any>(_doc, "touchcancel");

                var gestures = touchStart.selectMany(function (md) {
                    var cs = svgPlot.getScreenToDataTransform();
                    var x0 = cs.screenToDataX(md.originalEvent.pageX - plotDiv.offset().left);
                    var y0 = -cs.screenToDataY(md.originalEvent.pageY - plotDiv.offset().top);

                    return touchMove.takeUntil(touchEnd.merge(touchCancel)).select(function (tm) {
                        var x1 = cs.screenToDataX(tm.originalEvent.pageX - plotDiv.offset().left);
                        var y1 = -cs.screenToDataY(tm.originalEvent.pageY - plotDiv.offset().top);

                        return { x0: x0, y0: y0, x1: x1, y1: y1, btn: 0 };
                    });
                });

                return mouseDrags.merge(gestures);
            }

            var createDragStartSubject = function (vc, btnFilter, withShift) {
                var _doc = $(document);
                var mousedown = Rx.Observable.fromEvent<any>(vc, "mousedown").where(function (md) {
                    return md.button === btnFilter && !md.shiftKey || withShift && md.shiftKey && md.button === 0;
                });
                var mouseMove = Rx.Observable.fromEvent<any>(vc, "mousemove");
                var mouseUp = Rx.Observable.fromEvent<any>(_doc, "mouseup");

                var stopPanning = mouseUp;

                var dragStarts = mousedown.selectMany(function (md) {
                    var cs = svgPlot.getScreenToDataTransform();
                    var x0 = cs.screenToDataX(md.pageX - plotDiv.offset().left);
                    var y0 = -cs.screenToDataY(md.pageY - plotDiv.offset().top);

                    return mouseMove.select(function (mm) { return { x: x0, y: y0 }; }).first().takeUntil(mouseUp);
                });


                var touchStart = Rx.Observable.fromEvent<any>(vc, "touchstart");
                var touchMove = Rx.Observable.fromEvent<any>(vc, "touchmove");
                var touchEnd = Rx.Observable.fromEvent<any>(_doc, "touchend");
                var touchCancel = Rx.Observable.fromEvent<any>(_doc, "touchcancel");

                var touchDragStarts = touchStart.selectMany(function (md) {
                    var cs = svgPlot.getScreenToDataTransform();
                    var x0 = cs.screenToDataX(md.originalEvent.pageX - plotDiv.offset().left);
                    var y0 = -cs.screenToDataY(md.originalEvent.pageY - plotDiv.offset().top);

                    return touchMove.select(function (mm) { return { x: x0, y: y0 }; }).first().takeUntil(touchEnd.merge(touchCancel));
                });

                return dragStarts.merge(touchDragStarts);
            }

            var createDragEndSubject = function (vc) {
                var _doc = $(document);
                var mousedown = Rx.Observable.fromEvent<any>(that._plot.centralPart, "mousedown");
                var mouseMove = Rx.Observable.fromEvent<any>(vc, "mousemove");
                var mouseUp = Rx.Observable.fromEvent<any>(_doc, "mouseup");

                var touchEnd = Rx.Observable.fromEvent<any>(_doc, "touchend");
                var touchCancel = Rx.Observable.fromEvent<any>(_doc, "touchcancel");

                var stopPanning = mouseUp.merge(touchEnd).merge(touchCancel);

                var dragEndings = stopPanning;//.takeWhile(mouseMove);

                return dragEndings;
            }

            this._dragService = {
                dragStart: createDragStartSubject(that._plot.centralPart, 0, false),
                dragStartRight: createDragStartSubject(that._plot.centralPart, 2, true),
                drag: createPanSubject(that._plot.centralPart),
                dragEnd: createDragEndSubject(that._plot.centralPart)
            };

            /*
            this._dragService.dragStart.subscribe(function () {
                svgPlotDiv2.css("z-index", InteractiveDataDisplay.ZIndexDOMMarkers + 10);
            });

            this._dragService.dragEnd.subscribe(function () {
                svgPlotDiv2.css("z-index", '');
            });
            */

            this._mouseMoves = Rx.Observable.fromEvent<any>(that._plot.centralPart, "mousemove").select(function (mm) {

                var cs = svgPlot.getScreenToDataTransform();
                var x0 = cs.screenToDataX(mm.originalEvent.pageX - plotDiv.offset().left);
                var y0 = -cs.screenToDataY(mm.originalEvent.pageY - plotDiv.offset().top);

                return {
                    x: x0,
                    y: y0
                };
            });


            this._gridLinesPlot = that._plot.get(gridLinesPlotDiv[0]);
            this._gridLinesPlot.order = InteractiveDataDisplay.MaxInteger;
            gridLinesPlotDiv.css("z-index", '');
            var yDT = new InteractiveDataDisplay.DataTransform(
                function (x) {
                    return -x;
                },
                function (y) {
                    return -y;
                },
                undefined);

            this._plot.yDataTransform = yDT;

            /*
            this._domPlot.yDataTransform = new InteractiveDataDisplay.DataTransform(
                function (x) {
                    return x;
                },
                function (y) {
                    return y;
                },
                undefined);
            */

            var width = 1600;
            that.options.zoom = width;

            if (this.options.isNavigationEnabled) {
                this._setGestureSource(this._onlyZoomEnabled);
            } else {
                that._plot.navigation.gestureSource = undefined;
            }

            that._plot.navigation.setVisibleRect({ x: 0, y: -50, width: width, height: width / 2.5 }, false);
            that._plot.host.bind("visibleRectChanged", function (args) {

                var plotRect = that._plot.visibleRect;

                var minRect = that._zoomPlot.getActualMinRect();
                var maxRect = that._zoomPlot.getActualMaxRect();
                var widthCoef = 100 * (that._plot.visibleRect.width - minRect.width) / (maxRect.width - minRect.width);

                that._executeCommand("ZoomSliderBind", widthCoef);
            })

            $(window).resize(function () { that.resize(); });
            that.resize();
            this.refresh();
        },

        resize: function () {
            if (this._plot !== null && this._plot !== undefined) {
                this._plot.host.width(this.element.width());
                this._plot.host.height(this.element.height());
                this._plot.requestUpdateLayout();
            }
        },

        _executeCommand: function (commandName, args) {
            if (this.options.commands !== undefined) {
                this.options.commands.Execute(commandName, args);
            } else {
                window.Commands.Execute(commandName, args);
            }
        },

        _setOption: function (key, value) {
            var that = this;
            switch (key) {
                case "svg":
                    if (this._svgPlot !== undefined && this._svgPlot.svg !== undefined) {
                        this._svgPlot.svg.clear();
                        if (value !== undefined) {
                            this._svgPlot.svg.add(value);
                        }
                    }
                    break;
                case "lightSvg":
                    if (this._lightSvgPlot !== undefined && this._lightSvgPlot.svg !== undefined) {
                        this._lightSvgPlot.svg.clear();
                        if (value !== undefined) {
                            this._lightSvgPlot.svg.add(value);
                        } 
                    }
                    break;
                case "isNavigationEnabled":
                    if (value === true) {
                        if (this._onlyZoomEnabled === true) {
                            this._setGestureSource(false);
                            this._onlyZoomEnabled = false;
                        }
                    } else {
                        this._setGestureSource(true);
                        this._onlyZoomEnabled = true;
                    }
                    break;
                case "grid":
                    if (value !== undefined) {
                        this._gridLinesPlot.x0 = value.x0;
                        this._gridLinesPlot.y0 = value.y0;
                        this._gridLinesPlot.xStep = value.xStep;
                        this._gridLinesPlot.yStep = value.yStep;
                        this._plot.requestUpdateLayout();
                    }
                    break;
                case "zoom":
                    if (value !== undefined) {
                        var oldPlotRect = that._plot.visibleRect;
                        var xCenter = oldPlotRect.x + oldPlotRect.width / 2;
                        var yCenter = oldPlotRect.y + oldPlotRect.height / 2;

                        var minRect = that._zoomPlot.getActualMinRect();
                        var maxRect = that._zoomPlot.getActualMaxRect();

                        var newWidth = value * (maxRect.width - minRect.width) / 100 + minRect.width;
                        var newHeight = value * (maxRect.height - minRect.height) / 100 + minRect.height;
                        var plotRect = {
                            x: xCenter - newWidth / 2,
                            y: yCenter - newHeight / 2,
                            width: newWidth,
                            height: newHeight
                        };

                        that.options.zoom = value;
                        that._plot.navigation.setVisibleRect(plotRect, true);
                    }
                    break;
                case "visibleRect":
                    if (value !== undefined) {
                        that._plot.navigation.setVisibleRect({ x: value.x, y: -value.y - value.height, width: value.width, height: value.height }, false);
                    }
                    break;
                case "gridVisibility":
                    this._gridLinesPlot.isVisible = value;
                    this._plot.requestUpdateLayout();
                    break;
                case "rects":
                    this._rectsPlot.draw({ rects: value });
                    this._plot.requestUpdateLayout();
                    break;
                case "plotConstraint":
                    this._plotSettings = value;
                    break;
                case "useContraints":
                    this._setGestureSource(this._onlyZoomEnabled);
                    break;
                case "minZoomWidth":
                    if (value !== undefined) {
                        this._zoomPlot.minZoomWidth = value;
                    }
                    break;
                case "maxZoomWidth":
                    if (value !== undefined) {
                        this._zoomPlot.maxZoomWidth = value;
                    }
                    break;
                case "minZoomHeight":
                    if (value !== undefined) {
                        this._zoomPlot.minZoomHeight = value;
                    }
                    break;
                case "maxZoomHeight":
                    if (value !== undefined) {
                        this._zoomPlot.maxZoomHeight = value;
                    }
                    break;
                case "version":
                    this._versionContainer.text(value);
                    break;
                case "showLogo":
                    if (value)
                        this._logoContainer.show();
                    else
                        this._logoContainer.hide();
                    break;
            }
            this._super(key, value);
        },

        _setGestureSource: function (onlyZoom) {
            var that = this;
            if (!onlyZoom) {
                this._plot.navigation.gestureSource = that._bmaGesturesStream;
            } else {
                this._plot.navigation.gestureSource = that._bmaZoomGesturesStream;
            }
        },

        _setOptions: function (options) {
            this._super(options);
            this.refresh();
        },

        refresh: function () {

        },

        _constrain: function (value) {
            return value;
        },

        destroy: function () {
            this.element.empty();
        },

        getDragSubject: function () {
            return this._dragService;
        },

        getMouseMoves: function () {
            return this._mouseMoves;
        },

        getPlotX: function (left: number) {
            var cs = this._svgPlot.getScreenToDataTransform();
            return cs.screenToDataX(left);
        },

        getPlotY: function (top: number) {
            var cs = this._svgPlot.getScreenToDataTransform();
            return -cs.screenToDataY(top);
        },

        getLeft: function (x: number) {
            var cs = this._svgPlot.getTransform();
            return cs.dataToScreenX(x);
        },

        getTop: function (y: number) {
            var cs = this._svgPlot.getTransform();
            return -cs.dataToScreenY(y);
        },

        getPixelWidth: function () {
            var cs = this._svgPlot.getScreenToDataTransform();
            return cs.screenToDataX(1) - cs.screenToDataX(0);
        },

        getZoomSubject: function () {
            return this._zoomService;
        },

        setCenter: function (p) {
            var plotRect = this._plot.visibleRect;
            this._plot.navigation.setVisibleRect({ x: p.x - plotRect.width / 2, y: p.y - plotRect.height / 2, width: plotRect.width, height: plotRect.height }, false);
        },

        getSVG: function () {
            return this._svgPlot.svg;
        },

        getSecondarySVG: function () {
            return this._lightSvgPlot.svg;
        },

        getCentralPart: function () {
            return this._domPlot;
        },

        updateLayout: function () {
            var host = this._plot.host;
            if (host.width() !== this.element.width() || host.height() !== this.element.height()) {
                var plotRect = this._plot.visibleRect;
                var center = {
                    x: plotRect.x + plotRect.width / 2,
                    y: plotRect.y + plotRect.height / 2
                };
                this._plot.host.width(this.element.width()).height(this.element.height());
                this._plot.updateLayout();
                plotRect = this._plot.visibleRect;
                this._plot.navigation.setVisibleRect({ x: center.x - plotRect.width / 2, y: center.y - plotRect.height / 2, width: plotRect.width, height: plotRect.height }, false);
            }

            this._plot.updateLayout();
            //this._domPlot.updateLayout();
        },

        setConstraint: function (constraint) {
            this._plot.visibleRectConstraint = constraint;
        },

        //_clickProagator: function (event) {
        //    alert("click!");
        //},

        moveDraggableSvgOnTop: function () {
            this._lightSvgPlot.host.css("z-index", InteractiveDataDisplay.ZIndexDOMMarkers + 10);
            //this._lightSvgPlot.host.on("click", this._clickProagator);

        },

        moveDraggableSvgOnBottom: function () {
            this._lightSvgPlot.host.css("z-index", '');
            //this._lightSvgPlot.host.off("click", this._clickProagator);
        },
    });
}(jQuery));

interface JQuery {
    drawingsurface(): any;
    drawingsurface(settings: Object): any;
    drawingsurface(methodName: string, arg: any): any;
}
