module BMA {
    export module Model {
        export class MotifLibrary {
            private commands: BMA.ICommandRegistry;

            private motifs: MotifCard[];
            private svg: any;

            private preloadedPaths: string[];

            constructor(commands: BMA.ICommandRegistry) {
                this.commands = commands;
                this.motifs = [];

                this.preloadedPaths = [
                    "motifs/Activator-Inhibitor_Oscillation.json",
                    "motifs/Homeostasis.json",
                    "motifs/Hyperbolic A.json",
                    "motifs/Hyperbolic B.json",
                    "motifs/Hyperbolic C.json",
                    "motifs/Hyperbolic D.json",
                    "motifs/Linear.json",
                    "motifs/Mutual_Activation.json",
                    "motifs/Mutual_Inhibition.json",
                    "motifs/Negative_Feedback_Oscillations 1.json",
                    "motifs/Negative_Feedback_Oscillations 2.json",
                    "motifs/Negative_Feedback_Oscillations 3.json",
                    "motifs/Perfect Adaptation A.json",
                    "motifs/Perfect Adaptation B.json",
                    "motifs/Perfect Adaptation.json",
                    "motifs/Sigmoidal A.json",
                    "motifs/Sigmoidal B.json",
                    "motifs/Sigmoidal C.json",
                    "motifs/Substrate_depletion_oscillations.json.json",
                    "preloaded/SkinModel.json"
                ];

                var svgCnt = $("<div></div>");
                svgCnt.svg({
                    onLoad: (svg) => {
                        this.svg = svg;
                        this.StartLoadMotifs();
                    }
                });
            }

            public get IsInitialized() {
                return this.preloadedPaths.length == 0;
            }

            public get Motifs(): MotifCard[] {
                return this.motifs;
            }

            private AddFromJSON(source) {
                var that = this;

                var parsed = JSON.parse(source);

                var imported = BMA.Model.ImportModelAndLayout(parsed);
                var description = parsed.Model.Description == undefined ? "no description for this motif" : parsed.Model.Description;

                var newMotif = new MotifCard(parsed.Model.Name, description, imported.Model, imported.Layout);

                if (that.svg != undefined) {
                    newMotif.RefreshPreview(that.svg);
                }

                that.motifs.push(newMotif);
            }

            private StartLoadMotifs() {
                this.LoadMotif();
            }

            private LoadMotif() {
                var that = this;
                if (this.preloadedPaths.length > 0) {
                    var path = this.preloadedPaths.pop();

                    $.ajax(path, {
                        dataType: "text",
                        success: function (fileContent) {
                            that.AddFromJSON(fileContent);
                            that.LoadMotif();
                        },
                        error: function (err) {
                            console.log("failed to load motif " + path + " :" + err);
                            that.LoadMotif();
                        }
                    });
                } else {
                    that.commands.Execute("PreloadedMotifsReady", undefined);
                }
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

            public get ModelSource(): { model: BMA.Model.BioModel, layout: BMA.Model.Layout } {
                return { model: this.model, layout: this.layout };
            }

            public RefreshPreview(svg: any) {
                var that = this;
                var grid = { x0: 0, y0: 0, xStep: 250, yStep: 280 };

                var bbox = ModelHelper.GetModelSVGBoundingBox(that.model, that.layout, { xOrigin: 0, yOrigin: 0, xStep: grid.xStep, yStep: grid.yStep });

                //Adding some padding
                bbox.x -= bbox.width * 0.05;
                bbox.y -= bbox.height * 0.05;
                bbox.width *= 1.1;
                bbox.height *= 1.1;

                svg.configure({
                    viewBox: bbox.x + " " + bbox.y + " " + bbox.width + " " + bbox.height,
                    preserveAspectRatio: "xMidYMid meet"
                }, false);
                this.preview = ModelHelper.RenderSVG(svg, that.model, that.layout, grid, undefined);
            }
        }
    }
}