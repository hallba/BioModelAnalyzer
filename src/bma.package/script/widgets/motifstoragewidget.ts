// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/// <reference path="..\..\Scripts\typings\jquery\jquery.d.ts"/>
/// <reference path="..\..\Scripts\typings\jqueryui\jqueryui.d.ts"/>

(function ($) {
    $.widget("BMA.motifstoragewidget", {


        options: {
            enableContextMenu: false,
            onelementselected: undefined,
            filterText: undefined,
            externalOL: undefined
        },

        _create: function () {
            var that = this;
            this.repo = this.element;

            this.preloadedPaths = [
                "motifs/Substrate_depletion_oscillations.json",
                "motifs/Activator-Inhibitor_Oscillation.json",
                "motifs/Negative_Feedback_Oscillations 1.json",
                "motifs/Homeostasis.json",
                "motifs/Mutual_Inhibition.json",
                "motifs/Perfect Adaptation.json",
                "motifs/Sigmoidal A.json",
                "motifs/Hyperbolic A.json",
                "motifs/Linear.json",
            ];

            this.motifs = [];
            this.LoadMotif();
        },

        LoadMotif() {
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
                that.refresh();
            }
        },

        AddFromJSON(source) {
            var that = this;
            var parsed = JSON.parse(source);
            var imported = BMA.Model.ImportModelAndLayout(parsed);
            var adjusted = BMA.ModelHelper.AdjustReceptorsPosition(imported.Model, imported.Layout, window.GridSettings);
            var newMotif = { name: parsed.Model.Name, model: adjusted.model, layout: adjusted.layout };
            that.motifs.push(newMotif);
        },

        refresh: function () {
            this._createHTML();
        },

        AddItem: function (item) {
            this.options.items.push(item);
            this.refresh();
        },

        _notifyOnClick: function (item) {
            if (this.options.onelementselected != undefined) {
                this.options.onelementselected(item.attr("data-name"));
            }
        },

        _createHTML: function (items) {
            this.repo.empty();
            var that = this;


            this.ol = that.options.externalOL === undefined ? $('<ol></ol>').appendTo(this.repo) : that.options.externaalOL;

            for (var i = 0; i < that.motifs.length; i++) {
                var fs = that.options.filterString;
                if (fs === undefined || fs === "" || that.motifs[i].name.toLowerCase().includes(fs.toLowerCase())) {

                    var li = $('<li></li>').appendTo(this.ol).click(function () {
                        var ind = $(this).index();

                        if (that.options.onelementselected != undefined) {
                            that.options.onelementselected(that.motifs[ind]);
                        }

                        that.repo.find(".ui-selected").removeClass("ui-selected");
                        that.ol.children().eq(ind).addClass("ui-selected");
                    });

                    var cnt = $("<div></div>").css("display", "flex").css("flex-direction", "row").css("align-items", "center").appendTo(li);
                    var icon = $("<div></div>").addClass("repo-motif-icon").prependTo(cnt);
                    var modelName = $("<div>" + that.motifs[i].name + "</div>").addClass("repo-model-name").appendTo(cnt);

                    //TODO: change to hide
                    var removeBtn = $('<button></button>').addClass("remove icon-hide").appendTo(li);
                    removeBtn.bind("click", function (event) {
                        event.stopPropagation();

                        //if (that.options.onremovemodel !== undefined)
                        //    that.options.onremovemodel("user." + items[$(this).parent().index()]);
                    });
                }
            }

            //this.createContextMenu();
        },

        CancelSelection: function () {
            this.repo.find(".ui-selected").removeClass("ui-selected");
        },

        _setOption: function (key, value) {
            switch (key) {
                case "onelementselected":
                    this.options.onloadmodel = value;
                    break;
                case "enableContextMenu":
                    this.options.enableContextMenu = value;
                    break;
                case "filterString":
                    this.options.filterString = value;
                    this._createHTML();
                    break;
            }
            this._super(key, value);
        },

        destroy: function () {
            this.element.empty();
        }

    });
}(jQuery));

interface JQuery {
    motifstoragewidget(): JQuery;
    motifstoragewidget(settings: Object): JQuery;
    motifstoragewidget(optionLiteral: string, optionName: string): any;
    motifstoragewidget(optionLiteral: string, optionName: string, optionValue: any): JQuery;
}

