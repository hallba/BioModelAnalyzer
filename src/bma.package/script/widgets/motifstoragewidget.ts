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


            this.ol = $('<ol></ol>').appendTo(this.repo);

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
                    var modelName = $("<div>" + that.motifs[i].name + "</div>").appendTo(li);

                    //TODO: change to hide
                    var removeBtn = $('<button></button>').addClass("delete icon-delete").appendTo(li);
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

        createContextMenu: function () {
            var that = this;
            this.repo.contextmenu({
                delegate: "li",
                autoFocus: true,
                preventContextMenuForPopup: true,
                preventSelect: true,
                menu: [
                    { title: "Move to OneDrive", cmd: "MoveToOneDrive" },
                    { title: "Copy to OneDrive", cmd: "CopyToOneDrive" },
                ],
                beforeOpen: function (event, ui) {
                    if (that.options.enableContextMenu) {
                        ui.menu.zIndex(50);
                    } else
                        return false;
                },
                select: function (event, ui) {
                    var args: any = {};
                    var idx = $(ui.target.context).index();

                    if (that.options.setoncopytoonedrive !== undefined) {
                        that.options.setoncopytoonedrive("user." + that.options.items[idx]).done(function () {

                            if (ui.cmd == "MoveToOneDrive") {
                                if (that.options.onremovemodel !== undefined)
                                    that.options.onremovemodel("user." + that.options.items[idx]);
                                //window.Commands.Execute("LocalStorageRemoveModel", "user." + that.options.items[idx]);
                            }
                        });
                    }
                }
            });
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

