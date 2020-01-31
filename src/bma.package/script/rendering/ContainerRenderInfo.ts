module BMA {
    export module SVGRendering {
        export class ContainerRenderInfo implements Element {
            public get Type(): string {
                return "Container";
            }

            public get Description(): string {
                return "Cell";
            }

            public get IconClass(): string {
                return "cell-icon";
            }

            private jqSvg: any;

            constructor(svg: any) {
                this.jqSvg = svg;
            }

            public RenderToSvg(renderParams: any) {
                var jqSvg = this.jqSvg;
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
                        - renderParams.grid.xStep * renderParams.layout.Size / 2 + renderParams.grid.xStep * BMA.SVGRendering.SVGRenderingConstants.containerPaddingCoef + (renderParams.translate === undefined ? 0 : renderParams.translate.x),
                        - renderParams.grid.yStep * renderParams.layout.Size / 2 + renderParams.grid.yStep * BMA.SVGRendering.SVGRenderingConstants.containerPaddingCoef + (renderParams.translate === undefined ? 0 : renderParams.translate.y),
                        renderParams.grid.xStep * renderParams.layout.Size - 2 * renderParams.grid.xStep * BMA.SVGRendering.SVGRenderingConstants.containerPaddingCoef,
                        renderParams.grid.yStep * renderParams.layout.Size - 2 * renderParams.grid.yStep * BMA.SVGRendering.SVGRenderingConstants.containerPaddingCoef,
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
                    var selectedPathFill = '#62b9d1';

                    if ((<any>window).VisualSettings !== undefined && (<any>window).VisualSettings.IsOldColorSchemeEnabled) {
                        pathFill = "#faaf40";
                        selectedPathFill = "gray";
                    }

                    if (renderParams.isHighlighted !== undefined && !renderParams.isHighlighted) {
                        pathFill = "#EDEDED";
                    }

                    var op = jqSvg.path(g, cellPath, {
                        stroke: renderParams.isSelected ? selectedPathFill : pathFill,
                        strokeWidth: 2,
                        fill: pathFill,
                        "fill-rule": "evenodd",
                        d: cellData,
                        transform: "scale(" + scale + ") translate(-640, -487)"
                    });

                    if (renderParams.translate === undefined) {

                        var xThickness = BMA.SVGRendering.SVGRenderingConstants.containerOuterEllipseWidth - BMA.SVGRendering.SVGRenderingConstants.containerInnerEllipseWidth;
                        var yThickness = BMA.SVGRendering.SVGRenderingConstants.containerOuterEllipseHeight - BMA.SVGRendering.SVGRenderingConstants.containerInnerEllipseHeight;

                        jqSvg.ellipse(g,
                            BMA.SVGRendering.SVGRenderingConstants.containerInnerCenterOffset * renderParams.layout.Size,
                            0,
                            BMA.SVGRendering.SVGRenderingConstants.containerInnerEllipseWidth * renderParams.layout.Size + xThickness * (renderParams.layout.Size - 1),
                            BMA.SVGRendering.SVGRenderingConstants.containerInnerEllipseHeight * renderParams.layout.Size + yThickness * (renderParams.layout.Size - 1), { stroke: "none", fill: "white" });

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
                                "font-family": BMA.SVGRendering.SVGRenderingConstants.textFontFamily,
                                "src": BMA.SVGRendering.SVGRenderingConstants.textFontSrc,
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
            }
        }
    }
}