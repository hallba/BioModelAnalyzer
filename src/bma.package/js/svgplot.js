// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
(function (BMAExt, InteractiveDataDisplay, $, undefined) {

    BMAExt.SVGPlot = function (jqDiv, master) {
        this.base = InteractiveDataDisplay.Plot;
        this.base(jqDiv, master);
        var that = this;

        var _svgCnt = undefined;
        var _svg = undefined;

        var _isAutomaticSizeUpdate = true;

        Object.defineProperty(this, "svg", {
            get: function () {
                return _svg;
            },
        });

        Object.defineProperty(this, "IsAutomaticSizeUpdate", {
            get: function () {
                return _isAutomaticSizeUpdate;
            },
            set: function (value) {
                _isAutomaticSizeUpdate = value;
                that.master.requestUpdateLayout();
            }
        });

        this.computeLocalBounds = function () {
            var _bbox = undefined;
            if (_svg === undefined)
                return undefined;
            else {
                //return _svg._svg.getBBox();
                return _bbox;
            }
        };

        var svgLoaded = function (svg) {
            _svg = svg;

            svg.configure({
                width: _svgCnt.width(),
                height: _svgCnt.height(),
                viewBox: "0 0 1 1",
                preserveAspectRatio: "none"
            }, true);

            that.host.trigger("svgLoaded");
        };

        var plotToSvg = function (y, plotRect) {
            return (y - (plotRect.y + plotRect.height / 2)) * (-1) + plotRect.y + plotRect.height / 2;
        }

        this.setSVGScreenSize = function (sizeToSet) {
            _svgCnt.width(finalRect.width).height(finalRect.height);
            _svg.configure({
                width: _svgCnt.width(),
                height: _svgCnt.height()
            }, false);
        }

        this.arrange = function (finalRect) {
            InteractiveDataDisplay.CanvasPlot.prototype.arrange.call(this, finalRect);

            if (_svgCnt === undefined) {
                _svgCnt = $("<div></div>").css("overflow", "hidden").appendTo(that.host);
                _svgCnt.width(finalRect.width).height(finalRect.height);
                _svgCnt.svg({ onLoad: svgLoaded });
            }

            var sizeChanged = false;
            if (_isAutomaticSizeUpdate) {
                sizeChanged = _svgCnt.width() !== finalRect.width || _svgCnt.height() !== finalRect.height;
                if (sizeChanged) {
                    _svgCnt.width(finalRect.width).height(finalRect.height);
                }
            }

            if (_svg !== undefined) {
                var plotRect = that.visibleRect;
                if (_isAutomaticSizeUpdate && sizeChanged) {
                    _svg.configure({
                        width: _svgCnt.width(),
                        height: _svgCnt.height()
                    }, false);
                }

                if (!isNaN(plotRect.y) && !isNaN(plotRect.height)) {
                    _svg.configure({
                        viewBox: plotRect.x + " " + (-plotRect.y - plotRect.height) + " " + plotRect.width + " " + plotRect.height,
                    }, false);
                }
            }
        };

        // Gets the transform functions from data to screen coordinates.
        // Returns { dataToScreenX, dataToScreenY }
        this.getTransform = function () {
            var ct = this.coordinateTransform;
            var plotToScreenX = ct.plotToScreenX;
            var plotToScreenY = ct.plotToScreenY;
            var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
            var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
            var dataToScreenX = dataToPlotX ? function (x) { return plotToScreenX(dataToPlotX(x)); } : plotToScreenX;
            var dataToScreenY = dataToPlotY ? function (y) { return plotToScreenY(dataToPlotY(y)); } : plotToScreenY;

            return { dataToScreenX: dataToScreenX, dataToScreenY: dataToScreenY, plotToScreenWidth: ct.plotToScreenWidth, plotToScreenHeight: ct.plotToScreenHeight };
        };

        // Gets the transform functions from screen to data coordinates.
        // Returns { screenToDataX, screenToDataY }
        this.getScreenToDataTransform = function () {
            var ct = this.coordinateTransform;
            var screenToPlotX = ct.screenToPlotX;
            var screenToPlotY = ct.screenToPlotY;
            var plotToDataX = this.xDataTransform && this.xDataTransform.plotToData;
            var plotToDataY = this.yDataTransform && this.yDataTransform.plotToData;
            var screenToDataX = plotToDataX ? function (x) { return plotToDataX(screenToPlotX(x)); } : screenToPlotX;
            var screenToDataY = plotToDataY ? function (y) { return plotToDataY(screenToPlotY(y)); } : screenToPlotY;

            return { screenToDataX: screenToDataX, screenToDataY: screenToDataY };
        };
    };
    BMAExt.SVGPlot.prototype = new InteractiveDataDisplay.Plot;
    InteractiveDataDisplay.register('svgPlot', function (jqDiv, master) { return new BMAExt.SVGPlot(jqDiv, master); });

    BMAExt.Kmeans = function (data, k) {
        this.k = k;
        this.data = data;

        // Keeps track of which cluster centroid index each data point belongs to.
        this.assignments = [];

        this.dataDimensionExtents = function () {
            data = data || this.data;
            var extents = [];

            for (var i = 0; i < data.length; i++) {
                var point = [data[i][0], data[i][1]]; //data[i];

                for (var j = 0; j < point.length; j++) {
                    if (!extents[j]) {
                        extents[j] = { min: 1000, max: 0 };
                    }

                    if (point[j] < extents[j].min) {
                        extents[j].min = point[j];
                    }

                    if (point[j] > extents[j].max) {
                        extents[j].max = point[j];
                    }
                }
            }

            return extents;
        }

        this.dataExtentRanges = function () {
            var ranges = [];

            for (var i = 0; i < this.extents.length; i++) {
                ranges[i] = this.extents[i].max - this.extents[i].min;
            }

            return ranges;
        };

        this.seeds = function () {
            var means = [];
            while (this.k--) {
                var mean = [];

                for (var i = 0; i < this.extents.length; i++) {
                    mean[i] = this.extents[i].min + (0.5 * this.ranges[i]); //this.extents[i].min + (Math.random() * this.ranges[i]);
                }

                means.push(mean);
            }

            return means;
        };

        this.assignClusterToDataPoints = function () {
            var assignments = [];

            for (var i = 0; i < this.data.length; i++) {
                var point = [this.data[i][0], this.data[i][1]];
                var distances = [];

                for (var j = 0; j < this.means.length; j++) {
                    var mean = this.means[j];
                    var sum = 0;

                    //Calc distance
                    for (var dim = 0; dim < point.length; dim++) {
                        var difference = point[dim] - mean[dim];
                        difference = Math.pow(difference, 2);
                        sum += difference;
                    }

                    distances[j] = Math.sqrt(sum);
                }

                // After calculating all the distances from the data point to each cluster centroid,
                // we pick the closest (smallest) distances.
                assignments[i] = distances.indexOf(Math.min.apply(null, distances));
            }

            return assignments;
        };

        function fillArray(length, val) {
            return Array.apply(null, Array(length)).map(function () { return val; });
        }

        this.moveMeans = function () {
            var sums = fillArray(this.means.length, 0);
            var counts = fillArray(this.means.length, 0);
            var moved = false;
            var i;
            var meanIndex;
            var dim;

            // Clear location sums for each dimension.
            for (i = 0; i < this.means.length; i++) {
                sums[i] = fillArray(this.means[i].length, 0);
            }

            // For each cluster, get sum of point coordinates in every dimension.
            for (var pointIndex = 0; pointIndex < this.assignments.length; pointIndex++) {
                meanIndex = this.assignments[pointIndex];
                var point = [this.data[pointIndex][0], this.data[pointIndex][1]]; //this.data[pointIndex];
                var mean = this.means[meanIndex];

                counts[meanIndex]++;

                for (dim = 0; dim < mean.length; dim++) {
                    sums[meanIndex][dim] += point[dim];
                }
            }

            /* If cluster centroid (mean) is not longer assigned to any points,
             * move it somewhere else randomly within range of points.
             */
            for (meanIndex = 0; meanIndex < sums.length; meanIndex++) {
                if (0 === counts[meanIndex]) {
                    sums[meanIndex] = this.means[meanIndex];

                    for (dim = 0; dim < this.extents.length; dim++) {
                        sums[meanIndex][dim] = this.extents[dim].min + (0.5 * this.ranges[dim]); //this.extents[dim].min + (Math.random() * this.ranges[dim]);
                    }
                    continue;
                }

                for (dim = 0; dim < sums[meanIndex].length; dim++) {
                    sums[meanIndex][dim] /= counts[meanIndex];
                    sums[meanIndex][dim] = Math.round(100 * sums[meanIndex][dim]) / 100;
                }
            }

            /* If current means does not equal to new means, then
             * move cluster centroid closer to average point.
             */
            if (this.means.toString() !== sums.toString()) {
                var diff;
                moved = true;

                // Nudge means 1/nth of the way toward average point.
                for (meanIndex = 0; meanIndex < sums.length; meanIndex++) {
                    for (dim = 0; dim < sums[meanIndex].length; dim++) {
                        diff = (sums[meanIndex][dim] - this.means[meanIndex][dim]);
                        if (Math.abs(diff) > 0.1) {
                            var stepsPerIteration = 10;
                            this.means[meanIndex][dim] += diff / stepsPerIteration;
                            this.means[meanIndex][dim] = Math.round(100 * this.means[meanIndex][dim]) / 100;
                        } else {
                            this.means[meanIndex][dim] = sums[meanIndex][dim];
                        }
                    }
                }
            }

            return moved;
        };

        this.run = function (relTable) {
            ++this.iterations;

            // Reassign points to nearest cluster centroids.
            this.assignments = this.assignClusterToDataPoints();

            // Returns true if the cluster centroids have moved location since the last iteration.
            var meansMoved = this.moveMeans();

            while (meansMoved) {
                ++this.iterations;
                this.assignments = this.assignClusterToDataPoints();
                meansMoved = this.moveMeans();
            }

            var clusters = [];
            var minDistance = +Infinity;
            for (var i = 0; i < this.means.length; i++) {
                clusters[i] = { mean: this.means[i], count: 0, values: [] };
            }


            var max = 0;
            for (var i = 0; i < this.assignments.length; i++) {
                clusters[this.assignments[i]].count++;
                clusters[this.assignments[i]].values.push(this.data[i]);

                if (clusters[this.assignments[i]].count > max) {
                    max = clusters[this.assignments[i]].count;
                }
            }

            for (var i = 0; i < clusters.length; i++) {
                if (i < clusters.length - 1) {
                    var c1 = clusters[i];
                    for (var j = i + 1; j < this.means.length; j++) {
                        var c2 = clusters[j];

                        //Calc distance
                        var sum = 0;
                        for (var dim = 0; dim < c2.mean.length; dim++) {
                            var difference = c2.mean[dim] - c1.mean[dim];
                            difference = Math.pow(difference, 2);
                            sum += difference;
                        }

                        var d = Math.sqrt(sum);
                        //check cluster sizes
                        d /= (c1.count + c2.count);
                        if (d < minDistance)
                            minDistance = d;
                    }
                }
            }

            //Finding clusters with connections between inner variables
            var clusterRelationships = [];

            var checkRelationshipsBetweenClusterVariables = function (c1, c2) {
                for (var c1i = 0; c1i < c1.values.length; c1i++) {
                    var val1 = c1.values[c1i][2];
                    for (var c2i = 0; c2i < c2.values.length; c2i++) {
                        var val2 = c2.values[c2i][2];

                        if (relTable[val1] !== undefined && relTable[val1][val2] === true)
                            return true;
                    }
                }

                return false;
            }

            for (var i = 0; i < clusters.length; i++) {
                var c1 = clusters[i];
                if (i < clusters.length - 1) {
                    for (var j = i + 1; j < clusters.length; j++) {
                        var c2 = clusters[j];

                        if (checkRelationshipsBetweenClusterVariables(c1, c2)) {
                            clusterRelationships.push({ c1: i, c2: j });
                        }
                    }
                }
            }

            //checking clusters stability
            for (var i = 0; i < clusters.length; i++) {
                var vv = clusters[i].values;
                var result = undefined;
                if (vv.length > 0) {
                    result = vv[0][5];
                    if (result !== undefined) {
                        for (var j = 1; j < vv.length; j++) {
                            if (!vv[j][5]) {
                                result = false;
                                break;
                            }
                        }
                    }
                }
                clusters[i].stability = result;
            }

            return { clusters: clusters, minDistance: minDistance, maxCount: max, relationships: clusterRelationships };
        };

        // Get the extents (min,max) for the dimensions.
        this.extents = this.dataDimensionExtents();

        // Get the range of the dimensions.
        this.ranges = this.dataExtentRanges();

        // Generate random cluster centroid points.
        this.means = this.seeds();
    }

    BMAExt.ModelCanvasPlot = function (jqDiv, master) {
        this.base = InteractiveDataDisplay.CanvasPlot;
        this.base(jqDiv, master);
        var that = this;

        var stableImage = new Image();
        stableImage.src = 'images/analysis/stable.png';

        var failedImage = new Image();
        failedImage.src = 'images/analysis/failed.png';

        var _canvas = undefined;
        var _localBB = undefined;
        var _baseGrid = undefined;

        var circles = [];
        var circleConnections = [];
        var minClusterDistance = 0;
        var proofLabelSize = 0;

        this.draw = function (data) {
            _canvas = data.canvas;
            _localBB = data.bbox;
            _baseGrid = data.grid;

            circles = [];
            circleConnections = [];
            if (data.variableVectors !== undefined && data.variableVectors.length > 0) {
                var clusterNumber = 1 + Math.floor(Math.sqrt(0.5 * data.variableVectors.length));
                var km = new BMAExt.Kmeans(data.variableVectors, clusterNumber);
                var clustersInfo = km.run(data.relationshipsTable);
                var clusters = clustersInfo.clusters;

                var norm = Math.max(_localBB.width, _localBB.height);
                var minDistance = clustersInfo.minDistance * norm;
                minClusterDistance = minDistance;

                var minElem = 0;
                for (var i = 0; i < clusters.length; i++) {
                    var cnt = clusters[i];

                    if (minElem > cnt.values.length || i === 0) {
                        minElem = cnt.values.length;
                    }

                    var points = [];
                    for (var j = 0; j < cnt.values.length; j++) {
                        var p = cnt.values[j];
                        points.push({
                            x: p[0] * norm + _localBB.x,
                            y: p[1] * norm + _localBB.y,
                            color: p[3]
                        });
                    }
                    var c = {
                        x: cnt.mean[0] * norm + _localBB.x,
                        y: cnt.mean[1] * norm + _localBB.y,
                        points: points,
                        rad: minDistance * cnt.count,
                        rad2: 0.5 * minDistance,
                        name: cnt.values.length > 0 ? cnt.values[0][4] : "no name",
                        isStable: clusters[i].stability
                    };
                    circles.push(c);
                }
                if (minElem < 1) {
                    minElem = 1;
                }
                proofLabelSize = minElem * minClusterDistance;

                for (var i = 0; i < clustersInfo.relationships.length; i++) {
                    var rel = clustersInfo.relationships[i];
                    circleConnections.push({
                        x1: circles[rel.c1].x,
                        x2: circles[rel.c2].x,
                        y1: circles[rel.c1].y,
                        y2: circles[rel.c2].y,
                    });
                }
            }

            this.invalidateLocalBounds();
            this.requestNextFrameOrUpdate();
            this.fireAppearanceChanged();
        }

        var _canvasSnapshot = undefined;
        this.setFrame = function (frame) {
            if (_canvasSnapshot !== undefined) {
                _canvasSnapshot.parentNode.removeChild(_canvasSnapshot);
            }

            _canvasSnapshot = frame;

            if (_canvasSnapshot !== undefined) {
                var cv = this.getContext(true).canvas;
                $(_canvasSnapshot).css("position", "absolute").css("top", 0).css("left", 0).insertBefore($(cv).parent());
            }
        };

        // Returns 4 margins in the screen coordinate system
        this.getLocalPadding = function () {
            return { left: 0, right: 0, top: 0, bottom: 0 };
        };

        this.renderCore = function (plotRect, screenSize) {
            InteractiveDataDisplay.Polyline.prototype.renderCore.call(this, plotRect, screenSize);

            if (_canvas === undefined || _localBB === undefined || _baseGrid === undefined)
                return;

            var context = this.getContext(true);

            var t = this.getTransform();
            var dataToScreenX = t.dataToScreenX;
            var dataToScreenY = t.dataToScreenY;

            // size of the canvas
            var w_s = screenSize.width;
            var h_s = screenSize.height;

            //scales
            var scaleX = (dataToScreenX(_baseGrid.xStep) - dataToScreenX(0)) / _baseGrid.xStep;
            var scaleY = (dataToScreenY(0) - dataToScreenY(_baseGrid.yStep)) / _baseGrid.yStep;

            var gridHeight = _baseGrid.yStep;
            var screengridHeight = dataToScreenY(0) - dataToScreenY(gridHeight);
            var minGridHeightMC = window.ViewSwitchSettings.ModelConstelationsEnd;
            var maxGridHeightMC = window.ViewSwitchSettings.ModelConstelationsStart;
            var gridHeightChangeDiffMC = maxGridHeightMC - minGridHeightMC;
            var zoomLevel = screengridHeight > maxGridHeightMC ? 0 : (screengridHeight < minGridHeightMC ? 1 : 1 - (screengridHeight - minGridHeightMC) / gridHeightChangeDiffMC);

            var op = context.globalAlpha;

            var modelAlpha = 1 - zoomLevel; //2 * (0.5 - zoomLevel);
            if (modelAlpha < 0) modelAlpha = 0;
            if (modelAlpha > 1) modelAlpha = 1;


            if (window.ViewSwitchMode === "Bubbles" || window.ViewSwitchMode === "Constelations") {
                modelAlpha = 0;
            } else if (window.ViewSwitchMode === "Model") {
                modelAlpha = 1;
            }

            if (_canvasSnapshot !== undefined) {
                _canvasSnapshot.style.opacity = modelAlpha;
                $(_canvasSnapshot).width(w_s);
                $(_canvasSnapshot).height(h_s);
            }

            if (modelAlpha > 0) {
                context.globalAlpha = modelAlpha;
                if (_canvasSnapshot === undefined) {
                    var realBBox = { x: dataToScreenX(_localBB.x), y: dataToScreenY(-_localBB.y), width: _localBB.width * scaleX, height: _localBB.height * scaleY };
                    context.drawImage(_canvas, realBBox.x, realBBox.y, realBBox.width, realBBox.height);
                }
            }

            var constelationsAlpha = 0;
            var bubblesAlpha = 0;
            if (zoomLevel < 1) {
                constelationsAlpha = zoomLevel;
            } else {
                var minGridHeight = window.ViewSwitchSettings.ConstelationsBubblesEnd;
                var maxGridHeight = window.ViewSwitchSettings.ConstelationsBubblesStart;
                var gridHeightChangeDiff = maxGridHeight - minGridHeight;

                var zoomLevel2 = screengridHeight > maxGridHeight ? 0 : (screengridHeight < minGridHeight ? 1 : 1 - (screengridHeight - minGridHeight) / gridHeightChangeDiff);

                constelationsAlpha = 1 - zoomLevel2;
                bubblesAlpha = zoomLevel2;
            }

            if (constelationsAlpha < 0) constelationsAlpha = 0;
            if (constelationsAlpha > 1) constelationsAlpha = 1;

            if (window.ViewSwitchMode === "Model" || window.ViewSwitchMode === "Bubbles") {
                constelationsAlpha = 0;
            } else if (window.ViewSwitchMode === "Constelations") {
                constelationsAlpha = 1;
            }

            if (constelationsAlpha > 0) {
                context.globalAlpha = constelationsAlpha;
                for (var i = 0; i < circles.length; i++) {
                    var c = circles[i];

                    var constRad = dataToScreenX(20) - dataToScreenX(0);

                    var x = dataToScreenX(c.x);
                    var y = dataToScreenY(-c.y);

                    //context.fillStyle = "blue";
                    //context.beginPath();
                    //context.arc(x, y, constRad, 0, 2 * Math.PI, false);
                    //context.fill();
                    var lineW = context.lineWidth;
                    context.lineWidth = 0.5;
                    var circleCoords = [];
                    for (var j = 0; j < c.points.length; j++) {
                        var pts = c.points[j];
                        var x1 = dataToScreenX(pts.x);
                        var y1 = dataToScreenY(-pts.y);

                        var vec = {
                            x: x1 - x,
                            y: y1 - y
                        };
                        var vecL = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
                        vec.x /= vecL;
                        vec.y /= vecL;

                        context.strokeStyle = "#333333"; //"#999999";
                        context.beginPath();
                        context.moveTo(x, y);
                        context.lineTo(x1 - vec.x * constRad, y1 - vec.y * constRad);
                        context.stroke();

                        circleCoords.push({ x: x1, y: y1 });
                    }
                    context.lineWidth = lineW;

                    for (var j = 0; j < c.points.length; j++) {
                        context.fillStyle = c.points[j].color;
                        context.beginPath();
                        context.arc(circleCoords[j].x, circleCoords[j].y, constRad, 0, 2 * Math.PI, false);
                        context.fill();
                    }
                }
            }

            //var bubblesAlpha = 0; //2 * zoomLevel - 1;
            if (bubblesAlpha < 0) bubblesAlpha = 0;
            if (bubblesAlpha > 1) bubblesAlpha = 1;

            if (window.ViewSwitchMode === "Model" || window.ViewSwitchMode === "Constelations") {
                bubblesAlpha = 0;
            } else if (window.ViewSwitchMode === "Bubbles") {
                bubblesAlpha = 1;
            }

            if (bubblesAlpha > 0) {
                context.globalAlpha = bubblesAlpha;
                context.lineWidth = scaleX;
                for (var i = 0; i < circleConnections.length; i++) {
                    var cc = circleConnections[i];

                    context.strokeStyle = "black";

                    //context.scale(cs.plotToScreenWidth(scale), cs.plotToScreenHeight(scale));

                    context.beginPath();
                    context.moveTo(dataToScreenX(cc.x1), dataToScreenY(-cc.y1));
                    context.lineTo(dataToScreenX(cc.x2), dataToScreenY(-cc.y2));
                    context.stroke();
                    //context.setTransform(1, 0, 0, 1, 0, 0);
                }
                context.lineWidth = 1;

                var imageSize = dataToScreenX(proofLabelSize) - dataToScreenX(0); //15;
                for (var i = 0; i < circles.length; i++) {
                    var c = circles[i];

                    var x = dataToScreenX(c.x);
                    var y = dataToScreenY(-c.y);
                    var rad = dataToScreenX(c.rad * 0.9) - dataToScreenX(0);

                    c.xScreen = x;
                    c.yScreen = y;
                    c.radScreen = rad;

                    context.fillStyle = "#9361F5"; //"#9400D3";
                    context.beginPath();
                    context.arc(x, y, rad, 0, 2 * Math.PI, false);
                    context.fill();

                    var offset = Math.cos(Math.PI / 4) * rad - imageSize * 0.5;
                    if (circles[i].isStable) {
                        context.drawImage(stableImage, x + offset, y + offset, imageSize, imageSize);
                    } else if (circles[i].isStable === false) {
                        context.drawImage(failedImage, x + offset, y + offset, imageSize, imageSize);
                    }
                }

                var labelSize = 10;
                var bubbleLableSize = 1.5 * labelSize; //Math.max(3 * labelSize, minClusterDistance);
                var screenBubbleLabelSize = bubbleLableSize; // * scaleY;
                var bubbleLabelOffset = 5; //in pixels
                var lebelXOffset = screenBubbleLabelSize; //in pixels
                var labelYOffset = screenBubbleLabelSize * 0.6; //in pixels
                //context.strokeStyle = "#CFCFCF";
                context.textBaseline = "bottom";
                for (var i = 0; i < circles.length; i++) {
                    var c = circles[i];

                    var x = c.xScreen;
                    var y = c.yScreen;
                    var rad = c.radScreen;

                    var label = c.name;
                    context.font = screenBubbleLabelSize + "px OpenSans";
                    var labelMeasure = context.measureText(label);
                    var labelWidth = labelMeasure.width;
                    var labelHeight = screenBubbleLabelSize;

                    context.fillStyle = "#d7d7ff"; //"#ccccff";
                    context.strokeStyle = "white";
                    BMA.SVGRendering.RenderHelper.roundRect(
                        context,
                        x - 0.5 * labelWidth - lebelXOffset,
                        y - rad - bubbleLabelOffset - labelHeight - 2 * labelYOffset,
                        labelWidth + 2 * lebelXOffset,
                        labelHeight + 2 * labelYOffset,
                        0.6 * (labelHeight + 2 * labelYOffset),
                        true, true);

                    context.strokeStyle = "#CFCFCF";
                    context.fillStyle = "#000000"; //"#333333";
                    context.fillText(label, x - 0.5 * labelWidth, y - rad - bubbleLabelOffset - labelYOffset);
                }
            }

            context.globalAlpha = op;
        }

        this.computeLocalBounds = function () {
            return undefined;
        };

        // Gets the transform functions from data to screen coordinates.
        // Returns { dataToScreenX, dataToScreenY }
        this.getTransform = function () {
            var ct = this.coordinateTransform;
            var plotToScreenX = ct.plotToScreenX;
            var plotToScreenY = ct.plotToScreenY;
            var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
            var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
            var dataToScreenX = dataToPlotX ? function (x) { return plotToScreenX(dataToPlotX(x)); } : plotToScreenX;
            var dataToScreenY = dataToPlotY ? function (y) { return plotToScreenY(dataToPlotY(y)); } : plotToScreenY;

            return { dataToScreenX: dataToScreenX, dataToScreenY: dataToScreenY };
        };

        // Gets the transform functions from screen to data coordinates.
        // Returns { screenToDataX, screenToDataY }
        this.getScreenToDataTransform = function () {
            var ct = this.coordinateTransform;
            var screenToPlotX = ct.screenToPlotX;
            var screenToPlotY = ct.screenToPlotY;
            var plotToDataX = this.xDataTransform && this.xDataTransform.plotToData;
            var plotToDataY = this.yDataTransform && this.yDataTransform.plotToData;
            var screenToDataX = plotToDataX ? function (x) { return plotToDataX(screenToPlotX(x)); } : screenToPlotX;
            var screenToDataY = plotToDataY ? function (y) { return plotToDataY(screenToPlotY(y)); } : screenToPlotY;

            return { screenToDataX: screenToDataX, screenToDataY: screenToDataY };
        };
    };
    BMAExt.ModelCanvasPlot.prototype = new InteractiveDataDisplay.CanvasPlot;
    InteractiveDataDisplay.register('modelCanvasPlot', function (jqDiv, master) { return new BMAExt.ModelCanvasPlot(jqDiv, master); });

    BMAExt.RectsPlot = function (div, master) {

        this.base = InteractiveDataDisplay.CanvasPlot;
        this.base(div, master);

        var _rects;

        this.draw = function (data) {
            _rects = data.rects;
            if (!_rects) _rects = [];

            this.invalidateLocalBounds();

            this.requestNextFrameOrUpdate();
            this.fireAppearanceChanged();
        };

        // Returns a rectangle in the plot plane.
        this.computeLocalBounds = function (step, computedBounds) {
            var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
            var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;

            if (_rects === undefined || _rects.length < 1)
                return undefined;

            var bbox = { x: _rects[0].x, y: _rects[0].y, width: _rects[0].width, height: _rects[0].height };
            for (var i = 1; i < _rects.length; i++) {
                bbox = InteractiveDataDisplay.Utils.unionRects(bbox, { x: _rects[i].x, y: _rects[i].y, width: _rects[i].width, height: _rects[i].height })
            }

            return bbox;
        };

        // Returns 4 margins in the screen coordinate system
        this.getLocalPadding = function () {
            return { left: 0, right: 0, top: 0, bottom: 0 };
        };

        this.renderCore = function (plotRect, screenSize) {
            InteractiveDataDisplay.Polyline.prototype.renderCore.call(this, plotRect, screenSize);

            if (_rects === undefined || _rects.length < 1)
                return;

            var t = this.getTransform();
            var dataToScreenX = t.dataToScreenX;
            var dataToScreenY = t.dataToScreenY;

            // size of the canvas
            var w_s = screenSize.width;
            var h_s = screenSize.height;
            var xmin = 0, xmax = w_s;
            var ymin = 0, ymax = h_s;

            var context = this.getContext(true);

            var circleSize = Number.POSITIVE_INFINITY;
            for (var i = 0; i < _rects.length; i++) {
                var rect = _rects[i];
                context.fillStyle = rect.fill;

                var x = dataToScreenX(rect.x);
                var y = dataToScreenY(rect.y + rect.height);
                var width = dataToScreenX(rect.x + rect.width) - dataToScreenX(rect.x);
                var height = dataToScreenY(rect.y) - dataToScreenY(rect.y + rect.height);

                if (rect.labels !== undefined && rect.labels.length > 0) {
                    var availableWidth = Math.min(height * 0.8, width * 0.8);
                    var size = availableWidth / rect.labels.length;
                    circleSize = Math.min(circleSize, size);
                }
            }

            for (var i = 0; i < _rects.length; i++) {
                var rect = _rects[i];

                var x = dataToScreenX(rect.x);
                var y = dataToScreenY(rect.y + rect.height);
                var width = dataToScreenX(rect.x + rect.width) - dataToScreenX(rect.x);
                var height = dataToScreenY(rect.y) - dataToScreenY(rect.y + rect.height);

                var alpha = context.globalAlpha;
                if (rect.opacity !== undefined) {
                    context.globalAlpha = rect.opacity;
                }
                if (rect.fill !== undefined) {
                    context.fillStyle = rect.fill;
                    context.fillRect(x, y, width, height);
                }
                if (rect.stroke !== undefined) {
                    context.strokeStyle = rect.stroke;
                    var lineWidth = context.lineWidth;
                    if (rect.lineWidth !== undefined) {
                        context.lineWidth = rect.lineWidth;
                    }
                    context.strokeRect(x, y, width, height);
                    context.lineWidth = lineWidth;
                }
                context.globalAlpha = alpha;

                if (rect.labels !== undefined && rect.labels.length > 0) {
                    var x = 0.1 * width + (0.8 * width - rect.labels.length * circleSize) / 2;
                    for (var j = 0; j < rect.labels.length; j++) {
                        context.beginPath();
                        context.arc(dataToScreenX(rect.x) + x + circleSize / 2, dataToScreenY(rect.y + rect.height / 2), 0.95 * circleSize / 2, 0, 2 * Math.PI, true);
                        context.closePath();

                        context.strokeStyle = "rgb(96,96,96)";
                        context.fillStyle = "rgb(238,238,238)";
                        context.stroke();
                        context.fill();

                        context.fillStyle = "rgb(96,96,96)";
                        context.textBaseline = "middle";
                        context.font = circleSize / 2 + "px OpenSans";
                        var w = context.measureText(rect.labels[j]).width;
                        context.fillText(rect.labels[j], dataToScreenX(rect.x) + x + circleSize / 2 - w / 2, dataToScreenY(rect.y + rect.height / 2));

                        x += circleSize;
                    }
                }
            }
        };

        // Others
        this.onDataTransformChanged = function (arg) {
            this.invalidateLocalBounds();
            InteractiveDataDisplay.RectsPlot.prototype.onDataTransformChanged.call(this, arg);
        };

    }

    BMAExt.RectsPlot.prototype = new InteractiveDataDisplay.CanvasPlot;
    InteractiveDataDisplay.register('rectsPlot', function (jqDiv, master) { return new BMAExt.RectsPlot(jqDiv, master); });

    BMAExt.ZoomPlot = function (div, master) {
        if (!div) return;

        var _minZoomWidth = 0.001;
        var _minZoomHeight = 0.001;
        var _maxZoomWidth = 0.004;
        var _maxZoomHeight = 0.004;

        this.base = InteractiveDataDisplay.Plot;
        this.base(div, master);
        var that = this;

        Object.defineProperty(this, "minZoomWidth",
            {
                get: function () { return _minZoomWidth; },
                set: function (value) {
                    if (_minZoomWidth === value) return;
                    _minZoomWidth = value;
                },
            }
        );
        Object.defineProperty(this, "maxZoomWidth",
            {
                get: function () { return _maxZoomWidth; },
                set: function (value) {
                    if (_maxZoomWidth === value) return;
                    _maxZoomWidth = value;
                },
            }
        );
        Object.defineProperty(this, "minZoomHeight",
            {
                get: function () { return _minZoomHeight; },
                set: function (value) {
                    if (_minZoomHeight === value) return;
                    _minZoomHeight = value;
                },
            }
        );
        Object.defineProperty(this, "maxZoomHeight",
            {
                get: function () { return _maxZoomHeight; },
                set: function (value) {
                    if (_maxZoomHeight === value) return;
                    _maxZoomHeight = value;
                },
            }
        );

        var currentMousePosition = {
            x: NaN,
            y: NaN
        }
        this.master.host.bind("mousemove", function (e) {
            var cs = that.getScreenToDataTransform();
            var x0 = cs.screenToDataX(e.pageX - that.host.offset().left);
            var y0 = cs.screenToDataY(e.pageY - that.host.offset().top);

            currentMousePosition = {
                x: x0,
                y: y0
            }
        });

        this.master.host.bind("mouseleave", function (e) {
            currentMousePosition = {
                x: NaN,
                y: NaN
            }
        });

        this.getActualMinRect = function () {
            var screenRect = { x: 0, y: 0, left: 0, top: 0, width: that.master.host.width(), height: that.master.host.height() };
            var minCS = new InteractiveDataDisplay.CoordinateTransform({ x: 0, y: 0, width: _minZoomWidth, height: _minZoomHeight }, screenRect, that.master.aspectRatio);
            return minCS.getPlotRect(screenRect);
        }

        this.getActualMaxRect = function () {
            var screenRect = { x: 0, y: 0, left: 0, top: 0, width: that.master.host.width(), height: that.master.host.height() };
            var maxCS = new InteractiveDataDisplay.CoordinateTransform({ x: 0, y: 0, width: _maxZoomWidth, height: _maxZoomHeight }, screenRect, that.master.aspectRatio);
            return maxCS.getPlotRect(screenRect);
        }

        this.constraint = function (plotRect, screenSize) {

            var screenRect = { x: 0, y: 0, left: 0, top: 0, width: that.master.host.width(), height: that.master.host.height() };
            var maxCS = new InteractiveDataDisplay.CoordinateTransform({ x: 0, y: 0, width: _maxZoomWidth, height: _maxZoomHeight }, screenRect, that.master.aspectRatio);
            var actualMaxRect = maxCS.getPlotRect(screenRect);
            var minCS = new InteractiveDataDisplay.CoordinateTransform({ x: 0, y: 0, width: _minZoomWidth, height: _minZoomHeight }, screenRect, that.master.aspectRatio);
            var actualMinRect = minCS.getPlotRect(screenRect);

            var resultPR = { x: 0, y: 0, width: 0, height: 0 };
            var center = {
                x: plotRect.x + plotRect.width / 2,
                y: plotRect.y + plotRect.height / 2
            }

            if (plotRect.width < actualMinRect.width) {
                if (isNaN(currentMousePosition.x)) {
                    resultPR.x = center.x - actualMinRect.width / 2;
                } else {
                    resultPR.x = currentMousePosition.x - actualMinRect.width * (currentMousePosition.x - plotRect.x) / plotRect.width;
                }
                resultPR.width = actualMinRect.width;
                that.master.navigation.stop();
            } else if (plotRect.width > actualMaxRect.width) {
                if (isNaN(currentMousePosition.x)) {
                    resultPR.x = center.x - actualMaxRect.width / 2;
                } else {
                    resultPR.x = currentMousePosition.x - actualMaxRect.width * (currentMousePosition.x - plotRect.x) / plotRect.width;
                }
                resultPR.width = actualMaxRect.width;
                that.master.navigation.stop();
            } else {
                resultPR.x = plotRect.x;
                resultPR.width = plotRect.width;
            }

            if (plotRect.height < actualMinRect.height) {
                if (isNaN(currentMousePosition.y)) {
                    resultPR.y = center.y - actualMinRect.height / 2;
                } else {
                    resultPR.y = currentMousePosition.y - actualMinRect.height * (currentMousePosition.y - plotRect.y) / plotRect.height;
                }

                resultPR.height = actualMinRect.height;
                that.master.navigation.stop();
            } else if (plotRect.height > actualMaxRect.height) {
                if (isNaN(currentMousePosition.y)) {
                    resultPR.y = center.y - actualMaxRect.height / 2;
                } else {
                    resultPR.y = currentMousePosition.y - actualMaxRect.height * (currentMousePosition.y - plotRect.y) / plotRect.height;
                }

                resultPR.height = actualMaxRect.height;
                that.master.navigation.stop();
            } else {
                resultPR.y = plotRect.y;
                resultPR.height = plotRect.height;
            }

            //if (plotRect.width < actualMinRect.width || plotRect.width > actualMaxRect.width || plotRect.height < actualMinRect.height || plotRect.height > actualMaxRect.height) {
            //    console.log('mouse: ' + currentMousePosition.x + ", " + currentMousePosition.y);
            //    console.log("source: " + plotRect.x + ", " + plotRect.y + ", " + plotRect.width + ", " + plotRect.height);
            //    console.log("result: " + resultPR.x + ", " + resultPR.y + ", " + resultPR.width + ", " + resultPR.height);
            //}

            return resultPR;
        };

        // Gets the transform functions from data to screen coordinates.
        // Returns { dataToScreenX, dataToScreenY }
        this.getTransform = function () {
            var ct = this.coordinateTransform;
            var plotToScreenX = ct.plotToScreenX;
            var plotToScreenY = ct.plotToScreenY;
            var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
            var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
            var dataToScreenX = dataToPlotX ? function (x) { return plotToScreenX(dataToPlotX(x)); } : plotToScreenX;
            var dataToScreenY = dataToPlotY ? function (y) { return plotToScreenY(dataToPlotY(y)); } : plotToScreenY;

            return { dataToScreenX: dataToScreenX, dataToScreenY: dataToScreenY };
        };

        // Gets the transform functions from screen to data coordinates.
        // Returns { screenToDataX, screenToDataY }
        this.getScreenToDataTransform = function () {
            var ct = this.coordinateTransform;
            var screenToPlotX = ct.screenToPlotX;
            var screenToPlotY = ct.screenToPlotY;
            var plotToDataX = this.xDataTransform && this.xDataTransform.plotToData;
            var plotToDataY = this.yDataTransform && this.yDataTransform.plotToData;
            var screenToDataX = plotToDataX ? function (x) { return plotToDataX(screenToPlotX(x)); } : screenToPlotX;
            var screenToDataY = plotToDataY ? function (y) { return plotToDataY(screenToPlotY(y)); } : screenToPlotY;

            return { screenToDataX: screenToDataX, screenToDataY: screenToDataY };
        };
    };
    BMAExt.ZoomPlot.prototype = new InteractiveDataDisplay.Plot;
    InteractiveDataDisplay.register('zoomPlot', function (jqDiv, master) { return new BMAExt.ZoomPlot(jqDiv, master); });

})(window.BMAExt = window.BMAExt || {}, InteractiveDataDisplay || {}, jQuery);
