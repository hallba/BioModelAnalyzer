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

            GetBoundingBox(x: number, y: number): { x: number; y: number; width: number; height: number }
            IntersectsBorder(pointerX: number, pointerY: number, elementX, elementY, elementParams): boolean
            ContainsBBox(bbox: { x: number, y: number, width: number, height: number }, elementX: number, elementY: number, elementParams): boolean

            RenderToSvg(renderParams: any): SVGElement;
            Contains(pointerX: number, pointerY: number, elementX, elementY): boolean;
        }
    }
}