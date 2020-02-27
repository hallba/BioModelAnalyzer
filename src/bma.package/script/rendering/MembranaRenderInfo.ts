module BMA {
    export module SVGRendering {
        export class MembranaRenderInfo extends ElementRenderInfo implements BboxElement {
            private jqSvg: any;

            constructor(svg: any) {
                super("MembraneReceptor", "Membrane Receptor", "receptor-icon");
                this.jqSvg = svg;
            }

            public GetBoundingBox(elementX: number, elementY: number): { x: number; y: number; width: number; height: number } {
                return { x: elementX - BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant / 2, y: elementY - BMA.SVGRendering.SVGRenderingConstants.variableHeightConstant / 2, width: BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant, height: BMA.SVGRendering.SVGRenderingConstants.variableHeightConstant };
            }

            public Contains(pointerX: number, pointerY: number, elementX, elementY) {
                return pointerX > elementX - BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant / 2 && pointerX < elementX + BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant / 2 &&
                    pointerY > elementY - BMA.SVGRendering.SVGRenderingConstants.variableHeightConstant / 2 && pointerY < elementY + BMA.SVGRendering.SVGRenderingConstants.variableHeightConstant / 2;
            }

            public RenderToSvg(renderParams: any) {
                var that = this;
                var jqSvg = this.jqSvg;
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
                        angle = BMA.SVGRendering.RenderHelper.CalculateRotationAngle(renderParams.gridCell, renderParams.grid, renderParams.sizeCoef, renderParams.layout.PositionX, renderParams.layout.PositionY);
                    }

                    var pathFill = renderParams.isSelected ? BMA.SVGRendering.BMAColorConstants.bmaMembranaFillSelectedColor : BMA.SVGRendering.BMAColorConstants.bmaMembranaFillColor;
                    var selectedPathFill = BMA.SVGRendering.BMAColorConstants.bmaDefaultStrokeColor;

                    //if ((<any>window).VisualSettings !== undefined && (<any>window).VisualSettings.IsOldColorSchemeEnabled) {
                    //    pathFill = "#bbbdbf";
                    //    selectedPathFill = "gray";
                    //}

                    if (renderParams.layout.fill !== undefined) {
                        var renderColors = BMA.SVGRendering.GetColorsForRendering(renderParams.layout.fill, "Membrana");

                        pathFill = renderColors.fill;
                        selectedPathFill = renderColors.stroke;
                    }

                    if (renderParams.layout.stroke !== undefined) {
                        selectedPathFill = renderParams.layout.stroke;
                    }

                    if (renderParams.isHighlighted !== undefined && !renderParams.isHighlighted) {
                        pathFill = "#EDEDED";
                    }

                    if (renderParams.isHighlighted) {
                        var rad = 16;// * renderParams.sizeCoef;
                        jqSvg.ellipse(g, 0, 0, rad, rad, { stroke: "#33cc00"/*"#EF4137"*/, fill: "transparent" });
                    }



                    var data = "";
                    if (renderParams.isSelected) {
                        data = "M 48.65 68.86 a 3 3 0 0 1 -3 -3 V 46.19 L 45.2 46 c -4.83 -1.66 -8 -6.67 -8 -12.75 a 3 3 0 0 1 6 0 c 0 4.17 2.31 7.3 5.38 7.3 S 54 37.46 54 33.29 a 3 3 0 0 1 6 0 c 0 6.08 -3.12 11.09 -7.95 12.75 l -0.43 0.15 V 65.85 A 3 3 0 0 1 48.65 68.86 Z";
                    } else {
                        data = "M 60.47 33.25 a 3.66 3.66 0 1 0 -7.31 0 c 0 3.79 -2 6.64 -4.73 6.64 S 43.7 37 43.7 33.25 a 3.66 3.66 0 0 0 -7.32 0 c 0 6.47 3.42 11.64 8.39 13.36 V 65.8 a 3.66 3.66 0 1 0 7.31 0 V 46.61 C 57.05 44.89 60.47 39.72 60.47 33.25 Z";
                    }
                    var scale = 0.6;// * (renderParams.sizeCoef === undefined ? 1 : renderParams.sizeCoef);
                    var path = jqSvg.createPath();
                    var variable = jqSvg.path(g, path, {
                        fill: pathFill,
                        d: data,
                        transform: " scale(" + scale + ") " + "rotate(" + angle + ")" + " translate(-50 -47)"
                    });

                    if (renderParams.isSelected) {
                        data = "M 57 30.94 a 2.35 2.35 0 0 1 2.35 2.35 c 0 5.8 -2.94 10.56 -7.51 12.14 l -0.87 0.3 V 65.85 a 2.36 2.36 0 0 1 -4.72 0 V 45.73 l -0.88 -0.3 c -4.56 -1.58 -7.51 -6.34 -7.51 -12.14 a 2.36 2.36 0 0 1 4.72 0 c 0 4.54 2.59 8 6 8 s 6 -3.41 6 -8 A 2.35 2.35 0 0 1 57 30.94 m 0 -1.3 a 3.65 3.65 0 0 0 -3.66 3.65 c 0 3.8 -2 6.65 -4.73 6.65 s -4.73 -2.85 -4.73 -6.65 a 3.66 3.66 0 0 0 -7.32 0 C 36.6 39.77 40 44.94 45 46.66 V 65.85 a 3.66 3.66 0 0 0 7.32 0 V 46.66 c 5 -1.72 8.38 -6.89 8.38 -13.37 A 3.64 3.64 0 0 0 57 29.64 Z";
                        var path2 = jqSvg.createPath();
                        var variable = jqSvg.path(g, path2, {
                            fill: selectedPathFill,
                            d: data,
                            transform: " scale(" + scale + ") " + "rotate(" + angle + ")" + " translate(-50 -47)" //"scale(1.2) rotate(" + angle + ")"
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
                } else {
                    if (renderParams.isValid !== undefined && renderParams.isValid !== true) {
                        var offsetX = 0.3 * BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant;// * renderParams.sizeCoef;
                        var offsetY = - 0.4 * BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant;// * renderParams.sizeCoef;

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

                    if (that.LabelVisibility === true) {
                        var offset = 0;

                        if (renderParams.model.Name !== "") {
                            var textLabel = jqSvg.text(g, 0, 0, renderParams.model.Name, {
                                transform: "translate(" + -BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant * 0.5 /** renderParams.sizeCoef*/ + ", " + (BMA.SVGRendering.SVGRenderingConstants.variableHeightConstant * 0.5 /** renderParams.sizeCoef*/ + that.LabelSize) + ")",
                                "font-size": that.LabelSize,
                                "font-family": BMA.SVGRendering.SVGRenderingConstants.textFontFamily,
                                "src": BMA.SVGRendering.SVGRenderingConstants.textFontSrc,
                                "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                            });
                            offset += that.LabelSize;
                        }

                        if (renderParams.valueText !== undefined) {
                            jqSvg.text(g, 0, 0, renderParams.valueText + "", {
                                transform: "translate(" + -BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant * 0.5 /** renderParams.sizeCoef*/ + ", " + (BMA.SVGRendering.SVGRenderingConstants.variableHeightConstant * 0.5 /** renderParams.sizeCoef*/ + that.LabelSize + offset) + ")",
                                "font-size": that.LabelSize,
                                "font-family": BMA.SVGRendering.SVGRenderingConstants.textFontFamily,
                                "src": BMA.SVGRendering.SVGRenderingConstants.textFontSrc,
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
            }

            public GetIconSVG(iconFill: string): string {
                return undefined;
            }
        }
    }
}