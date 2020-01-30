module BMA {
    export module SVGRendering {
        export class Constants {
            public readonly variableWidthConstant = 35;
            public readonly variableHeightConstant = 30;
            public readonly variableSizeConstant = 30;
            public readonly relationshipBboxOffset = 20;
            public readonly containerRadius = 100;
            public readonly containerPaddingCoef = 0.001;
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