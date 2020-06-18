// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/// <reference path="..\..\Scripts\typings\jquery\jquery.d.ts"/>
/// <reference path="..\..\Scripts\typings\jqueryui\jqueryui.d.ts"/>

(function ($) {
    $.widget("BMA.modelstoragewidget", {

        _previewDiv: undefined,
        motifs: undefined,


        options: {
            items: [],
            oneDriveItems: [],
            isAuthorized: false,
            onsigninonedrive: undefined,
            onsignoutonedrive: undefined,
            getmodelbyname: undefined, //for loading from local storage
            getmodelbyinfo: undefined, //for loading from onedrive
            loadmodelcallback: undefined, //for loading selected model to BMA
            activeRepo: "local",

            dragcontainer: "#drawingSurfaceContainer"
        },

        _create: function () {
            var that = this;
            var items = this.options.items;
            this.element.addClass('model-repository');

            //var header = $('<span></span>')
            //    .text("Repository")
            //    .addClass('window-title')
            //    .appendTo(that.element);
            //this.refreshDiv = $("<div></div>").addClass("refresh").appendTo(that.element).click(function () {
            //    if (that.options.updatemodellistcallback !== undefined)
            //        that.options.updatemodellistcallback();
            //}).hide();
            //var closediv = $('<div></div>').addClass('close-icon').appendTo(that.element);
            //var closing = $('<img src="../../images/close.png">').appendTo(closediv);
            //closing.bind("click", function () {
            //    that.element.hide();
            //});
            //that.element.draggable({ containment: "parent", scroll: false });
            this.message = $('<div></div>')
                //.addClass('localstorage-widget-message')
                .appendTo(this.element);

            //this.switcher = $("<div></div>").addClass("repository-switcher").appendTo(this.element).hide();
            //this.localStorageBtn = $("<div>Local</div>").addClass("repository-bttn").addClass("active").appendTo(this.switcher).click(function() {
            //    that.localStorageBtn.addClass("active");
            //    that.oneDriveStorageBtn.removeClass("active");
            //    that.localStorage.show();
            //    that.oneDriveStorage.hide();
            //});

            //this.oneDriveStorageBtn = $("<div>OneDrive</div>").addClass("repository-bttn").appendTo(this.switcher).click(function () {
            //    that.localStorageBtn.removeClass("active");
            //    that.oneDriveStorageBtn.addClass("active");
            //    that.localStorage.hide();
            //    that.oneDriveStorage.show();
            //});

            var searchBar = $("<div></div>").searchbar().appendTo(this.element);

            var storagerepoconteiner = $("<div></div>").addClass("localstorage-repo-container").appendTo(this.element);

            this.localStorage = $("<div></div>").addClass("localstorage-repo").appendTo(storagerepoconteiner);
            this.oneDriveStorage = $("<div></div>").addClass("localstorage-repo").appendTo(storagerepoconteiner);

            if (that.options.localStorageWidget) {
                $(that.localStorage).replaceWith(that.options.localStorageWidget);
                that.localStorage = that.options.localStorageWidget;
                that.localStorage.addClass("localstorage-repo");

                that.localStorage.localstoragewidget({
                    onmessagechanged: function (msg) {
                        that.message.text(msg);
                    },
                    oncancelselection: function () {
                        that.CancelSelection();
                    }
                });
            }
            //this.localStorage.localstoragewidget();
            if (that.options.oneDriveWidget) {
                $(that.oneDriveStorage).replaceWith(that.options.oneDriveWidget);
                that.oneDriveStorage = that.options.oneDriveWidget;
                that.oneDriveStorage.addClass("localstorage-repo");

                that.oneDriveStorage.onedrivestoragewidget({
                    onmessagechanged: function (msg) {
                        that.message.text(msg);
                    },
                    oncancelselection: function () {
                        that.CancelSelection();
                    }
                });
            }

            var previewDivContainer = $("<div></div>")
                .css("display", "flex")
                .css("align-items", "center")
                .css("flex-direction", "column")
                .css("padding-top", 10)
                .css("padding-bottom", 10)
                .css("border-top", "1px solid black")
                .appendTo(this.element);

            var previewFull = $("<div></div>").css("display", "block").appendTo(previewDivContainer);

            var previewHeder = $("<div></div>").addClass("ml-card-title").text("<model/motif name>").appendTo(previewFull);
            var previewFrame = $("<div></div>").addClass("ml-bounding-box").appendTo(previewFull);
            var previewDescription = $("<div></div>").addClass("ml-card-description").text("<model/motif description>").appendTo(previewFull);

            var previewDiv = $("<div></div>").addClass("ml-preview").appendTo(previewFrame);
            previewDiv.previewviewer({
                onloadmodelcallback: function () {
                    if (that.options.loadmodelcallback !== undefined) {
                        that.options.loadmodelcallback(previewDiv.previewviewer('option', 'model'));
                    }
                }
            });
            previewDiv.hide();

            that._previewDiv = previewDiv;

            previewDiv.draggable({
                helper: "clone", appendTo: "body", cursor: "pointer", containment: that.options.dragcontainer, scope: "ml-card"
            });

            var loadMotifToPreview = function (motif) {
                previewDiv.previewviewer("showLoading");
                previewHeder.text(motif.name);
                var descr = motif.layout.Description;
                if (descr == undefined || descr == "")
                    descr = "no description for this model or motif";
                previewDescription.text(descr);
                previewDiv.previewviewer({ model: { Model: motif.model, Layout: motif.layout } });
                previewDiv.show();
            }

            that.localStorage.localstoragewidget({
                onelementselected: function (content) {
                    if (content.source === "storage") {
                        var mname = content.item;
                        if (that.options.getmodelbyname !== undefined) {
                            previewDiv.previewviewer("showLoading");
                            that.options.getmodelbyname(mname).done(function (model) {
                                previewHeder.text(mname);

                                var descr = model.Layout.Description;
                                if (descr == undefined || descr == "")
                                    descr = "no description for this model or motif";
                                previewDescription.text(descr);
                                previewDiv.previewviewer({ model: model });
                                previewDiv.show();
                            });
                        }
                    } else {
                        loadMotifToPreview(content.item);
                    }
                }
            });

            that.oneDriveStorage.onedrivestoragewidget({
                onelementselected: function (content) {
                    if (content.source === "storage") {
                        var minfo = content.item;
                        if (that.options.getmodelbyinfo !== undefined) {
                            previewDiv.previewviewer("showLoading");
                            that.options.getmodelbyinfo(minfo).done(function (model) {
                                previewHeder.text(minfo.name);

                                var descr = model.Layout.Description;
                                if (descr == undefined || descr == "")
                                    descr = "no description for this model or motif";
                                previewDescription.text(descr);
                                previewDiv.previewviewer({ model: model });
                                previewDiv.show();
                            });
                        } else {
                            console.log("can't load models from OneDrive");
                        }
                    } else {
                        loadMotifToPreview(content.item);
                    }
                }
            });

            searchBar.searchbar({
                ontextfilterupdated: function (searchstr) {
                    that.localStorage.localstoragewidget({
                        filterString: searchstr
                    });
                    that.oneDriveStorage.onedrivestoragewidget({
                        filterString: searchstr
                    });
                }
            });

            this.oneDriveStorage.hide();

            this.loadMotifs(function () {
                that.localStorage.localstoragewidget({
                    motifs: that.motifs
                });
                that.oneDriveStorage.onedrivestoragewidget({
                    motifs: that.motifs
                });
            });
        },

        loadMotifs: function (callback) {
            var that = this;
            that.motifs = [];

            var preloadedPaths = [
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

            var loadMotif = function (mpathes) {
                if (mpathes.length > 0) {
                    var path = mpathes.pop();

                    $.ajax(path, {
                        dataType: "text",
                        success: function (fileContent) {
                            that.AddFromJSON(fileContent);
                            loadMotif(mpathes);
                        },
                        error: function (err) {
                            console.log("failed to load motif " + path + " :" + err);
                            loadMotif(mpathes);
                        }
                    });
                } else {
                    callback();
                }
            }

            loadMotif(preloadedPaths);
        },

        AddFromJSON(source) {
            var that = this;
            var parsed = JSON.parse(source);
            var imported = BMA.Model.ImportModelAndLayout(parsed);
            var adjusted = BMA.ModelHelper.AdjustReceptorsPosition(imported.Model, imported.Layout, window.GridSettings);
            var newMotif = { name: parsed.Model.Name, model: adjusted.model, layout: adjusted.layout };
            that.motifs.push(newMotif);
        },

        Message: function (msg) {
            this.message.text(msg);
        },

        GetPreviewModel: function () {
            return this._previewDiv.previewviewer("option", "model");
        },

        //AddItem: function (item) {
        //    var that = this;
        //    this.options.items.push(item);
        //    this.localStorage.localstoragewidget( "AddItem", item );
        //    this.refresh();
        //},

        //AddOneDriveItem: function (item) {
        //    var that = this;
        //    this.options.oneDriveItems.push(item);
        //    this.oneDriveStorage.onedrivestoragewidget("AddItem", item);
        //    this.refresh();
        //},

        //GetLocalStorageWidget: function () {
        //    return this.localStorage;
        //},

        //GetOneDriveStorageWidget: function () {
        //    return this.oneDriveStorage;
        //},

        //CancelSelection: function () {
        //    var that = this;
        //    if (that.options.isAuthorized) {
        //        if (that.localStorageBtn.hasClass("active"))
        //            that.oneDriveStorage.onedrivestoragewidget("cancelSelection");
        //        else if (that.oneDriveStorageBtn.hasClass("active"))
        //            that.localStorage.localstoragewidget("cancelSelection");
        //    }
        //},

        _setOption: function (key, value) {
            var that = this;
            switch (key) {
                //case "items":
                //    this.options.items = value;
                //    this.localStorage.localstoragewidget({ items: that.options.items });
                //    this.refresh();
                //    break;
                //case "oneDriveItems":
                //    this.options.oneDriveItems = value;
                //    this.oneDriveStorage.onedrivestoragewidget({ items: that.options.oneDriveItems});
                //    this.refresh();
                //    break;
                //case "onsigninonedrive":
                //    that.options.onsigninonedrive = value;
                //    break;
                //case "onsignoutonedrive":
                //    that.options.onsignoutonedrive = value;
                //    break;
                case "isAuthorized":
                    that.options.isAuthorized = value;
                    if (that.options.isAuthorized) {
                        //that.localStorageBtn.removeClass("active");
                        //that.oneDriveStorageBtn.addClass("active");
                        that.localStorage.hide();
                        that.oneDriveStorage.show();

                        //that.refreshDiv.show();
                        //that.singinOneDriveBtn.text("Sign out OneDrive");
                        // that.switcher.show();
                    } else {
                        //that.localStorageBtn.addClass("active");
                        //that.oneDriveStorageBtn.removeClass("active");
                        that.localStorage.show();
                        that.oneDriveStorage.hide();

                        //that.refreshDiv.hide();

                        //that.singinOneDriveBtn.text("Sign in with OneDrive");
                        //that.switcher.hide();
                    }
                    break;
                case "localStorageWidget":
                    this.options.localStorageWidget = value;
                    if (value) {
                        $(that.localStorage).replaceWith(value);
                        that.localStorage = that.options.localStorageWidget;
                        that.localStorage.addClass("localstorage-repo");

                        that.localStorage.localstoragewidget({
                            onmessagechanged: function (msg) {
                                that.message.text(msg);
                            },
                        });
                    }
                    break;
                case "oneDriveWidget":
                    this.options.oneDriveWidget = value;
                    if (value) {
                        $(that.oneDriveStorage).replaceWith(value);
                        that.oneDriveStorage = that.options.oneDriveWidget;
                        that.oneDriveStorage.addClass("localstorage-repo");

                        that.oneDriveStorage.onedrivestoragewidget({
                            onmessagechanged: function (msg) {
                                that.message.text(msg);
                            },
                        });
                    }
                    break;
            }
            this._super(key, value);
        },

        destroy: function () {
            $.Widget.prototype.destroy.call(this);
            this.element.empty();
        }

    });
} (jQuery));

interface JQuery {
    modelstoragewidget(): JQuery;
    modelstoragewidget(settings: Object): JQuery;
    modelstoragewidget(optionLiteral: string, optionName: string): any;
    modelstoragewidget(optionLiteral: string, optionName: string, optionValue: any): JQuery;
}
 
