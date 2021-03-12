module BMA {
    export module SVGRendering {
        export class InhibitorRenderInfo extends ElementRenderInfo implements StrokeElement {
            private jqSvg: any;
            private lineWidth: number;

            private selfRelPath: string;
            private selfRelGeometry: any;

            public get LineWidth(): number {
                return this.lineWidth;
            }

            public set LineWidth(value: number) {
                this.lineWidth = value;
            }

           constructor(svg: any) {
                super("Inhibitor", "Inhibiting Relationship", "inhibit-icon");
               this.jqSvg = svg;

               this.selfRelPath = "M 34.22 37.37 a 17.73 17.73 0 1 1 0 25.07 M 36.5 58.3 L 30.5 64.3";//L 33.5 61.3
               this.selfRelGeometry = new Path2D(this.selfRelPath);
            }

            public Contains(pointerX: number, pointerY: number, elementX, elementY) {
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
            }

            public RenderToCanvas(context: any, renderParams: any) {
                var that = this;

                //Checking additional global offset
                var translate = renderParams.translate === undefined ? { x: 0, y: 0 } : renderParams.translate;

                var lw = that.lineWidth === 0 ? 1 : that.lineWidth > 0 ? that.lineWidth : 1 / Math.abs(that.lineWidth);

                var cs = renderParams.coordinateTransform;

                context.lineCap = "round";

                if (renderParams.layout.start.Id === renderParams.layout.end.Id) {
                    var pathFill = "#aaa";//"#ccc";

                    if (renderParams.isSelected) {
                        pathFill = "#999999";
                    }

                    if (renderParams.customFill)
                        pathFill = renderParams.customFill;

                    var angle = 0;
                    if (renderParams.layout.hasRotation) {
                        angle = BMA.SVGRendering.RenderHelper.CalculateRotationAngle(renderParams.layout.gridCell, renderParams.grid, renderParams.layout.startSizeCoef, renderParams.layout.start.PositionX, renderParams.layout.start.PositionY) * Math.PI / 180.0;
                    }

                    var x = cs.dataToScreenX(renderParams.layout.start.PositionX);
                    var y = cs.dataToScreenY(renderParams.layout.start.PositionY);

                    var iconTranslate = renderParams.layout.hasRotation ? { x: -25, y: -35 } : { x: -10, y: -40 };
                    var scale = 0.5;

                    context.beginPath();
                    context.lineWidth = cs.plotToScreenWidth(lw + 1);
                    context.strokeStyle = pathFill;
                    context.translate(x, y);
                    context.scale(cs.plotToScreenWidth(scale), cs.plotToScreenHeight(scale));
                    context.rotate(angle);
                    context.translate(iconTranslate.x, iconTranslate.y);
                    context.stroke(that.selfRelGeometry);
                    context.setTransform(1, 0, 0, 1, 0, 0);
                } else {

                    var dir = {
                        x: renderParams.layout.end.PositionX - renderParams.layout.start.PositionX,
                        y: renderParams.layout.end.PositionY - renderParams.layout.start.PositionY
                    };
                    var dirLen = Math.sqrt(dir.x * dir.x + dir.y * dir.y);

                    dir.x /= dirLen;
                    dir.y /= dirLen;

                    var isRevers = dirLen / 2 < Math.sqrt(dir.x * dir.x * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset + dir.y * dir.y * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset);

                    var start = {
                        x: renderParams.layout.start.PositionX + dir.x * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset/* * renderParams.layout.startSizeCoef*/ + translate.x,
                        y: renderParams.layout.start.PositionY + dir.y * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset/* * renderParams.layout.startSizeCoef*/ + translate.y
                    };

                    var end = {
                        x: renderParams.layout.end.PositionX - dir.x * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset/* * renderParams.layout.endSizeCoef*/ + translate.x,
                        y: renderParams.layout.end.PositionY - dir.y * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset/* * renderParams.layout.endSizeCoef*/ + translate.y
                    };

                    if (isRevers) {
                        var tmpStart = start;
                        start = end;
                        end = tmpStart;
                    }

                    var xStart = cs.dataToScreenX(start.x);
                    var yStart = cs.dataToScreenY(start.y);

                    var xEnd = cs.dataToScreenX(end.x);
                    var yEnd = cs.dataToScreenY(end.y);

                    context.strokeStyle = renderParams.isSelected ? "#999999" : "#aaa";
                    context.lineWidth = cs.plotToScreenWidth(lw + 1);
                    if (renderParams.hasReverse === true || (<any>window).VisualSettings.ForceCurvedRelationships === true) {
                        context.beginPath();
                        var points = RenderHelper.CreateBezierPoints({ x: xStart, y: yStart }, { x: xEnd, y: yEnd }, cs.plotToScreenWidth(1));
                        RenderHelper.bezierWithArrowheads(context, "Inhibitor", points.p0, points.p1, points.p2, points.p3, cs.plotToScreenWidth(4), true);
                    } else {
                        RenderHelper.drawLineWithArrows(context, xStart, yStart, xEnd, yEnd, cs.plotToScreenWidth(4), 0, false, true);
                    }
                }
            }

            public RenderToSvg(renderParams: any) {
                var that = this;
                var jqSvg = this.jqSvg;
                if (jqSvg === undefined)
                    return undefined;
                jqSvg.clear();

                //Checking additional global offset
                var translate = renderParams.translate === undefined ? { x: 0, y: 0 } : renderParams.translate;

                var lineRef = undefined;
                var lw = that.lineWidth === 0 ? 1 : that.lineWidth > 0 ? that.lineWidth : 1 / Math.abs(that.lineWidth);

                if (renderParams.layout.start.Id === renderParams.layout.end.Id) {
                    var pathFill = "#aaa"; //"#ccc";

                    if (renderParams.isSelected) {
                        pathFill = "#999999";
                    }

                    var angle = 0;
                    if (renderParams.layout.hasRotation) {
                        angle = BMA.SVGRendering.RenderHelper.CalculateRotationAngle(renderParams.layout.gridCell, renderParams.grid, renderParams.layout.startSizeCoef, renderParams.layout.start.PositionX, renderParams.layout.start.PositionY);
                    }

                    var iconTranslate = renderParams.layout.hasRotation ? "translate(-25  -35)" : "translate(-10  -40)";

                    var g = jqSvg.group({
                        transform: "translate(" + renderParams.layout.start.PositionX + ", " + renderParams.layout.start.PositionY + ")",
                    });

                    var data = "M 34.22 37.37 a 17.73 17.73 0 1 1 0 25.07";
                    var scale = 0.5;// * renderParams.layout.startSizeCoef;
                    var path = jqSvg.createPath();
                    lineRef = jqSvg.path(g, path, {
                        stroke: pathFill,
                        fill: "none",
                        strokeWidth: 2 * (lw + 1),// / renderParams.layout.startSizeCoef,
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

                    var isRevers = dirLen / 2 < Math.sqrt(dir.x * dir.x * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset + dir.y * dir.y * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset);


                    var start = {
                        x: renderParams.layout.start.PositionX + dir.x * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset /** renderParams.layout.startSizeCoef*/ + translate.x,
                        y: renderParams.layout.start.PositionY + dir.y * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset /** renderParams.layout.startSizeCoef*/ + translate.y
                    };

                    var end = {
                        x: renderParams.layout.end.PositionX - dir.x * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset /** renderParams.layout.endSizeCoef*/ + translate.x,
                        y: renderParams.layout.end.PositionY - dir.y * BMA.SVGRendering.SVGRenderingConstants.relationshipBboxOffset /** renderParams.layout.endSizeCoef*/ + translate.y
                    };

                    if (isRevers) {
                        var tmpStart = start;
                        start = end;
                        end = tmpStart;
                    }

                    if (renderParams.hasReverse === true || (<any>window).VisualSettings.ForceCurvedRelationships === true) {
                        lineRef = BMA.SVGRendering.RenderHelper.CreateBezierSVG(jqSvg, start, end, lw, "Inhibitor", renderParams.isSelected, renderParams.customFill);
                    } else {
                        lineRef = BMA.SVGRendering.RenderHelper.CreateLine(jqSvg, start, end, lw, "Inhibitor", renderParams.isSelected, renderParams.customFill);
                    }
                }

                if (lineRef !== undefined) {
                    $(lineRef).attr("onmouseover", "BMA.SVGHelper.Highlight(this, window.ElementRegistry.LineWidth + 1)");
                    $(lineRef).attr("onmouseout", "BMA.SVGHelper.UnHighlight(this, window.ElementRegistry.LineWidth + 1)");
                    $(lineRef).attr("data-id", renderParams.id);
                    $(lineRef).attr("data-ishovered", "false");
                }

                var svgElem: any = $(jqSvg.toSVG()).children();
                return <SVGElement>svgElem;
            }

            public GetIconSVG(iconFill: string): string {
                return undefined;
            }
        }
    }
}