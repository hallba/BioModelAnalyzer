module BMA {
    export module Model {
        export class MotifLibrary {
            private motifs: MotifCard[];
            private svg: any;

            constructor() {
                this.motifs = [];

                var svgCnt = $("<div></div>");
                svgCnt.svg({
                    onLoad: (svg) => {
                        this.svg = svg;
                    }
                });
            }

            public get Motifs(): MotifCard[] {
                return this.motifs;
            }

            public AddFromJSON(source) {
                var that = this;

                var parsed = JSON.parse(source);

                var imported = BMA.Model.ImportModelAndLayout(parsed);
                var description = parsed.Description == undefined ? "" : parsed.Description;

                var newMotif = new MotifCard(parsed.Name, description, imported.Model, imported.Layout);

                if (that.svg != undefined) {
                    newMotif.RefreshPreview(that.svg);
                }

                that.motifs.push(newMotif);
            }
        }

        export class MotifCard {
            private name: string;
            private description: string;

            private model: BMA.Model.BioModel;
            private layout: BMA.Model.Layout;

            private preview: string;

            constructor(name: string, description: string, model: BMA.Model.BioModel, layout: BMA.Model.Layout) {
                this.name = name;
                this.description = description;

                this.model = model;
                this.layout = layout;
            }

            public get Name(): string {
                return this.name;
            }

            public get Preview(): string {
                return this.preview;
            }

            public get Description(): string {
                return this.description;
            }

            public RefreshPreview(svg: any) {
                var that = this;
                var grid = { x0: 0, y0: 0, xStep: 2.5, yStep: 2.8 };
                this.preview = ModelHelper.RenderSVG(svg, that.model, that.layout, grid, undefined);
            }
        }
    }
}