module BMA {
    export module SVGRendering {
        export class ConstantRenderInfo extends ElementRenderInfo implements BboxElement {
            private jqSvg: any;
            
            constructor(svg: any) {
                super("Constant", "Extracellular Protein", "constant-icon");
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

                    var pathFill = BMA.SVGRendering.BMAColorConstants.bmaConstantFillColor;
                    var selectedPathFill = BMA.SVGRendering.BMAColorConstants.bmaConstantStrokeColor;

                    //if ((<any>window).VisualSettings !== undefined && (<any>window).VisualSettings.IsOldColorSchemeEnabled) {
                    //    pathFill = "#bbbdbf";
                    //    selectedPathFill = "gray";
                    //}

                    if (renderParams.layout.fill !== undefined) {
                        var renderColors = BMA.SVGRendering.GetColorsForRendering(renderParams.layout.fill, "Constant");

                        pathFill = renderColors.fill;
                        selectedPathFill = renderColors.stroke;
                    }

                    if (renderParams.layout.stroke !== undefined) {
                        selectedPathFill = renderParams.layout.stroke;
                    }

                    if (renderParams.isHighlighted !== undefined) {
                        if (!renderParams.isHighlighted) {
                            pathFill = "#EDEDED";
                        }
                        //else {
                        //    pathFill = "#EF4137";
                        //}
                    }

                    if (renderParams.isHighlighted) {
                        var rad = 16;//1.3 * Math.max(that.variableHeightConstant, that.variableWidthConstant) / 2;
                        jqSvg.ellipse(g, 0, 0, rad, rad, { stroke: "#33cc00"/*"#EF4137"*/, fill: "transparent" });
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
                        fill: renderParams.isSelected ? selectedPathFill : pathFill,
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


                } else {
                    if (renderParams.isValid !== undefined && renderParams.isValid !== true) {

                        var offsetX = 0.3 * BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant;
                        var offsetY = - 0.4 * BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant;

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
                                transform: "translate(" + -BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant / 2 + ", " + (BMA.SVGRendering.SVGRenderingConstants.variableHeightConstant / 2 + that.LabelSize) + ")",
                                "font-size": that.LabelSize,
                                "font-family": BMA.SVGRendering.SVGRenderingConstants.textFontFamily,
                                "src": BMA.SVGRendering.SVGRenderingConstants.textFontSrc,
                                "fill": renderParams.labelColor !== undefined ? renderParams.labelColor : "black"
                            });
                            offset += that.LabelSize;
                        }

                        if (renderParams.valueText !== undefined) {
                            jqSvg.text(g, 0, 0, renderParams.valueText + "", {
                                transform: "translate(" + -BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant / 2 + ", " + (BMA.SVGRendering.SVGRenderingConstants.variableHeightConstant / 2 + that.LabelSize + offset) + ")",
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
                var that = this;
                var jqSvg = this.jqSvg;
                if (jqSvg === undefined)
                    return undefined;
                jqSvg.clear();

                var fill = iconFill === undefined ? "#ccc" : iconFill;

                jqSvg.configure({ viewBox: '0 0 46.18 43.5', width: "36px", height: "36px" }, true);

                var defs = jqSvg.defs("icon");
                jqSvg.style(defs, ".icon-ep { fill:" + fill + ";}");

                var path1 = jqSvg.createPath();
                jqSvg.path(path1, {
                    class: "icon-ep",
                    d: "M55.8,71.76a4.6,4.6,0,0,1-3.28-1.36,4.65,4.65,0,0,1,0-6.57l11.11-11a1.64,1.64,0,0,0,0-2.32A1.67,1.67,0,0,0,62.46,50a1.65,1.65,0,0,0-1.16.48L50.23,61.54A4.65,4.65,0,0,1,43.65,55l11.12-11a1.65,1.65,0,0,0-2.33-2.33L41.36,52.68a4.65,4.65,0,0,1-6.57-6.58l11.11-11a1.64,1.64,0,0,0-2.33-2.32L30.2,46.11a1.5,1.5,0,0,1-1.06.44,1.5,1.5,0,0,1-1.5-1.5A1.5,1.5,0,0,1,28.08,44L41.45,30.62a4.65,4.65,0,0,1,6.57,0,4.65,4.65,0,0,1,0,6.57l-11.11,11a1.64,1.64,0,0,0,0,2.32,1.67,1.67,0,0,0,1.17.48,1.65,1.65,0,0,0,1.16-.48L50.31,39.48a4.65,4.65,0,0,1,6.58,6.57l-11.12,11a1.65,1.65,0,0,0,2.33,2.33L59.18,48.35a4.65,4.65,0,0,1,6.57,6.57L54.63,66A1.65,1.65,0,0,0,57,68.28L70.27,55a1.5,1.5,0,0,1,1.06-.44,1.5,1.5,0,0,1,1.5,1.5,1.48,1.48,0,0,1-.44,1.06L59.09,70.4A4.62,4.62,0,0,1,55.8,71.76Z",
                    transform: "translate(-27.14 -28.76)"
                });

                var path2 = jqSvg.createPath();
                jqSvg.path(path2, {
                    class: "icon-ep",
                    d: "M44.74,29.76A4.11,4.11,0,0,1,47.67,31a4.16,4.16,0,0,1,0,5.86L36.55,47.88a2.15,2.15,0,0,0,0,3,2.16,2.16,0,0,0,3,0L50.67,39.83a4.15,4.15,0,0,1,5.86,5.87l-11.11,11a2.15,2.15,0,0,0,0,3,2.17,2.17,0,0,0,3,0L59.53,48.7a4.15,4.15,0,0,1,5.87,5.86l-11.12,11a2.15,2.15,0,0,0,3,3l13.3-13.3a1,1,0,0,1,.71-.3,1,1,0,0,1,.7.3,1,1,0,0,1,0,1.41l-13.3,13.3a4.14,4.14,0,1,1-5.86-5.86L64,53.14a2.15,2.15,0,0,0,0-3,2.17,2.17,0,0,0-1.52-.62,2.15,2.15,0,0,0-1.51.62L49.87,61.19A4.15,4.15,0,0,1,44,55.32l11.11-11a2.15,2.15,0,0,0,0-3,2.17,2.17,0,0,0-3,0L41,52.32a4.15,4.15,0,0,1-5.87-5.86l11.12-11a2.16,2.16,0,0,0,0-3,2.13,2.13,0,0,0-1.51-.62,2.1,2.1,0,0,0-1.52.63L29.85,45.75a1,1,0,1,1-1.41-1.41L41.8,31a4.15,4.15,0,0,1,2.94-1.21m0-1a5.13,5.13,0,0,0-3.64,1.5L27.73,43.63a2,2,0,1,0,2.83,2.83L43.92,33.09a1.17,1.17,0,0,1,1.63,0,1.16,1.16,0,0,1,0,1.62l-11.11,11A5.14,5.14,0,1,0,41.71,53L52.79,42a1.15,1.15,0,0,1,1.63,1.61l-11.12,11a5.15,5.15,0,0,0,0,7.28,5.14,5.14,0,0,0,7.28,0L61.65,50.82a1.15,1.15,0,0,1,.81-.33,1.12,1.12,0,0,1,.81.33,1.15,1.15,0,0,1,0,1.62l-11.12,11a5.14,5.14,0,0,0,3.64,8.78,5.1,5.1,0,0,0,3.64-1.5l13.3-13.3a2,2,0,1,0-2.83-2.83l-13.3,13.3a1.11,1.11,0,0,1-.81.32,1.14,1.14,0,0,1-.81-.32,1.16,1.16,0,0,1,0-1.62l11.11-11A5.15,5.15,0,1,0,58.82,48L47.75,59.06a1.15,1.15,0,0,1-1.63-1.61l11.12-11A5.15,5.15,0,1,0,50,39.13L38.89,50.2a1.15,1.15,0,0,1-.81.33,1.14,1.14,0,0,1-1.15-1.14,1.16,1.16,0,0,1,.33-.81l11.11-11a5.14,5.14,0,0,0-3.63-8.78Z",
                    transform: "translate(-27.14 -28.76)"
                });

                return jqSvg.toSVG();
            }
        }
    }
}