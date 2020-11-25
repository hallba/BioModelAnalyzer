module BMA {
    export module SVGRendering {
        export module RenderHelper {
            //Creates svg with bezier curve corresponding to input parameters
            export function CreateBezier(svg: any, start: { x: number, y: number }, end: { x: number, y: number }, lineWidth: number, endingType: string, isSelected: boolean) {
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
                var length05 = 0.5 * BMA.SVGRendering.SVGRenderingConstants.variableSizeConstant;
                var length01 = 0.1 * lvlength;

                var pointOffset = 0.15 * BMA.SVGRendering.SVGRenderingConstants.variableSizeConstant;

                var stroke = isSelected ? "#999999" : "#aaa";
                var endMarker = isSelected ? "url(#" + endingType + "Selected)" : "url(#" + endingType + ")";

                var path = jqSvg.createPath();
                var pathData = path.move(start.x + normal.x * pointOffset, start.y + normal.y * pointOffset)
                    .curveC(
                        start.x + normal.x * length05 + lineVector.x * 3 * length01,
                        start.y + normal.y * length05 + lineVector.y * 3 * length01,
                        end.x + normal.x * length05 - lineVector.x * 3 * length01,
                        end.y + normal.y * length05 - lineVector.y * 3 * length01,
                        end.x + normal.x * pointOffset,
                        end.y + normal.y * pointOffset);
                //console.log("path data: " + pathData._path);
                return jqSvg.path(pathData,
                    { fill: 'none', stroke: stroke, strokeWidth: lineWidth + 1, "marker-end": endMarker, "stroke-linecap": "round" });
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
            export function RenderModelToCanvas(model: BMA.Model.BioModel, layout: BMA.Model.Layout, grid: { x0: number, y0: number, xStep: number, yStep: number }): { canvas: HTMLCanvasElement, bbox: { x: number, y: number, width: number, height: number }, grid: { x0: number, y0: number, xStep: number, yStep: number } } {
                var canvas = <HTMLCanvasElement>$("<canvas></canvas>")[0];

                //finding bbox
                var xMin = Infinity;
                var yMin = Infinity;
                var xMax = -Infinity;
                var yMax = -Infinity;
                for (var i = 0; i < layout.Variables.length; i++) {
                    var vrbl = layout.Variables[i];
                    var cell = ModelHelper.GetGridCell2(vrbl.PositionX, vrbl.PositionY, grid);

                    if (cell.x > xMax)
                        xMax = cell.x;
                    if (cell.x < xMin)
                        xMin = cell.x;
                    if (cell.y > yMax)
                        yMax = cell.y;
                    if (cell.y < yMin)
                        yMin = cell.y;
                }
                xMin -= 1;
                yMin -= 1;
                xMax += 1;
                yMax += 1;

                var width = (xMax - xMin) * grid.xStep;
                var height = (yMax - yMin) * grid.yStep;
                canvas.width = width;
                canvas.height = height;
                var context = canvas.getContext("2d");
                context.clearRect(0, 0, width, height);


                //Render Variables
                var variableGeometry = new Path2D("M54.88 71.29 a 4.58 4.58 0 0 1 -3.28 -1.36 a 4.65 4.65 0 0 1 0 -6.57 l 11.11 -11 A 1.65 1.65 0 0 0 60.38 50 L 49.3 61.06 a 4.65 4.65 0 0 1 -7.93 -3.28 a 4.66 4.66 0 0 1 1.36 -3.29 l 11.12 -11 a 1.65 1.65 0 0 0 -1.17 -2.8 a 1.67 1.67 0 0 0 -1.17 0.48 L 40.44 52.2 a 4.65 4.65 0 0 1 -6.57 -6.57 L 45 34.59 a 1.63 1.63 0 0 0 0.48 -1.16 A 1.67 1.67 0 0 0 45 32.26 a 1.65 1.65 0 0 0 -1.17 -0.48 a 1.63 1.63 0 0 0 -1.16 0.48 L 29.28 45.63 a 1.5 1.5 0 1 1 -2.12 -2.12 L 40.53 30.14 a 4.65 4.65 0 0 1 7.93 3.29 a 4.58 4.58 0 0 1 -1.36 3.28 L 36 47.75 a 1.65 1.65 0 0 0 0 2.33 a 1.65 1.65 0 0 0 2.33 0 L 49.39 39 A 4.65 4.65 0 0 1 56 39 a 4.65 4.65 0 0 1 0 6.57 l -11.11 11 a 1.64 1.64 0 0 0 0 2.32 a 1.66 1.66 0 0 0 1.17 0.47 a 1.64 1.64 0 0 0 1.16 -0.47 L 58.26 47.87 a 4.65 4.65 0 0 1 6.57 0 a 4.65 4.65 0 0 1 0 6.57 l -11.12 11 a 1.65 1.65 0 0 0 2.34 2.33 l 13.29 -13.3 a 1.51 1.51 0 0 1 2.13 0 a 1.5 1.5 0 0 1 0 2.12 l -13.3 13.3 A 4.62 4.62 0 0 1 54.88 71.29 Z");
                var coords = {}
                context.beginPath();
                for (var i = 0; i < layout.Variables.length; i++) {
                    var variable = model.Variables[i];
                    var vrbl = layout.Variables[i];

                    var x = vrbl.PositionX - xMin * grid.xStep;
                    var y = yMax * grid.yStep - vrbl.PositionY;

                    coords[vrbl.Id] = { x: x, y: y };

                    if (variable.Type == "Constant") {
                        context.fillStyle = "#00cccc";
                    } else {
                        context.fillStyle = "#f6c";
                    }

                    context.translate(x, y);
                    context.scale(0.6, 0.6);
                    context.translate(-50, -50);
                    context.fill(variableGeometry);

                    context.setTransform(1, 0, 0, 1, 0, 0);
                }

                //Render relationships
                for (var i = 0; i < model.Relationships.length; i++) {
                    var rel = model.Relationships[i];
                    if (rel.FromVariableId === rel.ToVariableId) {
                        //draw self-relationship
                    } else {
                        var c0 = coords[rel.FromVariableId];
                        var c1 = coords[rel.ToVariableId];

                        context.strokeStyle = "#aaa";
                        drawLineWithArrows(context, c0.x, c0.y, c1.x, c1.y, 3, 8, false, true);
                    }
                }

                return {
                    canvas: canvas,
                    bbox: { x: xMin * grid.xStep, y: yMin * grid.yStep, width: width, height: height },
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
        }
    }
}