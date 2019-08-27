module BMA {
    export module Model {
        export class MotifLibrary {
            private commands: BMA.ICommandRegistry;

            private motifs: MotifCard[];
            private preloadedMotifs: MotifCard[];
            private customMotifs: MotifCard[];


            private isPreloadedHided: boolean;

            private svg: any;

            private preloadedPaths: string[];


            private isSvgReady: boolean = false;
            private isStartLoadRequested: boolean = false;

            constructor(commands: BMA.ICommandRegistry) {
                this.commands = commands;
                this.motifs = [];
                this.preloadedMotifs = [];
                this.customMotifs = [];
                this.isPreloadedHided = false;

                this.preloadedPaths = [
                    "motifs/Substrate_depletion_oscillations.json",
                    "motifs/Activator-Inhibitor_Oscillation.json",
                    "motifs/Negative_Feedback_Oscillations 1.json",
                    "motifs/Homeostasis.json",
                    "motifs/Mutual_Inhibition.json",
                    //"motifs/MutualActivation.json",
                    "motifs/Perfect Adaptation.json",
                    "motifs/Sigmoidal A.json",
                    "motifs/Hyperbolic A.json",
                    "motifs/Linear.json",
                ];

                var svgCnt = $("<div></div>");
                svgCnt.svg({
                    onLoad: (svg) => {
                        this.svg = svg;
                        this.isSvgReady = true;
                        if (this.isStartLoadRequested) {
                            this.isStartLoadRequested = false;
                            this.StartLoadMotifs();
                        }
                    }
                });
            }

            public get IsPreloadedVisible() {
                return !this.isPreloadedHided;
            }

            public get IsInitialized() {
                return this.preloadedPaths.length == 0;
            }

            public get Motifs(): MotifCard[] {
                return this.motifs;
            }

            public AddMotif(source) {
                this.AddFromJSON(source, false);
                this.commands.Execute("RefreshMotifs", undefined);
            }

            private AddFromJSON(source, isPreloaded) {
                var that = this;

                var parsed = JSON.parse(source);

                var imported = BMA.Model.ImportModelAndLayout(parsed);
                var adjusted = ModelHelper.AdjustReceptorsPosition(imported.Model, imported.Layout, window.GridSettings);
                var description = parsed.Model.Description == undefined ? "no description for this motif" : parsed.Model.Description;

                var newMotif = new MotifCard(parsed.Model.Name, description, adjusted.model, adjusted.layout, isPreloaded);

                if (that.svg != undefined) {
                    newMotif.RefreshPreview(that.svg);
                }

                if (isPreloaded) {
                    that.motifs.push(newMotif);
                    that.preloadedMotifs.push(newMotif);
                }
                else {
                    that.motifs.unshift(newMotif);
                    that.customMotifs.unshift(newMotif);
                }
            }

            public StartLoadMotifs() {
                if (this.isSvgReady) {
                    this.LoadMotif();
                } else {
                    this.isStartLoadRequested = true;
                }
            }

            private LoadMotif() {
                var that = this;
                if (this.preloadedPaths.length > 0) {
                    var path = this.preloadedPaths.pop();

                    $.ajax(path, {
                        dataType: "text",
                        success: function (fileContent) {
                            that.AddFromJSON(fileContent, true);
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

            public HidePreloadedMotifs() {
                this.motifs = [];
                for (var i = 0; i < this.customMotifs.length; i++)
                    this.motifs.push(this.customMotifs[i]);
                this.isPreloadedHided = true;
                this.commands.Execute("ProcessPreloadedMotifsHide", undefined);
                this.commands.Execute("RefreshMotifs", undefined);
            }

            public ShowPreloadedMotifs() {
                this.motifs = [];
                for (var i = 0; i < this.customMotifs.length; i++)
                    this.motifs.push(this.customMotifs[i]);
                for (var i = 0; i < this.preloadedMotifs.length; i++)
                    this.motifs.push(this.preloadedMotifs[i]);
                this.isPreloadedHided = false;
                this.commands.Execute("RefreshMotifs", undefined);

            }

            public DeleteMotifByIndex(i) {
                this.motifs.splice(i, 1);
                this.customMotifs.splice(i, 1);
                this.commands.Execute("RefreshMotifs", undefined);
            }
        }

        export class MotifCard {
            private name: string;
            private description: string;

            private model: BMA.Model.BioModel;
            private layout: BMA.Model.Layout;

            private preview: string;

            private isPreloaded: boolean;

            constructor(name: string, description: string, model: BMA.Model.BioModel, layout: BMA.Model.Layout, isPreloaded: boolean) {
                this.name = name;
                this.description = description;

                this.model = model;
                this.layout = layout;

                this.isPreloaded = isPreloaded;
            }

            public get Name(): string {
                return this.name;
            }

            public set Name(value: string) {
                if (this.isPreloaded)
                    throw "Can't change name of preloaded motfis!";
                this.name = value;
            }

            public get Preview(): string {
                return this.preview;
            }

            public get Description(): string {
                return this.description;
            }

            public set Description(value: string) {
                if (this.isPreloaded)
                    throw "Can't change description of preloaded motfis!";
                this.description = value;
            }


            public get IsPreloaded(): boolean {
                return this.isPreloaded;
            }

            public get ModelSource(): { model: BMA.Model.BioModel, layout: BMA.Model.Layout } {
                return { model: this.model, layout: this.layout };
            }

            public RefreshPreview(svg: any) {
                var that = this;
                var grid = { x0: 0, y0: 0, xStep: window.GridSettings.xStep, yStep: window.GridSettings.yStep };

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