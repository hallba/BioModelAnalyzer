// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
interface Window {
    ElementRegistry: BMA.Elements.ElementsRegistry;
}

module BMA {
    export module Elements {
        export class Element {
            private type: string;
            private renderToSvg: (renderParams: any) => SVGElement;
            private contains: (pointerX: number, pointerY: number, elementX, elementY) => boolean;
            private description: string;
            private iconClass: string;

            public get Type(): string {
                return this.type;
            }

            public get RenderToSvg(): (renderParams: any) => SVGElement {
                return this.renderToSvg;
            }

            public get Description(): string {
                return this.description;
            }

            public get IconClass(): string {
                return this.iconClass;
            }

            public get Contains(): (pointerX: number, pointerY: number, elementX, elementY) => boolean {
                return this.contains;
            }

            constructor(
                type: string,
                renderToSvg: (renderParams: any) => SVGElement,
                contains: (pointerX: number, pointerY: number, elementX, elementY) => boolean,
                description: string,
                iconClass: string) {

                this.type = type;
                this.renderToSvg = renderToSvg;
                this.contains = contains;
                this.description = description;
                this.iconClass = iconClass;

            }
        }

        export class BboxElement extends Element {
            private getBbox: (x: number, y: number) => { x: number; y: number; width: number; height: number };

            public get GetBoundingBox(): (x: number, y: number) => { x: number; y: number; width: number; height: number } {
                return this.getBbox;
            }

            constructor(
                type: string,
                renderToSvg: (renderParams: any) => SVGElement,
                contains: (pointerX: number, pointerY: number, elementX, elementY) => boolean,
                getBbox: (x: number, y: number) => { x: number; y: number; width: number; height: number },
                description: string,
                iconClass: string) {

                super(type, renderToSvg, contains, description, iconClass);

                this.getBbox = getBbox;
            }
        }

        export class BorderContainerElement extends Element {
            private intersectsBorder: (pointerX: number, pointerY: number, elementX: number, elementY: number, elementParams: any) => boolean;
            private containsBBox: (bbox: { x: number; y: number; width: number; height: number }, elementX: number, elementY: number, elementParams: any) => boolean;

            public get IntersectsBorder(): (pointerX: number, pointerY: number, elementX, elementY, elementParams: any) => boolean {
                return this.intersectsBorder;
            }

            public get ContainsBBox(): (bbox: { x: number; y: number; width: number; height: number }, elementX: number, elementY: number, elementParams: any) => boolean {
                return this.containsBBox;
            }

            constructor(
                type: string,
                renderToSvg: (renderParams: any) => SVGElement,
                contains: (pointerX: number, pointerY: number, elementX, elementY) => boolean,
                intersectsBorder: (pointerX: number, pointerY: number, elementX: number, elementY: number, elementParams: any) => boolean,
                containsBBox: (bbox: { x: number; y: number; width: number; height: number }, elementX: number, elementY: number, elementParams: any) => boolean,
                description: string,
                iconClass: string) {

                super(type, renderToSvg, contains, description, iconClass);

                this.intersectsBorder = intersectsBorder;
                this.containsBBox = containsBBox;
            }
        }

        export class ElementsRegistry {
            private elements: Element[];
            private variableWidthConstant = 35;
            private variableHeightConstant = 30;
            private variableSizeConstant = 30;
            private relationshipBboxOffset = 20;
            private containerRadius = 100;
            private svg;

            private lineWidth = 1;
            private labelSize = 10;
            private labelVisibility = true;

            public get LineWidth(): number {
                return this.lineWidth;
            }

            public set LineWidth(value: number) {
                this.lineWidth = Math.max(1, value);
                //console.log(this.lineWidth);
            }

            public get LabelSize(): number {
                return this.labelSize;
            }

            public set LabelSize(value: number) {
                this.labelSize = value;
            }

            public get LabelVisibility(): boolean {
                return this.labelVisibility;
            }

            public set LabelVisibility(value: boolean) {
                this.labelVisibility = value;
            }

            private CreateBezier(start, end, lineWidth, endingType, svg, isSelected) {
                var that = this;
                var jqSvg = svg;

                var nx = 0;
                var ny = 0;
                if (end.x === start.x) {
                    ny = 0;
                    nx = end.y > start.y ? 1 : -1;
                } else if (end.y === start.y) {
                    nx = 0;
                    ny = end.x > start.x ? 1 : -1;
                } else {
                    nx = 1 / (end.x - start.x);
                    ny = 1 / (start.y - end.y)
                }

                var normal = { x: nx, y: ny };
                var nlength = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
                normal.x = normal.x / nlength;
                normal.y = normal.y / nlength;

                var lineVector = { x: end.x - start.x, y: end.y - start.y };
                var lvlength = Math.sqrt(lineVector.x * lineVector.x + lineVector.y * lineVector.y);
                lineVector.x = lineVector.x / lvlength;
                lineVector.y = lineVector.y / lvlength;
                var length05 = 0.5 * that.variableSizeConstant;
                var length01 = 0.1 * lvlength;

                var pointOffset = 0.15 * that.variableSizeConstant;

                var stroke = isSelected ? "#666" : "#ccc";
                var endMarker = isSelected ? "url(#" + endingType + "Selected)" : "url(#" + endingType + ")";

                var path = jqSvg.createPath();
                return jqSvg.path(path.move(start.x + normal.x * pointOffset, start.y + normal.y * pointOffset)
                    .curveC(
                    start.x + normal.x * length05 + lineVector.x * 3 * length01,
                    start.y + normal.y * length05 + lineVector.y * 3 * length01,
                    end.x + normal.x * length05 - lineVector.x * 3 * length01,
                    end.y + normal.y * length05 - lineVector.y * 3 * length01,
                    end.x + normal.x * pointOffset,
                    end.y + normal.y * pointOffset),
                    { fill: 'none', stroke: stroke, strokeWidth: lineWidth + 1, "marker-end": endMarker, "stroke-linecap": "round" });
            }

            private CreateLine(start, end, lineWidth, endingType, svg, isSelected) {
                var jqSvg = svg;

                var g = jqSvg.group();

                if (isSelected) {
                    var spath = jqSvg.createPath();
                    jqSvg.path(g, spath.move(start.x, start.y).lineTo(end.x, end.y),
                        { fill: 'none', stroke: "#666", strokeWidth: lineWidth + 1, "marker-end": "url(#" + endingType + "Selected)", "stroke-linecap": "round" });
                }
                else {
                    var path = jqSvg.createPath();
                    jqSvg.path(g, path.move(start.x, start.y).lineTo(end.x, end.y),
                        { fill: 'none', stroke: "#ccc", strokeWidth: lineWidth + 1, "marker-end": "url(#" + endingType + ")", "stroke-linecap": "round" });
                }
                return g;
            }

            private CalculateRotationAngle(gridCell, grid, sizeCoef, positionX, positionY): number {
                var angle = 0;

                var containerX = (gridCell.x + 0.5) * grid.xStep + grid.x0 + (sizeCoef - 1) * grid.xStep / 2;
                var containerY = (gridCell.y + 0.5) * grid.yStep + grid.y0 + (sizeCoef - 1) * grid.yStep / 2;

                var v = {
                    x: positionX - containerX,
                    y: positionY - containerY
                };
                var len = Math.sqrt(v.x * v.x + v.y * v.y);

                v.x = v.x / len;
                v.y = v.y / len;

                var acos = Math.acos(-v.y);

                angle = acos * v.x / Math.abs(v.x);

                angle = angle * 180 / Math.PI;
                if (angle < 0)
                    angle += 360;


                return angle;
            }

            private CreateSvgElement(type: string, renderParams: any) {
                var elem = <SVGElement>document.createElementNS("http://www.w3.org/2000/svg", type);
                var transform = "";
                if (renderParams.x != 0 || renderParams.y != 0)
                    transform += "translate(" + renderParams.x + "," + renderParams.y + ")";
                if (renderParams.scale !== undefined && renderParams.scale != 1.0)
                    transform += "scale(" + renderParams.scale + "," + renderParams.scale + ")";
                if (transform.length > 0)
                    elem.setAttribute("transform", transform);
                return elem;
            }

            private CreateSvgPath(data: string, color: string, x: number = 0, y: number = 0, scale: number = 1.0) {
                var elem = <SVGPathElement>this.CreateSvgElement("path", { x: x, y: y, scale: scale });
                elem.setAttribute("d", data);
                elem.setAttribute("fill", color);
                return elem;

            }

            public get Elements(): Element[] {
                return this.elements;
            }

            public GetElementByType(type: string): Element {
                for (var i = 0; i < this.elements.length; i++) {
                    if (this.elements[i].Type === type)
                        return this.elements[i];
                }
                throw "the is no element for specified type";
            }

            constructor() {
                var that = this;
                this.elements = [];

                var svgCnt = $("<div></div>");
                svgCnt.svg({
                    onLoad: (svg) => {
                        this.svg = svg;
                    }
                });

                var containerInnerEllipseWidth = 106;
                var containerInnerEllipseHeight = 123.5;
                var containerOuterEllipseWidth = 118;
                var containerOuterEllipseHeight = 136.5;
                var containerInnerCenterOffset = 0;
                var containerOuterCenterOffset = 0;
                var containerPaddingCoef = 100;

                var textFontFamily = "OpenSans";
                var textFontSrc = "local('Segoe UI'), local('Frutiger'), local('Frutiger Linotype'), local('Dejavu Sans'), local('Helvetica Neue'), local('HelveticaNeue'), local('Arial'), local('sans serif'), local('sans-serif')";

                this.elements.push(new BorderContainerElement(
                    "Container",
                    function (renderParams) {
                        var jqSvg = that.svg;
                        if (jqSvg === undefined)
                            return undefined;
                        jqSvg.clear();

                        var x = (renderParams.layout.PositionX + 0.5) * renderParams.grid.xStep + (renderParams.layout.Size - 1) * renderParams.grid.xStep / 2;
                        var y = (renderParams.layout.PositionY + 0.5) * renderParams.grid.yStep + (renderParams.layout.Size - 1) * renderParams.grid.yStep / 2;

                        if (renderParams.translate !== undefined) {
                            x += renderParams.translate.x;
                            y += renderParams.translate.y;
                        }

                        var g = jqSvg.group({
                            transform: "translate(" + x + ", " + y + ")"
                        });

                        if (!renderParams.textOnly) {

                            jqSvg.rect(g,
                                - renderParams.grid.xStep * renderParams.layout.Size / 2 + renderParams.grid.xStep / containerPaddingCoef + (renderParams.translate === undefined ? 0 : renderParams.translate.x),
                                - renderParams.grid.yStep * renderParams.layout.Size / 2 + renderParams.grid.yStep / containerPaddingCoef + (renderParams.translate === undefined ? 0 : renderParams.translate.y),
                                renderParams.grid.xStep * renderParams.layout.Size - 2 * renderParams.grid.xStep / containerPaddingCoef,
                                renderParams.grid.yStep * renderParams.layout.Size - 2 * renderParams.grid.yStep / containerPaddingCoef,
                                0,
                                0,
                                {
                                    stroke: "none",
                                    fill: renderParams.background !== undefined ? renderParams.background : "transparent",
                                });

                            var scale = 0.52 * renderParams.layout.Size;

                            var cellData = "M 640.36 249.05 c 113.22 0 205.33 106.84 205.33 238.16 S 753.58 725.37 640.36 725.37 S 435 618.53 435 487.21 s 92.11 -238.16 205.32 -238.16 m 0 -22.73 c -126 0 -228.06 116.8 -228.06 260.89 S 514.41 748.1 640.36 748.1 S 868.43 631.3 868.43 487.21 S 766.32 226.32 640.36 226.32 Z";
                            var cellPath = jqSvg.createPath();
                            var pathFill = "#d0e9f0";
                            if (renderParams.isHighlighted !== undefined && !renderParams.isHighlighted) {
                                pathFill = "#EDEDED";
                            }

                            var op = jqSvg.path(g, cellPath, {
                                stroke: renderParams.isSelected ? '#62b9d1' : pathFill,
                                strokeWidth: 2,
                                fill: pathFill,
                                "fill-rule": "evenodd",
                                d: cellData,
                                transform: "scale(" + scale + ") translate(-640, -487)"
                            });

                            if (renderParams.translate === undefined) {
                                jqSvg.ellipse(g,
                                    containerInnerCenterOffset * renderParams.layout.Size,
                                    0,
                                    containerInnerEllipseWidth * renderParams.layout.Size,
                                    containerInnerEllipseHeight * renderParams.layout.Size, { stroke: "none", fill: "white" });

                                //Test geometry for container outer ellipse check
                                //jqSvg.ellipse(g,
                                //    containerOuterCenterOffset * renderParams.layout.Size,
                                //    0,
                                //    containerOuterEllipseWidth * renderParams.layout.Size,
                                //    containerOuterEllipseHeight * renderParams.layout.Size, { stroke: "red", fill: "none" });

                                //jqSvg.ellipse(g,
                                //    0,
                                //    0,
                                //    113 * renderParams.layout.Size,
                                //    130 * renderParams.layout.Size, { stroke: "red", fill: "none" });

                                //if (that.labelVisibility === true) {
                                //    if (renderParams.layout.Name !== undefined && renderParams.layout.Name !== "") {
                                //        var textLabel = jqSvg.text(g, 0, 0, renderParams.layout.Name, {
                                //            transform: "translate(" + -(renderParams.layout.Size * renderParams.grid.xStep / 2 - 10 * renderParams.layout.Size) + ", " + -(renderParams.layout.Size * renderParams.grid.yStep / 2 - that.labelSize - 10 * renderParams.layout.Size) + ")",
                                //            "font-size": that.labelSize * renderParams.layout.Size,
                                //            "font-family": textFontFamily,
                                //            "src": textFontSrc,
                                //            "fill": "black"
                                //        });
                                //    }
                                //}
                            }
                        } else {
                            if (renderParams.translate === undefined && that.labelVisibility === true) {
                                if (renderParams.layout.Name !== undefined && renderParams.layout.Name !== "") {
                                    var textLabel = jqSvg.text(g, 0, 0, renderParams.layout.Name, {
                                        transform: "translate(" + -(renderParams.layout.Size * renderParams.grid.xStep / 2 - 10 * renderParams.layout.Size) + ", " + -(renderParams.layout.Size * renderParams.grid.yStep / 2 - that.labelSize - 10 * renderParams.layout.Size) + ")",
                                        "font-size": that.labelSize * renderParams.layout.Size,
                                        "font-family": textFontFamily,
                                        "src": textFontSrc,
                                        "fill": "black"
                                    });
                                }
                            }
                        }

                        //$(op).attr("onmouseover", "BMA.SVGHelper.AddClass(this, 'modeldesigner-element-hover')");
                        //$(op).attr("onmouseout", "BMA.SVGHelper.RemoveClass(this, 'modeldesigner-element-hover')");

                        /*
                        //Helper bounding ellipses
                        jqSvg.ellipse(
                            (renderParams.layout.PositionX + 0.5) * renderParams.grid.xStep + containerOuterCenterOffset * renderParams.layout.Size + (renderParams.layout.Size - 1) * renderParams.grid.xStep / 2,
                            (renderParams.layout.PositionY + 0.5) * renderParams.grid.yStep + (renderParams.layout.Size - 1) * renderParams.grid.yStep / 2,
                            containerOuterEllipseWidth * renderParams.layout.Size, containerOuterEllipseHeight * renderParams.layout.Size, { stroke: "red", fill: "none" });
                        
                        jqSvg.ellipse(
                            (renderParams.layout.PositionX + 0.5) * renderParams.grid.xStep + containerInnerCenterOffset * renderParams.layout.Size + (renderParams.layout.Size - 1) * renderParams.grid.xStep / 2,
                            (renderParams.layout.PositionY + 0.5) * renderParams.grid.yStep + (renderParams.layout.Size - 1) * renderParams.grid.yStep / 2,
                            containerInnerEllipseWidth * renderParams.layout.Size, containerInnerEllipseHeight * renderParams.layout.Size, { stroke: "red", fill: "none" });

                        jqSvg.ellipse(
                            x + containerOuterCenterOffset * renderParams.layout.Size / 2,
                            y,
                            (containerInnerEllipseWidth + containerOuterEllipseWidth) * renderParams.layout.Size / 2,
                            (containerInnerEllipseHeight + containerOuterEllipseHeight) * renderParams.layout.Size / 2,
                            { stroke: "red", fill: "none" });
                        */

                        var svgElem: any = $(jqSvg.toSVG()).children();
                        return <SVGElement>svgElem;
                    },
                    function (pointerX: number, pointerY: number, elementX, elementY) {
                        return false;
                    },
                    function (pointerX: number, pointerY: number, elementX, elementY, elementParams: any) {
                        var innerCenterX = elementX + containerInnerCenterOffset * elementParams.Size + elementParams.xStep * (elementParams.Size - 1);
                        var dstXInner = Math.abs(pointerX - innerCenterX);

                        var outerCenterX = elementX + containerOuterCenterOffset * elementParams.Size + elementParams.xStep * (elementParams.Size - 1);
                        var dstXOuter = Math.abs(pointerX - outerCenterX);

                        var centerY = elementY + elementParams.yStep * (elementParams.Size - 1);
                        var dstY = Math.abs(pointerY - centerY);

                        var outerCheck = Math.pow(dstXOuter / (containerOuterEllipseWidth * elementParams.Size), 2) + Math.pow(dstY / (containerOuterEllipseHeight * elementParams.Size), 2) < 1;
                        var innerCheck = Math.pow(dstXInner / (containerInnerEllipseWidth * elementParams.Size), 2) + Math.pow(dstY / (containerInnerEllipseHeight * elementParams.Size), 2) > 1;
                        return outerCheck && innerCheck;
                    },
                    function (bbox: { x: number; y: number; width: number; height: number }, elementX: number, elementY: number, elementParams: any) {

                        var iscontaining = function (x, y) {
                            var dstX = Math.abs(x - (elementX + containerInnerCenterOffset * elementParams.Size + elementParams.xStep * (elementParams.Size - 1)));
                            var dstY = Math.abs(y - elementY - elementParams.yStep * (elementParams.Size - 1));
                            return Math.pow(dstX / (containerInnerEllipseWidth * elementParams.Size), 2) + Math.pow(dstY / (containerInnerEllipseHeight * elementParams.Size), 2) < 1
                        }

                        var leftTop = iscontaining(bbox.x, bbox.y);
                        var leftBottom = iscontaining(bbox.x, bbox.y + bbox.height);
                        var rightTop = iscontaining(bbox.x + bbox.width, bbox.y);
                        var rightBottom = iscontaining(bbox.x + bbox.width, bbox.y + bbox.height);


                        return leftTop && leftBottom && rightTop && rightBottom;
                    },
                    "Cell",
                    "cell-icon"));

                this.elements.push(new BboxElement(
                    "Constant",
                    function (renderParams) {
                        var jqSvg = that.svg;
                        if (jqSvg === undefined)
                            return undefined;
                        jqSvg.clear();

                        //Checking additional global offset
                        var translate = renderParams.translate === undefined ? { x: 0, y: 0 } : renderParams.translate;

                        var g = jqSvg.group({
                            transform: "translate(" + (renderParams.layout.PositionX + translate.x) + ", " + (renderParams.layout.PositionY + translate.y) + ")",
                        });

                        if (!renderParams.textOnly) {

                            var pathFill = "#CCC";
                            if (renderParams.isHighlighted !== undefined) {
                                if (!renderParams.isHighlighted) {
                                    pathFill = "#EDEDED";
                                }
                                //else {
                                //    pathFill = "#EF4137";
                                //}
                            }

                            if (renderParams.isHighlighted) {
                                var rad = 1.3 * Math.max(that.variableHeightConstant, that.variableWidthConstant) / 2;
                                jqSvg.ellipse(g, 0, 0, rad, rad, { stroke: "#EF4137", fill: "transparent" });
                            }

                            //Geometry Fill
                            var data = "M54.88 71.29 a 4.58 4.58 0 0 1 -3.28 -1.36 a 4.65 4.65 0 0 1 0 -6.57 l 11.11 -11 A 1.65 1.65 0 0 0 60.38 50 L 49.3 61.06 a 4.65 4.65 0 0 1 -7.93 -3.28 a 4.66 4.66 0 0 1 1.36 -3.29 l 11.12 -11 a 1.65 1.65 0 0 0 -1.17 -2.8 a 1.67 1.67 0 0 0 -1.17 0.48 L 40.44 52.2 a 4.65 4.65 0 0 1 -6.57 -6.57 L 45 34.59 a 1.63 1.63 0 0 0 0.48 -1.16 A 1.67 1.67 0 0 0 45 32.26 a 1.65 1.65 0 0 0 -1.17 -0.48 a 1.63 1.63 0 0 0 -1.16 0.48 L 29.28 45.63 a 1.5 1.5 0 1 1 -2.12 -2.12 L 40.53 30.14 a 4.65 4.65 0 0 1 7.93 3.29 a 4.58 4.58 0 0 1 -1.36 3.28 L 36 47.75 a 1.65 1.65 0 0 0 0 2.33 a 1.65 1.65 0 0 0 2.33 0 L 49.39 39 A 4.65 4.65 0 0 1 56 39 a 4.65 4.65 0 0 1 0 6.57 l -11.11 11 a 1.64 1.64 0 0 0 0 2.32 a 1.66 1.66 0 0 0 1.17 0.47 a 1.64 1.64 0 0 0 1.16 -0.47 L 58.26 47.87 a 4.65 4.65 0 0 1 6.57 0 a 4.65 4.65 0 0 1 0 6.57 l -11.12 11 a 1.65 1.65 0 0 0 2.34 2.33 l 13.29 -13.3 a 1.51 1.51 0 0 1 2.13 0 a 1.5 1.5 0 0 1 0 2.12 l -13.3 13.3 A 4.62 4.62 0 0 1 54.88 71.29 Z";
                            var path = jqSvg.createPath();
                            var variable = jqSvg.path(g, path, {
                                fill: pathFill,
                                d: data,
                                transform: "scale(0.6) translate(-50 -50)"
                            });

                            //Geometry stroke
                            data = "M 43.81 29.28 a 4.15 4.15 0 0 1 2.94 7.08 l -11.12 11 A 2.14 2.14 0 0 0 35 48.91 a 2.14 2.14 0 0 0 3.66 1.52 L 49.75 39.36 a 4.14 4.14 0 0 1 5.86 5.86 L 44.49 56.27 a 2.13 2.13 0 0 0 -0.62 1.51 a 2.16 2.16 0 0 0 3.67 1.52 L 58.61 48.22 a 4.15 4.15 0 0 1 5.87 5.86 l -11.12 11 a 2.15 2.15 0 0 0 0 3 a 2.17 2.17 0 0 0 3 0 l 13.3 -13.3 a 1 1 0 1 1 1.41 1.42 L 57.81 69.57 a 4.13 4.13 0 0 1 -5.86 0 a 4.14 4.14 0 0 1 0 -5.86 l 11.12 -11 a 2.15 2.15 0 0 0 -3 -3 L 49 60.71 a 4.15 4.15 0 0 1 -5.87 -5.86 L 54.2 43.8 a 2.15 2.15 0 0 0 -3 -3 L 40.09 51.85 A 4.15 4.15 0 0 1 34.22 46 l 11.12 -11 a 2.15 2.15 0 0 0 -1.53 -3.66 a 2.09 2.09 0 0 0 -1.51 0.63 L 28.93 45.28 a 1 1 0 0 1 -1.42 0 a 1 1 0 0 1 0 -1.42 L 40.88 30.5 a 4.1 4.1 0 0 1 2.93 -1.22 m 0 -1 a 5.18 5.18 0 0 0 -3.64 1.51 L 26.81 43.16 a 2 2 0 0 0 1.41 3.41 A 2 2 0 0 0 29.64 46 L 43 32.62 a 1.14 1.14 0 0 1 0.81 -0.34 A 1.16 1.16 0 0 1 45 33.43 a 1.14 1.14 0 0 1 -0.33 0.8 L 33.52 45.28 a 5.14 5.14 0 1 0 7.27 7.27 L 51.87 41.48 a 1.13 1.13 0 0 1 0.81 -0.33 a 1.14 1.14 0 0 1 0.81 2 l -11.11 11 a 5.15 5.15 0 1 0 7.28 7.28 L 60.73 50.34 a 1.17 1.17 0 0 1 0.81 -0.32 A 1.14 1.14 0 0 1 62.36 52 L 51.24 63 a 5.15 5.15 0 0 0 3.64 8.79 a 5.11 5.11 0 0 0 3.64 -1.51 L 71.82 57 a 2 2 0 0 0 0 -2.83 a 2 2 0 0 0 -2.83 0 l -13.3 13.3 a 1.12 1.12 0 0 1 -0.81 0.33 a 1.15 1.15 0 0 1 -0.81 -0.33 a 1.13 1.13 0 0 1 0 -1.61 L 65.18 54.79 a 5.14 5.14 0 0 0 0 -7.27 a 5.14 5.14 0 0 0 -7.28 0 L 46.83 58.59 a 1.12 1.12 0 0 1 -0.81 0.32 a 1.11 1.11 0 0 1 -0.81 -0.32 a 1.15 1.15 0 0 1 0 -1.62 l 11.12 -11 A 5.15 5.15 0 0 0 49 38.65 L 38 49.73 a 1.15 1.15 0 0 1 -2 -0.82 a 1.14 1.14 0 0 1 0.33 -0.8 l 11.11 -11 a 5.14 5.14 0 0 0 0 -7.28 a 5.14 5.14 0 0 0 -3.64 -1.51 Z";
                            var path2 = jqSvg.createPath();
                            var variable = jqSvg.path(g, path2, {
                                fill: renderParams.isSelected ? '#7c7c7c' : pathFill,
                                d: data,
                                transform: "scale(0.6) translate(-50 -50)"
                            });


                            //if (that.labelVisibility === true) {
                            //    var offset = 0;

                            //    if (renderParams.model.Name !== "") {
                            //        var textLabel = jqSvg.text(g, 0, 0, renderParams.model.Name, {
                            //            transform: "translate(" + -that.variableWidthConstant / 2 + ", " + (that.variableHeightConstant / 2 + that.labelSize) + ")",
                            //            "font-size": that.labelSize,
                            //            "font-family": textFontFamily,
                            //            "src": textFontSrc,
                            //            "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                            //        });
                            //        offset += that.labelSize;
                            //    }

                            //    if (renderParams.valueText !== undefined) {
                            //        jqSvg.text(g, 0, 0, renderParams.valueText + "", {
                            //            transform: "translate(" + -that.variableWidthConstant / 2 + ", " + (that.variableHeightConstant / 2 + that.labelSize + offset) + ")",
                            //            "font-size": that.labelSize,
                            //            "font-family": textFontFamily,
                            //            "src": textFontSrc,
                            //            "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                            //        });
                            //    }
                            //}

                            if (renderParams.isValid !== undefined && renderParams.isValid !== true) {

                                var offsetX = 0.3 * that.variableWidthConstant;
                                var offsetY = - 0.4 * that.variableWidthConstant;

                                var invalidGroup = jqSvg.group(g, {
                                    transform: "translate(" + offsetX + ", " + offsetY + ") scale(0.25) translate(-20.06 -20.06)",
                                });

                                jqSvg.ellipse(invalidGroup, 20.06, 20.06, 20.06, 20.06, {
                                    "stroke": "red",
                                    "fill": "red"
                                });
                                jqSvg.ellipse(invalidGroup, 20.06, 32.09, 4, 4, {
                                    "stroke": "red",
                                    "fill": "#fff"
                                });
                                jqSvg.line(invalidGroup, 20.06, 8.05, 20.06, 21.07, {
                                    stroke: "#fff",
                                    "stroke-linecap": "round",
                                    "stroke-miterlimit": 10,
                                    "stroke-width": "6.8px"
                                });
                            }
                        } else {
                            if (that.labelVisibility === true) {
                                var offset = 0;

                                if (renderParams.model.Name !== "") {
                                    var textLabel = jqSvg.text(g, 0, 0, renderParams.model.Name, {
                                        transform: "translate(" + -that.variableWidthConstant / 2 + ", " + (that.variableHeightConstant / 2 + that.labelSize) + ")",
                                        "font-size": that.labelSize,
                                        "font-family": textFontFamily,
                                        "src": textFontSrc,
                                        "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                                    });
                                    offset += that.labelSize;
                                }

                                if (renderParams.valueText !== undefined) {
                                    jqSvg.text(g, 0, 0, renderParams.valueText + "", {
                                        transform: "translate(" + -that.variableWidthConstant / 2 + ", " + (that.variableHeightConstant / 2 + that.labelSize + offset) + ")",
                                        "font-size": that.labelSize,
                                        "font-family": textFontFamily,
                                        "src": textFontSrc,
                                        "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                                    });
                                }
                            }
                        }

                        /*
                        //Helper bounding box
                        jqSvg.rect(
                            renderParams.layout.PositionX - that.variableWidthConstant / 2,
                            renderParams.layout.PositionY - that.variableHeightConstant / 2,
                            that.variableWidthConstant,
                            that.variableHeightConstant,
                            0,
                            0,
                            { stroke: "red", fill: "none" });
                        */

                        //$(variable).attr("onmouseover", "BMA.SVGHelper.AddClass(this, 'modeldesigner-element-hover')");
                        //$(variable).attr("onmouseout", "BMA.SVGHelper.RemoveClass(this, 'modeldesigner-element-hover')");

                        var svgElem: any = $(jqSvg.toSVG()).children();
                        return <SVGElement>svgElem;
                    },
                    function (pointerX: number, pointerY: number, elementX, elementY) {
                        return pointerX > elementX - that.variableWidthConstant / 2 && pointerX < elementX + that.variableWidthConstant / 2 &&
                            pointerY > elementY - that.variableHeightConstant / 2 && pointerY < elementY + that.variableHeightConstant / 2;
                    },
                    function (elementX: number, elementY: number) {
                        return { x: elementX - that.variableWidthConstant / 2, y: elementY - that.variableHeightConstant / 2, width: that.variableWidthConstant, height: that.variableHeightConstant };
                    },
                    "Extracellular Protein",
                    "constant-icon"));

                this.elements.push(new BboxElement(
                    "Default",
                    function (renderParams) {
                        var jqSvg = that.svg;
                        if (jqSvg === undefined)
                            return undefined;
                        jqSvg.clear();

                        //Checking additional global offset
                        var translate = renderParams.translate === undefined ? { x: 0, y: 0 } : renderParams.translate;

                        var g = jqSvg.group({
                            transform: "translate(" + (renderParams.layout.PositionX + translate.x) + ", " + (renderParams.layout.PositionY + translate.y) + ")",
                        });

                        if (!renderParams.textOnly) {

                            var pathFill = "#f6c"; //"#EF4137";
                            if (renderParams.isHighlighted !== undefined && !renderParams.isHighlighted) {
                                pathFill = "#EDEDED";
                            }

                            if (renderParams.isHighlighted) {
                                var rad = Math.max(that.variableHeightConstant, that.variableWidthConstant) / 2;
                                jqSvg.ellipse(g, 0, 0, rad, rad, { stroke: "#EF4137", fill: "transparent" });
                            }

                            //Geometry Fill
                            var data = "M54.88 71.29 a 4.58 4.58 0 0 1 -3.28 -1.36 a 4.65 4.65 0 0 1 0 -6.57 l 11.11 -11 A 1.65 1.65 0 0 0 60.38 50 L 49.3 61.06 a 4.65 4.65 0 0 1 -7.93 -3.28 a 4.66 4.66 0 0 1 1.36 -3.29 l 11.12 -11 a 1.65 1.65 0 0 0 -1.17 -2.8 a 1.67 1.67 0 0 0 -1.17 0.48 L 40.44 52.2 a 4.65 4.65 0 0 1 -6.57 -6.57 L 45 34.59 a 1.63 1.63 0 0 0 0.48 -1.16 A 1.67 1.67 0 0 0 45 32.26 a 1.65 1.65 0 0 0 -1.17 -0.48 a 1.63 1.63 0 0 0 -1.16 0.48 L 29.28 45.63 a 1.5 1.5 0 1 1 -2.12 -2.12 L 40.53 30.14 a 4.65 4.65 0 0 1 7.93 3.29 a 4.58 4.58 0 0 1 -1.36 3.28 L 36 47.75 a 1.65 1.65 0 0 0 0 2.33 a 1.65 1.65 0 0 0 2.33 0 L 49.39 39 A 4.65 4.65 0 0 1 56 39 a 4.65 4.65 0 0 1 0 6.57 l -11.11 11 a 1.64 1.64 0 0 0 0 2.32 a 1.66 1.66 0 0 0 1.17 0.47 a 1.64 1.64 0 0 0 1.16 -0.47 L 58.26 47.87 a 4.65 4.65 0 0 1 6.57 0 a 4.65 4.65 0 0 1 0 6.57 l -11.12 11 a 1.65 1.65 0 0 0 2.34 2.33 l 13.29 -13.3 a 1.51 1.51 0 0 1 2.13 0 a 1.5 1.5 0 0 1 0 2.12 l -13.3 13.3 A 4.62 4.62 0 0 1 54.88 71.29 Z";
                            var path = jqSvg.createPath();
                            var variable = jqSvg.path(g, path, {
                                fill: pathFill,
                                d: data,
                                transform: "scale(0.6) translate(-50 -50)"
                            });

                            //Geometry stroke
                            data = "M 43.81 29.28 a 4.15 4.15 0 0 1 2.94 7.08 l -11.12 11 A 2.14 2.14 0 0 0 35 48.91 a 2.14 2.14 0 0 0 3.66 1.52 L 49.75 39.36 a 4.14 4.14 0 0 1 5.86 5.86 L 44.49 56.27 a 2.13 2.13 0 0 0 -0.62 1.51 a 2.16 2.16 0 0 0 3.67 1.52 L 58.61 48.22 a 4.15 4.15 0 0 1 5.87 5.86 l -11.12 11 a 2.15 2.15 0 0 0 0 3 a 2.17 2.17 0 0 0 3 0 l 13.3 -13.3 a 1 1 0 1 1 1.41 1.42 L 57.81 69.57 a 4.13 4.13 0 0 1 -5.86 0 a 4.14 4.14 0 0 1 0 -5.86 l 11.12 -11 a 2.15 2.15 0 0 0 -3 -3 L 49 60.71 a 4.15 4.15 0 0 1 -5.87 -5.86 L 54.2 43.8 a 2.15 2.15 0 0 0 -3 -3 L 40.09 51.85 A 4.15 4.15 0 0 1 34.22 46 l 11.12 -11 a 2.15 2.15 0 0 0 -1.53 -3.66 a 2.09 2.09 0 0 0 -1.51 0.63 L 28.93 45.28 a 1 1 0 0 1 -1.42 0 a 1 1 0 0 1 0 -1.42 L 40.88 30.5 a 4.1 4.1 0 0 1 2.93 -1.22 m 0 -1 a 5.18 5.18 0 0 0 -3.64 1.51 L 26.81 43.16 a 2 2 0 0 0 1.41 3.41 A 2 2 0 0 0 29.64 46 L 43 32.62 a 1.14 1.14 0 0 1 0.81 -0.34 A 1.16 1.16 0 0 1 45 33.43 a 1.14 1.14 0 0 1 -0.33 0.8 L 33.52 45.28 a 5.14 5.14 0 1 0 7.27 7.27 L 51.87 41.48 a 1.13 1.13 0 0 1 0.81 -0.33 a 1.14 1.14 0 0 1 0.81 2 l -11.11 11 a 5.15 5.15 0 1 0 7.28 7.28 L 60.73 50.34 a 1.17 1.17 0 0 1 0.81 -0.32 A 1.14 1.14 0 0 1 62.36 52 L 51.24 63 a 5.15 5.15 0 0 0 3.64 8.79 a 5.11 5.11 0 0 0 3.64 -1.51 L 71.82 57 a 2 2 0 0 0 0 -2.83 a 2 2 0 0 0 -2.83 0 l -13.3 13.3 a 1.12 1.12 0 0 1 -0.81 0.33 a 1.15 1.15 0 0 1 -0.81 -0.33 a 1.13 1.13 0 0 1 0 -1.61 L 65.18 54.79 a 5.14 5.14 0 0 0 0 -7.27 a 5.14 5.14 0 0 0 -7.28 0 L 46.83 58.59 a 1.12 1.12 0 0 1 -0.81 0.32 a 1.11 1.11 0 0 1 -0.81 -0.32 a 1.15 1.15 0 0 1 0 -1.62 l 11.12 -11 A 5.15 5.15 0 0 0 49 38.65 L 38 49.73 a 1.15 1.15 0 0 1 -2 -0.82 a 1.14 1.14 0 0 1 0.33 -0.8 l 11.11 -11 a 5.14 5.14 0 0 0 0 -7.28 a 5.14 5.14 0 0 0 -3.64 -1.51 Z";
                            var path2 = jqSvg.createPath();
                            var variable = jqSvg.path(g, path2, {
                                fill: renderParams.isSelected ? '#906' : pathFill,
                                d: data,
                                transform: "scale(0.6) translate(-50 -50)"
                            });

                            //if (that.labelVisibility === true) {
                            //    var offset = 0;

                            //    if (renderParams.model.Name !== "") {
                            //        var textLabel = jqSvg.text(g, 0, 0, renderParams.model.Name, {
                            //            transform: "translate(" + -that.variableWidthConstant / 2 + ", " + (that.variableHeightConstant / 2 + that.labelSize) + ")",
                            //            "font-size": that.labelSize,
                            //            "font-family": textFontFamily,
                            //            "src": textFontSrc,
                            //            "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                            //        });
                            //        offset += that.labelSize;
                            //    }

                            //    if (renderParams.valueText !== undefined) {
                            //        jqSvg.text(g, 0, 0, renderParams.valueText + "", {
                            //            transform: "translate(" + -that.variableWidthConstant / 2 + ", " + (that.variableHeightConstant / 2 + that.labelSize + offset) + ")",
                            //            "font-size": that.labelSize,
                            //            "font-family": textFontFamily,
                            //            "src": textFontSrc,
                            //            "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                            //        });
                            //    }
                            //}

                            if (renderParams.isValid !== undefined && renderParams.isValid !== true) {
                                var offsetX = 0.3 * that.variableWidthConstant;
                                var offsetY = - 0.4 * that.variableWidthConstant;

                                var invalidGroup = jqSvg.group(g, {
                                    transform: "translate(" + offsetX + ", " + offsetY + ") scale(0.25) translate(-20.06 -20.06)",
                                });

                                jqSvg.ellipse(invalidGroup, 20.06, 20.06, 20.06, 20.06, {
                                    "stroke": "red",
                                    "fill": "red"
                                });
                                jqSvg.ellipse(invalidGroup, 20.06, 32.09, 4, 4, {
                                    "stroke": "red",
                                    "fill": "#fff"
                                });
                                jqSvg.line(invalidGroup, 20.06, 8.05, 20.06, 21.07, {
                                    stroke: "#fff",
                                    "stroke-linecap": "round",
                                    "stroke-miterlimit": 10,
                                    "stroke-width": "6.8px"
                                });
                            }
                        } else {
                            if (that.labelVisibility === true) {
                                var offset = 0;

                                if (renderParams.model.Name !== "") {
                                    var textLabel = jqSvg.text(g, 0, 0, renderParams.model.Name, {
                                        transform: "translate(" + -that.variableWidthConstant / 2 + ", " + (that.variableHeightConstant / 2 + that.labelSize) + ")",
                                        "font-size": that.labelSize,
                                        "font-family": textFontFamily,
                                        "src": textFontSrc,
                                        "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                                    });
                                    offset += that.labelSize;
                                }

                                if (renderParams.valueText !== undefined) {
                                    jqSvg.text(g, 0, 0, renderParams.valueText + "", {
                                        transform: "translate(" + -that.variableWidthConstant / 2 + ", " + (that.variableHeightConstant / 2 + that.labelSize + offset) + ")",
                                        "font-size": that.labelSize,
                                        "font-family": textFontFamily,
                                        "src": textFontSrc,
                                        "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                                    });
                                }
                            }
                        }

                        //$(variable).attr("onmouseover", "BMA.SVGHelper.AddClass(this, 'modeldesigner-element-hover')");
                        //$(variable).attr("onmouseout", "BMA.SVGHelper.RemoveClass(this, 'modeldesigner-element-hover')");

                        var svgElem: any = $(jqSvg.toSVG()).children();
                        return <SVGElement>svgElem;
                    },
                    function (pointerX: number, pointerY: number, elementX, elementY) {
                        return pointerX > elementX - that.variableWidthConstant / 2 && pointerX < elementX + that.variableWidthConstant / 2 &&
                            pointerY > elementY - that.variableHeightConstant / 2 && pointerY < elementY + that.variableHeightConstant / 2;
                    },
                    function (elementX: number, elementY: number) {
                        return { x: elementX - that.variableWidthConstant / 2, y: elementY - that.variableHeightConstant / 2, width: that.variableWidthConstant, height: that.variableHeightConstant };
                    },
                    "Intracellular Protein",
                    "variable-icon"));

                this.elements.push(new BboxElement(
                    "MembraneReceptor",
                    function (renderParams) {
                        var jqSvg = that.svg;
                        if (jqSvg === undefined)
                            return undefined;
                        jqSvg.clear();

                        //Checking additional global offset
                        var translate = renderParams.translate === undefined ? { x: 0, y: 0 } : renderParams.translate;

                        var g = jqSvg.group({
                            transform: "translate(" + (renderParams.layout.PositionX + translate.x) + ", " + (renderParams.layout.PositionY + translate.y) + ")",
                        });

                        if (!renderParams.textOnly) {
                            var angle = 0;
                            if (renderParams.gridCell !== undefined) {
                                angle = that.CalculateRotationAngle(renderParams.gridCell, renderParams.grid, renderParams.sizeCoef, renderParams.layout.PositionX, renderParams.layout.PositionY);
                            }

                            var pathFill = renderParams.isSelected ? "#39c" : "#09c";
                            if (renderParams.isHighlighted !== undefined && !renderParams.isHighlighted) {
                                pathFill = "#EDEDED";
                            }

                            if (renderParams.isHighlighted) {
                                var rad = 1.1 * Math.max(that.variableHeightConstant, that.variableWidthConstant) * renderParams.sizeCoef / 2;
                                jqSvg.ellipse(g, 0, 0, rad, rad, { stroke: "#EF4137", fill: "transparent" });
                            }



                            var data = "";
                            if (renderParams.isSelected) {
                                data = "M 48.65 68.86 a 3 3 0 0 1 -3 -3 V 46.19 L 45.2 46 c -4.83 -1.66 -8 -6.67 -8 -12.75 a 3 3 0 0 1 6 0 c 0 4.17 2.31 7.3 5.38 7.3 S 54 37.46 54 33.29 a 3 3 0 0 1 6 0 c 0 6.08 -3.12 11.09 -7.95 12.75 l -0.43 0.15 V 65.85 A 3 3 0 0 1 48.65 68.86 Z";
                            } else {
                                data = "M 60.47 33.25 a 3.66 3.66 0 1 0 -7.31 0 c 0 3.79 -2 6.64 -4.73 6.64 S 43.7 37 43.7 33.25 a 3.66 3.66 0 0 0 -7.32 0 c 0 6.47 3.42 11.64 8.39 13.36 V 65.8 a 3.66 3.66 0 1 0 7.31 0 V 46.61 C 57.05 44.89 60.47 39.72 60.47 33.25 Z";
                            }
                            var scale = 0.6 * (renderParams.sizeCoef === undefined ? 1 : renderParams.sizeCoef);
                            var path = jqSvg.createPath();
                            var variable = jqSvg.path(g, path, {
                                fill: pathFill,
                                d: data,
                                transform: " scale(" + scale + ") " + "rotate(" + angle + ")" + " translate(-50 -50)"
                            });

                            if (renderParams.isSelected) {
                                data = "M 57 30.94 a 2.35 2.35 0 0 1 2.35 2.35 c 0 5.8 -2.94 10.56 -7.51 12.14 l -0.87 0.3 V 65.85 a 2.36 2.36 0 0 1 -4.72 0 V 45.73 l -0.88 -0.3 c -4.56 -1.58 -7.51 -6.34 -7.51 -12.14 a 2.36 2.36 0 0 1 4.72 0 c 0 4.54 2.59 8 6 8 s 6 -3.41 6 -8 A 2.35 2.35 0 0 1 57 30.94 m 0 -1.3 a 3.65 3.65 0 0 0 -3.66 3.65 c 0 3.8 -2 6.65 -4.73 6.65 s -4.73 -2.85 -4.73 -6.65 a 3.66 3.66 0 0 0 -7.32 0 C 36.6 39.77 40 44.94 45 46.66 V 65.85 a 3.66 3.66 0 0 0 7.32 0 V 46.66 c 5 -1.72 8.38 -6.89 8.38 -13.37 A 3.64 3.64 0 0 0 57 29.64 Z";
                                var path2 = jqSvg.createPath();
                                var variable = jqSvg.path(g, path2, {
                                    fill: "#036",
                                    d: data,
                                    transform: " scale(" + scale + ") " + "rotate(" + angle + ")" + " translate(-50 -50)" //"scale(1.2) rotate(" + angle + ")"
                                });
                            }

                            //jqSvg.ellipse(g, 0, 0, 10, 10, { stroke: "red", fill: "red" });

                            //if (that.labelVisibility === true) {
                            //    var offset = 0;

                            //    if (renderParams.model.Name !== "") {
                            //        var textLabel = jqSvg.text(g, 0, 0, renderParams.model.Name, {
                            //            transform: "translate(" + -that.variableWidthConstant / 2 + ", " + (that.variableHeightConstant / 2 + that.labelSize) + ")",
                            //            "font-size": that.labelSize,
                            //            "font-family": textFontFamily,
                            //            "src": textFontSrc,
                            //            "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                            //        });
                            //        offset += that.labelSize;
                            //    }

                            //    if (renderParams.valueText !== undefined) {
                            //        jqSvg.text(g, 0, 0, renderParams.valueText + "", {
                            //            transform: "translate(" + -that.variableWidthConstant / 2 + ", " + (that.variableHeightConstant / 2 + that.labelSize + offset) + ")",
                            //            "font-size": that.labelSize,
                            //            "font-family": textFontFamily,
                            //            "src": textFontSrc,
                            //            "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                            //        });
                            //    }
                            //}

                            if (renderParams.isValid !== undefined && renderParams.isValid !== true) {
                                var offsetX = 0.3 * that.variableWidthConstant * renderParams.sizeCoef;
                                var offsetY = - 0.4 * that.variableWidthConstant * renderParams.sizeCoef;

                                var invalidGroup = jqSvg.group(g, {
                                    transform: "translate(" + offsetX + ", " + offsetY + ") scale(0.25) translate(-20.06 -20.06)",
                                });

                                jqSvg.ellipse(invalidGroup, 20.06, 20.06, 20.06, 20.06, {
                                    "stroke": "red",
                                    "fill": "red"
                                });
                                jqSvg.ellipse(invalidGroup, 20.06, 32.09, 4, 4, {
                                    "stroke": "red",
                                    "fill": "#fff"
                                });
                                jqSvg.line(invalidGroup, 20.06, 8.05, 20.06, 21.07, {
                                    stroke: "#fff",
                                    "stroke-linecap": "round",
                                    "stroke-miterlimit": 10,
                                    "stroke-width": "6.8px"
                                });
                            }
                        } else {
                            if (that.labelVisibility === true) {
                                var offset = 0;

                                if (renderParams.model.Name !== "") {
                                    var textLabel = jqSvg.text(g, 0, 0, renderParams.model.Name, {
                                        transform: "translate(" + -that.variableWidthConstant * renderParams.sizeCoef / 2 + ", " + (that.variableHeightConstant * renderParams.sizeCoef / 2 + that.labelSize) + ")",
                                        "font-size": that.labelSize,
                                        "font-family": textFontFamily,
                                        "src": textFontSrc,
                                        "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                                    });
                                    offset += that.labelSize;
                                }

                                if (renderParams.valueText !== undefined) {
                                    jqSvg.text(g, 0, 0, renderParams.valueText + "", {
                                        transform: "translate(" + -that.variableWidthConstant * renderParams.sizeCoef / 2 + ", " + (that.variableHeightConstant * renderParams.sizeCoef / 2 + that.labelSize + offset) + ")",
                                        "font-size": that.labelSize,
                                        "font-family": textFontFamily,
                                        "src": textFontSrc,
                                        "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                                    });
                                }
                            }
                        }

                        /*
                        //Helper bounding box
                        jqSvg.rect(
                            renderParams.layout.PositionX - that.variableWidthConstant / 2,
                            renderParams.layout.PositionY - that.variableHeightConstant / 2,
                            that.variableWidthConstant,
                            that.variableHeightConstant,
                            0,
                            0,
                            { stroke: "red", fill: "none" });
                        */

                        //$(variable).attr("onmouseover", "BMA.SVGHelper.AddClass(this, 'modeldesigner-element-hover')");
                        //$(variable).attr("onmouseout", "BMA.SVGHelper.RemoveClass(this, 'modeldesigner-element-hover')");

                        var svgElem: any = $(jqSvg.toSVG()).children();
                        return <SVGElement>svgElem;
                    },
                    function (pointerX: number, pointerY: number, elementX, elementY) {
                        return pointerX > elementX - that.variableWidthConstant / 2 && pointerX < elementX + that.variableWidthConstant / 2 &&
                            pointerY > elementY - that.variableHeightConstant / 2 && pointerY < elementY + that.variableHeightConstant / 2;
                    },
                    function (elementX: number, elementY: number) {
                        return { x: elementX - that.variableWidthConstant / 2, y: elementY - that.variableHeightConstant / 2, width: that.variableWidthConstant, height: that.variableHeightConstant };
                    },
                    "Membrane Receptor",
                    "receptor-icon"));

                this.elements.push(new Element(
                    "Activator",
                    function (renderParams) {
                        var jqSvg = that.svg;
                        if (jqSvg === undefined)
                            return undefined;
                        jqSvg.clear();

                        //Checking additional global offset
                        var translate = renderParams.translate === undefined ? { x: 0, y: 0 } : renderParams.translate;

                        var lineRef = undefined;
                        var lw = that.lineWidth === 0 ? 1 : that.lineWidth > 0 ? that.lineWidth : 1 / Math.abs(that.lineWidth);

                        if (renderParams.layout.start.Id === renderParams.layout.end.Id) {
                            var pathFill = "#ccc";
                            if (renderParams.isHighlighted !== undefined && !renderParams.isHighlighted) {
                                pathFill = "#EDEDED";
                            }

                            if (renderParams.isSelected) {
                                pathFill = "#666";
                            }

                            var angle = 0;
                            if (renderParams.layout.hasRotation) {
                                angle = that.CalculateRotationAngle(renderParams.layout.gridCell, renderParams.grid, renderParams.layout.startSizeCoef, renderParams.layout.start.PositionX, renderParams.layout.start.PositionY);
                            }

                            var iconTranslate = renderParams.layout.hasRotation ? "translate(-25  -35)" : "translate(-10  -40)";

                            var g = jqSvg.group({
                                transform: "translate(" + renderParams.layout.start.PositionX + ", " + renderParams.layout.start.PositionY + ")",
                            });

                            var data = "M 34.22 37.37 a 17.73 17.73 0 1 1 0 25.07";
                            var scale = 0.5 * renderParams.layout.startSizeCoef;
                            var path = jqSvg.createPath();
                            var variable = jqSvg.path(g, path, {
                                stroke: pathFill,
                                fill: "none",
                                strokeWidth: 2 * (lw + 1) / renderParams.layout.startSizeCoef,
                                "marker-end": renderParams.isSelected ? "url(#ActivatorSelected)" : "url(#Activator)",
                                d: data,
                                transform: "scale(" + scale + ") rotate(" + angle + ") " + iconTranslate,
                                "stroke-linecap": "round"
                            });
                        } else {

                            var dir = {
                                x: renderParams.layout.end.PositionX - renderParams.layout.start.PositionX,
                                y: renderParams.layout.end.PositionY - renderParams.layout.start.PositionY
                            };
                            var dirLen = Math.sqrt(dir.x * dir.x + dir.y * dir.y);

                            dir.x /= dirLen;
                            dir.y /= dirLen;

                            var isRevers = dirLen / 2 < Math.sqrt(dir.x * dir.x * that.relationshipBboxOffset * that.relationshipBboxOffset + dir.y * dir.y * that.relationshipBboxOffset * that.relationshipBboxOffset);

                            var start = {
                                x: renderParams.layout.start.PositionX + dir.x * that.relationshipBboxOffset * renderParams.layout.startSizeCoef + translate.x,
                                y: renderParams.layout.start.PositionY + dir.y * that.relationshipBboxOffset * renderParams.layout.startSizeCoef + translate.y
                            };

                            var end = {
                                x: renderParams.layout.end.PositionX - dir.x * that.relationshipBboxOffset * renderParams.layout.endSizeCoef + translate.x,
                                y: renderParams.layout.end.PositionY - dir.y * that.relationshipBboxOffset * renderParams.layout.endSizeCoef + translate.y
                            };

                            if (isRevers) {
                                var tmpStart = start;
                                start = end;
                                end = tmpStart;
                            }

                            if (renderParams.hasReverse === true || (<any>window).VisualSettings.ForceCurvedRelationships === true) {
                                lineRef = that.CreateBezier(start, end, lw, "Activator", jqSvg, renderParams.isSelected);
                            } else {
                                lineRef = that.CreateLine(start, end, lw, "Activator", jqSvg, renderParams.isSelected);
                            }
                        }

                        if (lineRef !== undefined) {
                            //$(lineRef).attr("onmouseover", "BMA.SVGHelper.Highlight(this, window.ElementRegistry.LineWidth + 2)");
                            //$(lineRef).attr("onmouseout", "BMA.SVGHelper.UnHighlight(this, window.ElementRegistry.LineWidth + 1)");
                            $(lineRef).attr("data-id", renderParams.id);
                            $(lineRef).attr("data-ishovered", "false");
                        }

                        var svgElem: any = $(jqSvg.toSVG()).children();
                        return <SVGElement>svgElem;

                    },
                    function (pointerX: number, pointerY: number, elementX, elementY) {

                        //Method is obsolete as bezier is now used for rendering of some relationships
                        //TODO: add exception throw
                        return false;

                        /*
                        if (elementX.x !== elementY.x || elementX.y !== elementY.y) {
                            var dot1 = (pointerX - elementX.x) * (elementY.x - elementX.x) + (pointerY - elementX.y) * (elementY.y - elementX.y);

                            if (dot1 < 0) {
                                return Math.sqrt(Math.pow(elementX.y - pointerY, 2) + Math.pow(elementX.x - pointerX, 2)) < elementX.pixelWidth;
                            }

                            var dot2 = Math.pow(elementY.y - elementX.y, 2) + Math.pow(elementY.x - elementX.x, 2);

                            if (dot2 <= dot1) {
                                return Math.sqrt(Math.pow(elementY.y - pointerY, 2) + Math.pow(elementY.x - pointerX, 2)) < elementX.pixelWidth;
                            }

                            var d = Math.abs((elementY.y - elementX.y) * pointerX - (elementY.x - elementX.x) * pointerY + elementY.x * elementX.y - elementX.x * elementY.y);
                            d /= Math.sqrt(Math.pow(elementY.y - elementX.y, 2) + Math.pow(elementY.x - elementX.x, 2));
                            return d < elementX.pixelWidth;
                        } else {
                            var x0 = elementX.x;
                            var y0 = elementX.y;
                            var w = that.variableWidthConstant * 0.7 * 0.6;
                            var h = that.variableHeightConstant * 0.7 * 1.6;

                            var ellipseX = x0 + w;
                            var ellipseY = y0;

                            var points = SVGHelper.GeEllipsePoints(ellipseX, ellipseY, w, h, pointerX, pointerY);
                            var len1 = Math.sqrt(Math.pow(points[0].x - pointerX, 2) + Math.pow(points[0].y - pointerY, 2));
                            var len2 = Math.sqrt(Math.pow(points[1].x - pointerX, 2) + Math.pow(points[1].y - pointerY, 2));

                            //console.log(len1 + ", " + len2);
                            return len1 < elementX.pixelWidth || len2 < elementX.pixelWidth;
                        }
                        */
                    },
                    "Activating Relationship",
                    "activate-icon"));

                this.elements.push(new Element(
                    "Inhibitor",
                    function (renderParams) {
                        var jqSvg = that.svg;
                        if (jqSvg === undefined)
                            return undefined;
                        jqSvg.clear();

                        //Checking additional global offset
                        var translate = renderParams.translate === undefined ? { x: 0, y: 0 } : renderParams.translate;

                        var lineRef = undefined;
                        var lw = that.lineWidth === 0 ? 1 : that.lineWidth > 0 ? that.lineWidth : 1 / Math.abs(that.lineWidth);

                        if (renderParams.layout.start.Id === renderParams.layout.end.Id) {
                            var pathFill = "#ccc";
                            if (renderParams.isHighlighted !== undefined && !renderParams.isHighlighted) {
                                pathFill = "#EDEDED";
                            }

                            if (renderParams.isSelected) {
                                pathFill = "#666";
                            }

                            var angle = 0;
                            if (renderParams.layout.hasRotation) {
                                angle = that.CalculateRotationAngle(renderParams.layout.gridCell, renderParams.grid, renderParams.layout.startSizeCoef, renderParams.layout.start.PositionX, renderParams.layout.start.PositionY);
                            }

                            var iconTranslate = renderParams.layout.hasRotation ? "translate(-25  -35)" : "translate(-10  -40)";

                            var g = jqSvg.group({
                                transform: "translate(" + renderParams.layout.start.PositionX + ", " + renderParams.layout.start.PositionY + ")",
                            });

                            var data = "M 34.22 37.37 a 17.73 17.73 0 1 1 0 25.07";
                            var scale = 0.5 * renderParams.layout.startSizeCoef;
                            var path = jqSvg.createPath();
                            var variable = jqSvg.path(g, path, {
                                stroke: pathFill,
                                fill: "none",
                                strokeWidth: 2 * (lw + 1) / renderParams.layout.startSizeCoef,
                                "marker-end": renderParams.isSelected ? "url(#InhibitorSelected)" : "url(#Inhibitor)",
                                d: data,
                                transform: "scale(" + scale + ") rotate(" + angle + ") " + iconTranslate,
                                "stroke-linecap": "round"
                            });
                        } else {

                            var dir = {
                                x: renderParams.layout.end.PositionX - renderParams.layout.start.PositionX,
                                y: renderParams.layout.end.PositionY - renderParams.layout.start.PositionY
                            };
                            var dirLen = Math.sqrt(dir.x * dir.x + dir.y * dir.y);

                            dir.x /= dirLen;
                            dir.y /= dirLen;

                            var isRevers = dirLen / 2 < Math.sqrt(dir.x * dir.x * that.relationshipBboxOffset * that.relationshipBboxOffset + dir.y * dir.y * that.relationshipBboxOffset * that.relationshipBboxOffset);


                            var start = {
                                x: renderParams.layout.start.PositionX + dir.x * that.relationshipBboxOffset * renderParams.layout.startSizeCoef + translate.x,
                                y: renderParams.layout.start.PositionY + dir.y * that.relationshipBboxOffset * renderParams.layout.startSizeCoef + translate.y
                            };

                            var end = {
                                x: renderParams.layout.end.PositionX - dir.x * that.relationshipBboxOffset * renderParams.layout.endSizeCoef + translate.x,
                                y: renderParams.layout.end.PositionY - dir.y * that.relationshipBboxOffset * renderParams.layout.endSizeCoef + translate.y
                            };

                            if (isRevers) {
                                var tmpStart = start;
                                start = end;
                                end = tmpStart;
                            }

                            if (renderParams.hasReverse === true || (<any>window).VisualSettings.ForceCurvedRelationships === true) {
                                lineRef = that.CreateBezier(start, end, lw, "Inhibitor", jqSvg, renderParams.isSelected);
                            } else {
                                lineRef = that.CreateLine(start, end, lw, "Inhibitor", jqSvg, renderParams.isSelected);
                            }
                        }

                        if (lineRef !== undefined) {
                            //$(lineRef).attr("onmouseover", "BMA.SVGHelper.Highlight(this, window.ElementRegistry.LineWidth + 2)");
                            //$(lineRef).attr("onmouseout", "BMA.SVGHelper.UnHighlight(this, window.ElementRegistry.LineWidth + 1)");
                            $(lineRef).attr("data-id", renderParams.id);
                            $(lineRef).attr("data-ishovered", "false");
                        }

                        var svgElem: any = $(jqSvg.toSVG()).children();
                        return <SVGElement>svgElem;

                    },
                    function (pointerX: number, pointerY: number, elementX, elementY) {

                        //Method is obsolete as bezier is now used for rendering of some relationships
                        //TODO: add exception throw
                        return false;

                        /*
                        if (elementX.x !== elementY.x || elementX.y !== elementY.y) {
                            var dot1 = (pointerX - elementX.x) * (elementY.x - elementX.x) + (pointerY - elementX.y) * (elementY.y - elementX.y);

                            if (dot1 < 0) {
                                return Math.sqrt(Math.pow(elementX.y - pointerY, 2) + Math.pow(elementX.x - pointerX, 2)) < elementX.pixelWidth;
                            }

                            var dot2 = Math.pow(elementY.y - elementX.y, 2) + Math.pow(elementY.x - elementX.x, 2);

                            if (dot2 <= dot1) {
                                return Math.sqrt(Math.pow(elementY.y - pointerY, 2) + Math.pow(elementY.x - pointerX, 2)) < elementX.pixelWidth;
                            }

                            var d = Math.abs((elementY.y - elementX.y) * pointerX - (elementY.x - elementX.x) * pointerY + elementY.x * elementX.y - elementX.x * elementY.y);
                            d /= Math.sqrt(Math.pow(elementY.y - elementX.y, 2) + Math.pow(elementY.x - elementX.x, 2));
                            return d < elementX.pixelWidth;
                        } else {


                            var x0 = elementX.x;
                            var y0 = elementX.y;
                            var w = that.variableWidthConstant * 0.7 * 0.6;
                            var h = that.variableHeightConstant * 0.7 * 1.6;

                            var ellipseX = x0 + w;
                            var ellipseY = y0;

                            var points = SVGHelper.GeEllipsePoints(ellipseX, ellipseY, w, h, pointerX, pointerY);
                            var len1 = Math.sqrt(Math.pow(points[0].x - pointerX, 2) + Math.pow(points[0].y - pointerY, 2));
                            var len2 = Math.sqrt(Math.pow(points[1].x - pointerX, 2) + Math.pow(points[1].y - pointerY, 2));

                            //console.log(len1 + ", " + len2);
                            return len1 < elementX.pixelWidth || len2 < elementX.pixelWidth;
                        }
                        */
                    },
                    "Inhibiting Relationship",
                    "inhibit-icon"));
            }
        }
    }
} 
