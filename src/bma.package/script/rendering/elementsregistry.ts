// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
interface Window {
    ElementRegistry: BMA.Elements.ElementsRegistry;
}

module BMA {
    export module Elements {
        export class ElementsRegistry {
            private elements: BMA.SVGRendering.Element[];
            private svg;

            private lineWidth = 1;
            private labelSize = 10;
            private labelVisibility = true;

            public get LineWidth(): number {
                return this.lineWidth;
            }

            public set LineWidth(value: number) {
                var lw = Math.max(1, value);

                this.lineWidth = lw
                var activator = <BMA.SVGRendering.StrokeElement>this.GetElementByType("Activator");
                activator.LineWidth = lw;
                var inhibitor = <BMA.SVGRendering.StrokeElement>this.GetElementByType("Inhibitor");
                inhibitor.LineWidth = lw;
            }

            public get LabelSize(): number {
                return this.labelSize;
            }

            public set LabelSize(value: number) {
                this.labelSize = value;
                this.elements.forEach(e => e.LabelSize = value);
            }

            public get LabelVisibility(): boolean {
                return this.labelVisibility;
            }

            public set LabelVisibility(value: boolean) {
                this.labelVisibility = value;
                this.elements.forEach(e => e.LabelVisibility = value);
            }

            public get Elements(): BMA.SVGRendering.Element[] {
                return this.elements;
            }

            public GetElementByType(type: string): BMA.SVGRendering.Element {
                for (var i = 0; i < this.elements.length; i++) {
                    if (this.elements[i].Type === type)
                        return this.elements[i];
                }
                throw "the is no element for specified type";
            }

            constructor() {
                var that = this;
                this.elements = [];

                var svgCnt = $("<div></div>");
                svgCnt.svg({
                    onLoad: (svg) => {
                        this.svg = svg;
                    }
                });

                this.elements.push(new BMA.SVGRendering.ContainerRenderInfo(that.svg));
                this.elements.push(new BMA.SVGRendering.ConstantRenderInfo(that.svg));
                this.elements.push(new BMA.SVGRendering.DefaultRenderInfo(that.svg));
                this.elements.push(new BMA.SVGRendering.MembranaRenderInfo(that.svg));
                this.elements.push(new BMA.SVGRendering.ActivatorRenderInfo(that.svg));
                this.elements.push(new BMA.SVGRendering.InhibitorRenderInfo(that.svg));

                this.elements.forEach(e => e.LabelSize = this.labelSize);
                this.elements.forEach(e => e.LabelVisibility = this.labelVisibility);

                var activator = <BMA.SVGRendering.StrokeElement>this.GetElementByType("Activator");
                activator.LineWidth = this.lineWidth;
                var inhibitor = <BMA.SVGRendering.StrokeElement>this.GetElementByType("Inhibitor");
                inhibitor.LineWidth = this.lineWidth;
            }
        }
    }
} 
