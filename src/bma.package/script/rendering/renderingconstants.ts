module BMA {
    export module SVGRendering {
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
            Contains(pointerX: number, pointerY: number, elementX, elementY): boolean;
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
            }
        }
    }
}