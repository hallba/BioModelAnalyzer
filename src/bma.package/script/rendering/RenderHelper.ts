module BMA {
    export module SVGRendering {
        export module RenderHelper {
            //Creates svg with bezier curve corresponding to input parameters
            export function CreateBezier(svg: any, start: { x: number, y: number }, end: { x: number, y: number }, lineWidth: number, endingType: string, isSelected: boolean) {
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

                var stroke = isSelected ? "#999999" : "#aaa";
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

            //Creates svg with line corresponding to input parameters
            export function CreateLine(svg: any, start: { x: number, y: number }, end: { x: number, y: number }, lineWidth: number, endingType: string, isSelected: boolean) {
                var jqSvg = svg;

                var stroke = isSelected ? "#999999" : "#aaa";
                var endMarker = isSelected ? "url(#" + endingType + "Selected)" : "url(#" + endingType + ")";
                var path = jqSvg.createPath();
                return jqSvg.path(path.move(start.x, start.y).lineTo(end.x, end.y),
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
        }
    }
}