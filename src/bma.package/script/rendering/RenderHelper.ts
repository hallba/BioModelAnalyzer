module BMA {
    export module SVGRendering {
        export module RenderHelper {
            export function CreateBezierPoints(start: { x: number, y: number }, end: { x: number, y: number }, scale: number) {
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
                var length05 = scale * 0.5 * BMA.SVGRendering.SVGRenderingConstants.variableSizeConstant;
                var length01 = 0.1 * lvlength;

                var pointOffset = scale * 0.15 * BMA.SVGRendering.SVGRenderingConstants.variableSizeConstant;

                return {
                    p0: {
                        x: start.x + normal.x * pointOffset, y: start.y + normal.y * pointOffset
                    },
                    p1: {
                        x: start.x + normal.x * length05 + lineVector.x * 3 * length01, y: start.y + normal.y * length05 + lineVector.y * 3 * length01
                    },
                    p2: {
                        x: end.x + normal.x * length05 - lineVector.x * 3 * length01, y: end.y + normal.y * length05 - lineVector.y * 3 * length01
                    },
                    p3: {
                        x: end.x + normal.x * pointOffset, y: end.y + normal.y * pointOffset
                    }
                };
            }

            export function CreateBezier(start: { x: number, y: number }, end: { x: number, y: number }, scale: number) {
                var bpoints = CreateBezierPoints(start, end, scale);

                var result = "M " + bpoints.p0.x + " " + bpoints.p0.y;
                result += " C " + bpoints.p1.x + " " + bpoints.p1.y;
                result += " " + bpoints.p2.x + " " + bpoints.p2.y;
                result += " " + bpoints.p3.x + " " + bpoints.p3.y;

                return result;
            }
            //Creates svg with bezier curve corresponding to input parameters
            export function CreateBezierSVG(svg: any, start: { x: number, y: number }, end: { x: number, y: number }, lineWidth: number, endingType: string, isSelected: boolean) {
                var jqSvg = svg;

                var stroke = isSelected ? "#999999" : "#aaa";
                var endMarker = isSelected ? "url(#" + endingType + "Selected)" : "url(#" + endingType + ")";

                var pathData = CreateBezier(start, end, 1);
                var path = jqSvg.createPath();
                return jqSvg.path(path, { fill: 'none', stroke: stroke, strokeWidth: lineWidth + 1, "marker-end": endMarker, "stroke-linecap": "round", d: pathData });
            }

            //Creates svg with line corresponding to input parameters
            export function CreateLine(svg: any, start: { x: number, y: number }, end: { x: number, y: number }, lineWidth: number, endingType: string, isSelected: boolean) {
                var jqSvg = svg;

                var stroke = isSelected ? "#999999" : "#aaa";
                var endMarker = isSelected ? "url(#" + endingType + "Selected)" : "url(#" + endingType + ")";
                var path = jqSvg.createPath();
                var pathData = path.move(start.x, start.y).lineTo(end.x, end.y);
                //console.log("path data: " + pathData._path);
                return jqSvg.path(pathData,
                    { fill: 'none', stroke: stroke, strokeWidth: lineWidth + 1, "marker-end": endMarker, "stroke-linecap": "round" });
            }

            //Calculates rotation angle for membrana receptor according to its position inside grid cell
            export function CalculateRotationAngle(gridCell: { x: number, y: number }, grid: { x0: number, y0: number, xStep: number, yStep: number }, sizeCoef: number, positionX: number, positionY: number): number {
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

            export function CreateSvgElement(type: string, renderParams: any) {
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

            export function CreateSvgPath(data: string, color: string, x: number = 0, y: number = 0, scale: number = 1.0) {
                var elem = <SVGPathElement>this.CreateSvgElement("path", { x: x, y: y, scale: scale });
                elem.setAttribute("d", data);
                elem.setAttribute("fill", color);
                return elem;
            }

            //Renders model to html canvas
            export function RenderModelToCanvas(model: BMA.Model.BioModel, layout: BMA.Model.Layout, grid: { x0: number, y0: number, xStep: number, yStep: number }, args: any): { canvas: HTMLCanvasElement, bbox: { x: number, y: number, width: number, height: number }, grid: { x0: number, y0: number, xStep: number, yStep: number } } {
                var translate = args === undefined ? undefined : args.translate;
                var canvas = <HTMLCanvasElement>$("<canvas></canvas>")[0];
                var globalScale = 2;

                //finding bbox
                var xMin = Infinity;
                var yMin = Infinity;
                var xMax = -Infinity;
                var yMax = -Infinity;

                if (layout.Variables.length > 0 || layout.Containers.length > 0) {
                    for (var i = 0; i < layout.Variables.length; i++) {
                        var vrbl = layout.Variables[i];
                        var cell = ModelHelper.GetGridCell2(vrbl.PositionX, vrbl.PositionY, grid);

                        if (cell.x >= xMax)
                            xMax = cell.x + 1;
                        if (cell.x < xMin)
                            xMin = cell.x;
                        if (cell.y >= yMax)
                            yMax = cell.y + 1;
                        if (cell.y < yMin)
                            yMin = cell.y;
                    }

                    for (var i = 0; i < layout.Containers.length; i++) {
                        var cnt = layout.Containers[i];
                        var cell = {
                            x: cnt.PositionX, y: cnt.PositionY
                        };

                        if (cell.x + cnt.Size > xMax)
                            xMax = cell.x + cnt.Size;
                        if (cell.x < xMin)
                            xMin = cell.x;
                        if (cell.y + cnt.Size > yMax)
                            yMax = cell.y + cnt.Size;
                        if (cell.y < yMin)
                            yMin = cell.y;
                    }

                } else {
                    xMin = 0;
                    yMin = 0;
                    xMax = 1;
                    yMax = 1;
                }
                xMin -= 1;
                xMax += 1;
                yMin -= 1;
                yMax += 1;

                var width = (xMax - xMin) * grid.xStep * globalScale;
                var height = (yMax - yMin) * grid.yStep * globalScale;
                var bbox = { x: xMin, y: yMin, width: width, height: height };
                canvas.width = width;
                canvas.height = height;
                var context = canvas.getContext("2d");
                context.clearRect(0, 0, width, height);

                //Render containers
                var containerLayouts = layout.Containers;
                for (var i = 0; i < containerLayouts.length; i++) {
                    var containerLayout = containerLayouts[i];
                    var element = window.ElementRegistry.GetElementByType("Container");

                    var isHighlighted = undefined;
                    if (args !== undefined && args.containerHighlightIds !== undefined) {
                        isHighlighted = false;
                        for (var j = 0; j < args.containerHighlightIds.length; j++) {
                            if (containerLayout.Id === args.containerHighlightIds[j]) {
                                isHighlighted = true;
                                break;
                            }
                        }
                    }

                    var isSelected = false;
                    if (args !== undefined && args.selection !== undefined) {
                        isSelected = args.selection.cells[containerLayout.Id];
                    }

                    element.RenderToCanvas(context, {
                        globalScale: globalScale,
                        layout: containerLayout,
                        grid: grid,
                        bbox: bbox,
                        background: args === undefined || args.containersStability === undefined ? undefined : ModelHelper.GetContainerColorByStatus(args.containersStability[containerLayout.Id]),
                        isHighlighted: isHighlighted,
                        isSelected: isSelected,
                        translate: translate
                    });
                }

                //Render Variables
                var variables = model.Variables;
                var variableLayouts = layout.Variables;
                for (var i = 0; i < variables.length; i++) {
                    var variable = variables[i];
                    var variableLayout = variableLayouts[i];
                    var element = window.ElementRegistry.GetElementByType(variable.Type);
                    var additionalInfo = args === undefined || args.variablesStability === undefined ? undefined : ModelHelper.GetItemById(args.variablesStability, variable.Id);

                    var isHighlighted = undefined;
                    if (args !== undefined && args.variableHighlightIds !== undefined) {
                        isHighlighted = false;
                        for (var j = 0; j < args.variableHighlightIds.length; j++) {
                            if (variable.Id === args.variableHighlightIds[j]) {
                                isHighlighted = true;
                                break;
                            }
                        }
                        if (!isHighlighted) {
                            for (var j = 0; j < args.containerHighlightIds.length; j++) {
                                if (variable.ContainerId === args.containerHighlightIds[j]) {
                                    isHighlighted = true;
                                    break;
                                }
                            }
                        }
                    }

                    var isSelected = false;
                    if (args !== undefined && args.selection !== undefined) {
                        isSelected = args.selection.variables[variable.Id];
                    }

                    var container: any = variable.Type === "MembraneReceptor" ? layout.GetContainerById(variable.ContainerId) : undefined;
                    var sizeCoef = undefined;
                    var gridCell = undefined;
                    if (container !== undefined) {
                        sizeCoef = container.Size;
                        gridCell = { x: container.PositionX, y: container.PositionY };
                    }

                    var isValid = true;
                    if (args !== undefined && args.errors !== undefined) {
                        for (var j = 0; j < args.errors.length; j++) {
                            var er = args.errors[j];
                            if (er.variable.Id === variable.Id) {
                                isValid = false;
                                break;
                            }
                        }
                    }

                    element.RenderToCanvas(context, {
                        globalScale: globalScale,
                        model: variable,
                        layout: variableLayout,
                        grid: grid,
                        bbox: bbox,
                        gridCell: gridCell,
                        sizeCoef: sizeCoef,
                        valueText: additionalInfo === undefined ? undefined : additionalInfo.range,
                        labelColor: additionalInfo === undefined ? undefined : ModelHelper.GetVariableColorByStatus(additionalInfo.state),
                        isHighlighted: isHighlighted,
                        isSelected: isSelected,
                        translate: translate,
                        isValid: isValid
                    });
                }

                //Render Relationships
                var relationships = model.Relationships;
                for (var i = 0; i < relationships.length; i++) {
                    var relationship = relationships[i];
                    var element = window.ElementRegistry.GetElementByType(relationship.Type);

                    var hasRotation = false;
                    var gridCell = undefined;

                    var start = ModelHelper.GetVariableById(layout, model, relationship.FromVariableId);
                    var container: any = start.model.Type === "MembraneReceptor" ? layout.GetContainerById(start.model.ContainerId) : undefined;
                    var startVarSizeCoef = 1;
                    if (container !== undefined) {
                        startVarSizeCoef = container.Size;
                        gridCell = { x: container.PositionX, y: container.PositionY };
                    }

                    hasRotation = start.model.Type === "MembraneReceptor";

                    var end = ModelHelper.GetVariableById(layout, model, relationship.ToVariableId);
                    var container2: any = end.model.Type === "MembraneReceptor" ? layout.GetContainerById(end.model.ContainerId) : undefined;
                    var endVarSizeCoef = 1;
                    if (container2 !== undefined) {
                        endVarSizeCoef = container2.Size;
                    }

                    var hasReverse = false;
                    for (var j = 0; j < relationships.length; j++) {
                        var revRel = relationships[j];
                        if (revRel.Id !== relationship.Id && revRel.FromVariableId === relationship.ToVariableId && revRel.ToVariableId === relationship.FromVariableId) {
                            hasReverse = true;
                            break;
                        }
                    }

                    var isSelected = false;
                    if (args !== undefined && args.selection !== undefined) {
                        isSelected = args.selection.relationships[relationship.Id];
                    }

                    element.RenderToCanvas(context, {
                        globalScale: globalScale,
                        layout: { start: start.layout, startSizeCoef: startVarSizeCoef, end: end.layout, endSizeCoef: endVarSizeCoef, hasRotation: hasRotation, gridCell: gridCell },
                        bbox: bbox,
                        grid: grid,
                        id: relationship.Id,
                        hasReverse: hasReverse,
                        isSelected: isSelected,
                        translate: translate,
                    });
                }

                //Render relationships
                //for (var i = 0; i < model.Relationships.length; i++) {
                //    var rel = model.Relationships[i];
                //    if (rel.FromVariableId === rel.ToVariableId) {
                //        //draw self-relationship
                //    } else {
                //        var c0 = coords[rel.FromVariableId];
                //        var c1 = coords[rel.ToVariableId];

                //        context.strokeStyle = "#aaa";
                //        drawLineWithArrows(context, c0.x, c0.y, c1.x, c1.y, 3, 8, false, true);
                //    }
                //}

                return {
                    canvas: canvas,
                    bbox: { x: xMin * grid.xStep, y: yMin * grid.yStep, width: width / globalScale, height: height / globalScale },
                    grid: grid
                };
            }

            // x0,y0: the line's starting point
            // x1,y1: the line's ending point
            // width: the distance the arrowhead perpendicularly extends away from the line
            // height: the distance the arrowhead extends backward from the endpoint
            // arrowStart: true/false directing to draw arrowhead at the line's starting point
            // arrowEnd: true/false directing to draw arrowhead at the line's ending point
            export function drawLineWithArrows(ctx, x0, y0, x1, y1, aWidth, aLength, arrowStart, arrowEnd) {
                var dx = x1 - x0;
                var dy = y1 - y0;
                var angle = Math.atan2(dy, dx);
                var length = Math.sqrt(dx * dx + dy * dy);

                ctx.translate(x0, y0);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(length, 0);
                if (arrowStart) {
                    ctx.moveTo(aLength, -aWidth);
                    ctx.lineTo(0, 0);
                    ctx.lineTo(aLength, aWidth);
                }
                if (arrowEnd) {
                    ctx.moveTo(length - aLength, -aWidth);
                    ctx.lineTo(length, 0);
                    ctx.lineTo(length - aLength, aWidth);
                }

                ctx.stroke();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }

            export function getBezierXY(t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
                return {
                    x: Math.pow(1 - t, 3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x + 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
                    y: Math.pow(1 - t, 3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y + 3 * t * t * (1 - t) * cp2y + t * t * t * ey
                };
            }

            export function getBezierAngle(t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
                var dx = Math.pow(1 - t, 2) * (cp1x - sx) + 2 * t * (1 - t) * (cp2x - cp1x) + t * t * (ex - cp2x);
                var dy = Math.pow(1 - t, 2) * (cp1y - sy) + 2 * t * (1 - t) * (cp2y - cp1y) + t * t * (ey - cp2y);
                return -Math.atan2(dx, dy) + 0.5 * Math.PI;
            }

            // draws both cubic and quadratic bezier
            export function bezierWithArrowheads(ctx, type, p0, p1, p2, p3, arrowLength, hasEndArrow) {
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)

                if (hasEndArrow) {
                    var angle = getBezierAngle(1, p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);

                    ctx.translate(p3.x, p3.y);
                    ctx.rotate(angle);
                    if (type === "Inhibitor") {
                        ctx.moveTo(0, - arrowLength);
                        ctx.lineTo(0, arrowLength);
                    } else if (type === "Activator") {
                        ctx.moveTo(-arrowLength, -arrowLength);
                        ctx.lineTo(0, 0);
                        ctx.lineTo(-arrowLength, arrowLength);
                    } else throw "unknown relationship type";
                }

                ctx.stroke();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
        }
    }
}