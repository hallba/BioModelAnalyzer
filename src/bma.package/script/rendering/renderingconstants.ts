module BMA {
    export module SVGRendering {
        export class BMAColorConstants {
            static readonly bmaOrangeInnerFillColor = "#ff9900";
            static readonly bmaOrangeOuterFillColor = "#ffcc99";
            static readonly bmaOrangeInnerStrokeColor = "#ff6600";
            static readonly bmaOrangeOuterStrokeColor = "#f99746";
            static readonly bmaOrangeCode = "BMA_Orange";

            static readonly bmaPurpleInnerFillColor = "#9966ff";
            static readonly bmaPurpleOuterFillColor = "#ccccff";
            static readonly bmaPurpleInnerStrokeColor = "#330099";
            static readonly bmaPurpleOuterStrokeColor = "#8b8bfc";
            static readonly bmaPurpleCode = "BMA_Purple";

            static readonly bmaMintInnerFillColor = "#00cccc";
            static readonly bmaMintOuterFillColor = "#7df4eb";
            static readonly bmaMintInnerStrokeColor = "#006666";
            static readonly bmaMintOuterStrokeColor = "#52c6b8";
            static readonly bmaMintCode = "BMA_Mint";

            static readonly bmaGreenInnerFillColor = "#33cc00";
            static readonly bmaGreenOuterFillColor = "#abffab";
            static readonly bmaGreenInnerStrokeColor = "#006600";
            static readonly bmaGreenOuterStrokeColor = "#5ce05c";
            static readonly bmaGreenCode = "BMA_Green";

            static readonly bmaConstantFillColor = "#CCC";
            static readonly bmaConstantStrokeColor = '#7c7c7c';
            static readonly bmaDefaultFillColor = "#f6c"; //"#EF4137";
            static readonly bmaDefaultStrokeColor = '#906';
            static readonly bmaMembranaFillColor = "#09c";
            static readonly bmaMembranaFillSelectedColor = "#39c";
            static readonly bmaMembranaStrokeColor = "#036";
        }

        export function GetColorsForRendering(colorCode: string, type: "Default" | "Constant" | "Membrana"): { fill: string, stroke: string } {
            switch (colorCode) {
                case BMAColorConstants.bmaGreenCode:
                    if (type != "Constant") {
                        return {
                            fill: BMAColorConstants.bmaGreenInnerFillColor,
                            stroke: BMAColorConstants.bmaGreenInnerStrokeColor
                        };
                    } else {
                        return {
                            fill: BMAColorConstants.bmaGreenOuterFillColor,
                            stroke: BMAColorConstants.bmaGreenOuterStrokeColor
                        };
                    }
                case BMAColorConstants.bmaMintCode:
                    if (type != "Constant") {
                        return {
                            fill: BMAColorConstants.bmaMintInnerFillColor,
                            stroke: BMAColorConstants.bmaMintInnerStrokeColor
                        };
                    } else {
                        return {
                            fill: BMAColorConstants.bmaMintOuterFillColor,
                            stroke: BMAColorConstants.bmaMintOuterStrokeColor
                        };
                    }
                case BMAColorConstants.bmaOrangeCode:
                    if (type != "Constant") {
                        return {
                            fill: BMAColorConstants.bmaOrangeInnerFillColor,
                            stroke: BMAColorConstants.bmaOrangeInnerStrokeColor
                        };
                    } else {
                        return {
                            fill: BMAColorConstants.bmaOrangeOuterFillColor,
                            stroke: BMAColorConstants.bmaOrangeOuterStrokeColor
                        };
                    }
                case BMAColorConstants.bmaPurpleCode:
                    if (type != "Constant") {
                        return {
                            fill: BMAColorConstants.bmaPurpleInnerFillColor,
                            stroke: BMAColorConstants.bmaPurpleInnerStrokeColor
                        };
                    } else {
                        return {
                            fill: BMAColorConstants.bmaPurpleOuterFillColor,
                            stroke: BMAColorConstants.bmaPurpleOuterStrokeColor
                        };
                    }
                default:
                    var color = ParseColorString(colorCode);
                    var stroke = "rgb(" + 0.3 * color.r + ", " + 0.3 * color.g + ", " + color.b + ")";

                    return {
                        fill: colorCode,
                        stroke: stroke
                    };
            }
        }

        export class SVGRenderingConstants {
            static readonly variableWidthConstant = 35;
            static readonly variableHeightConstant = 30;
            static readonly variableSizeConstant = 30;
            static readonly relationshipBboxOffset = 20;
            static readonly containerRadius = 100;
            static readonly containerInnerEllipseWidth = 106;
            static readonly containerInnerEllipseHeight = 123.5;
            static readonly containerOuterEllipseWidth = 119;
            static readonly containerOuterEllipseHeight = 136.5;
            static readonly containerInnerCenterOffset = 0;
            static readonly containerOuterCenterOffset = 0;
            static readonly containerPaddingCoef = 0.001;

            static readonly textFontFamily = "OpenSans";
            static readonly textFontSrc = "local('Segoe UI'), local('Frutiger'), local('Frutiger Linotype'), local('Dejavu Sans'), local('Helvetica Neue'), local('HelveticaNeue'), local('Arial'), local('sans serif'), local('sans-serif')";
        }

        export interface Element {
            readonly Type: string;
            readonly Description: string;
            readonly IconClass: string;

            LabelVisibility: boolean;
            LabelSize: number;

            RenderToSvg(renderParams: any): SVGElement;
            RenderToCanvas(context: any, renderParams: any);
            Contains(pointerX: number, pointerY: number, elementX, elementY): boolean;
            GetIconSVG(iconFill: string): string;
        }

        export interface StrokeElement extends Element {
            LineWidth: number;
        }

        export interface BboxElement extends Element {
            GetBoundingBox(x: number, y: number): { x: number; y: number; width: number; height: number }
        }

        export interface BorderContainerElement extends Element {
            IntersectsBorder(pointerX: number, pointerY: number, elementX, elementY, elementParams): boolean
            ContainsBBox(bbox: { x: number, y: number, width: number, height: number }, elementX: number, elementY: number, elementParams): boolean
        }

        export class ElementRenderInfo {
            private type: string;
            private description: string;
            private iconClass: string;

            private labelVisibility: boolean;
            private labelSize: number;

            private attentionImage: any;

            public get LabelVisibility(): boolean {
                return this.labelVisibility;
            }

            public set LabelVisibility(value: boolean) {
                this.labelVisibility = value;
            }

            public get LabelSize(): number {
                return this.labelSize;
            }

            public set LabelSize(value: number) {
                this.labelSize = value;
            }

            public get Type(): string {
                return this.type;
            }

            public get Description(): string {
                return this.description;
            }

            public get IconClass(): string {
                return this.iconClass;
            }

            constructor(type: string, description: string, iconClass: string) {
                this.type = type;
                this.description = description;
                this.iconClass = iconClass;

                this.attentionImage = new Image();
                this.attentionImage.src = 'images/varerror.png';
            }

            protected RenderAttentionIcon(context, cs, x, y, inDataCoordinates) {
                var size = 75;
                if (inDataCoordinates) {
                    size = cs.plotToScreenWidth(0.3 * BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant);
                }

                var offsetX = cs.plotToScreenWidth(0.2 * BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant);
                var offsetY = -cs.plotToScreenHeight(0.3 * BMA.SVGRendering.SVGRenderingConstants.variableWidthConstant) - size;
                context.translate(offsetX, offsetY);
                context.drawImage(this.attentionImage, x, y, size, size);
                context.setTransform(1, 0, 0, 1, 0, 0);
            }
        }
    }
}