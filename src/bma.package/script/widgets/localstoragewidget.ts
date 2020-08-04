// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/// <reference path="..\..\Scripts\typings\jquery\jquery.d.ts"/>
/// <reference path="..\..\Scripts\typings\jqueryui\jqueryui.d.ts"/>

(function ($) {
    $.widget("BMA.localstoragewidget", {


        options: {
            items: [],
            motifs: [],
            onremovemodel: undefined,
            onloadmodel: undefined,
            enableContextMenu: true,
            onelementselected: undefined,
            onelementunselected: undefined,
            onhidepreloadedcontent: undefined,
            filterString: undefined,
            sortByName: undefined, //could be also "up" and "down"
            filterByType: undefined, //coule be also "model", "motif"
            filterBySource: undefined, //could also be "user"
        },

        _create: function () {
            var that = this;
            this.repo = this.element;
            var items = this.options.items;
            //this.repo = $('<div></div>')
            //    .addClass("localstorage-repo")
            //    //.addClass('localstorage-widget')
            //    .appendTo(this.element);   

            this.refresh();
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
            var that = this;

            var items = this.options.items;
            var motifs = this.options.motifs;
            var fs = that.options.filterString;
            this.repo.empty();


            var itemsToAdd = [];
            if (motifs !== undefined && motifs.length > 0) {
                for (var i = 0; i < motifs.length; i++) {
                    if (fs === undefined || fs === "" || motifs[i].name.toLowerCase().includes(fs.toLowerCase())) {
                        itemsToAdd.push({ item: motifs[i], source: "motifs", type: BMA.UIDrivers.StorageContentType.Motif, name: motifs[i].name });
                    }
                }
            }
            if (items.length > 0) {
                for (var i = 0; i < items.length; i++) {
                    var itemName = items[i].name;
                    if (fs === undefined || fs === "" || itemName.toLowerCase().includes(fs.toLowerCase())) {
                        itemsToAdd.push({ item: itemName, source: "storage", type: items[i].type, name: itemName });
                    }
                }
            }

            this.ol = $('<ol></ol>').appendTo(this.repo);
            if (itemsToAdd.length > 0) {
                if (that.options.sortByName !== undefined) {
                    if (that.options.sortByName === "up") {
                        itemsToAdd = itemsToAdd.sort(function (a, b) { return a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1 });
                    } else {
                        itemsToAdd = itemsToAdd.sort(function (a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1 });
                    }
                }



                for (var i = 0; i < itemsToAdd.length; i++) {


                    var isStorage = itemsToAdd[i].source === "storage";

                    var li = $('<li></li>').appendTo(this.ol).click(function () {
                        var ind = $(this).index();

                        if (that.options.onelementselected != undefined) {
                            that.options.onelementselected(itemsToAdd[ind]);
                        }

                        that.repo.find(".ui-selected").removeClass("ui-selected");
                        that.ol.children().eq(ind).addClass("ui-selected");
                    });

                    var cnt = $("<div></div>").css("display", "flex").css("flex-direction", "row").css("align-items", "center").appendTo(li);

                    if (itemsToAdd[i].type === BMA.UIDrivers.StorageContentType.Model) {
                        $("<div></div>").addClass("repo-model-icon").prependTo(cnt);
                    } else {
                        $("<div></div>").addClass("repo-motif-icon").prependTo(cnt);
                    }

                    var name = isStorage ? itemsToAdd[i].item : itemsToAdd[i].item.name;
                    var modelName = $("<div>" + name + "</div>").addClass("repo-model-name").appendTo(cnt);
                    li.attr("data-name", name);

                    if (isStorage) {
                        $("<div></div>").addClass("repo-user-icon").appendTo(li);
                    }

                    var removeBtn = $('<button></button>').addClass("remove").appendTo(li);

                    if (itemsToAdd[i].source === "storage") {
                        removeBtn.addClass("icon-delete");
                    } else {
                        removeBtn.addClass("icon-hide");
                    }

                    removeBtn.bind("click", function (event) {
                        event.stopPropagation();

                        if ($(this).parent().hasClass("ui-selected")) {
                            that.CancelSelection();
                            if (that.options.onelementunselected !== undefined) {
                                that.options.onelementunselected();
                            }
                        }

                        var itemToAdd = itemsToAdd[$(this).parent().index()];
                        if (that.options.onremovemodel !== undefined && itemToAdd.source === "storage")
                            that.options.onremovemodel(itemToAdd);
                        if (that.options.onhidepreloadedcontent !== undefined && itemToAdd.source != "storage")
                            that.options.onhidepreloadedcontent();
                    });


                    if (that.options.filterBySource !== undefined) {
                        if (that.options.filterBySource === "user" && itemsToAdd[i].source != "storage") {
                            li.hide();
                        }
                    }

                    if (that.options.filterByType !== undefined) {
                        if (that.options.filterByType === "model" && itemsToAdd[i].type != BMA.UIDrivers.StorageContentType.Model) {
                            li.hide();
                        } else if (that.options.filterByType === "motif" && itemsToAdd[i].type != BMA.UIDrivers.StorageContentType.Motif) {
                            li.hide();
                        }
                    }
                }
            }
        },

        CancelSelection: function () {
            this.repo.find(".ui-selected").removeClass("ui-selected");
        },

        Message: function (msg) {
            if (this.onmessagechanged !== undefined)
                this.onmessagechanged(msg);
        },

        SetActiveModel: function (key) {
            var that = this;
            var idx;
            for (var i = 0; i < that.options.items.length; i++) {
                if ((that.options.items[i]) == key) {
                    idx = i;
                    break;
                }
            }
            if (idx !== undefined) {
                this.repo.find(".ui-selected").removeClass("ui-selected");
                this.ol.children().eq(idx).addClass("ui-selected");
            }
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
                        that.options.setoncopytoonedrive(that.options.items[idx]).done(function () {

                            if (ui.cmd == "MoveToOneDrive") {
                                if (that.options.onremovemodel !== undefined)
                                    that.options.onremovemodel(that.options.items[idx]);
                            }
                        });
                    }
                }
            });
        },

        _setOption: function (key, value) {
            switch (key) {
                case "items":
                    this.options.items = value;
                    this.refresh();
                    break;
                case "motifs":
                    this.options.motifs = value;
                    this.refresh();
                    break;
                case "onloadmodel":
                    this.options.onloadmodel = value;
                    break;
                case "onremovemodel":
                    this.options.onremovemodel = value;
                    break;
                case "setoncopytoonedrive":
                    this.options.setoncopytoonedrive = value;
                    break;
                case "onmessagechanged":
                    this.options.onmessagechanged = value;
                    break;
                case "enableContextMenu":
                    this.options.enableContextMenu = value;
                    break;
                case "onelementunselected":
                    this.options.onelementunselected = value;
                    break;
                case "oncancelselection":
                    this.options.oncancelselection = value;
                    break;
                case "filterString":
                    this.options.filterString = value;
                    this.refresh();
                    break;
                case "filterByType":
                    this.options.filterByType = value;
                    this.refresh();
                    break;
                case "filterBySource":
                    this.options.filterBySource = value;
                    this.refresh();
                    break;
                case "sortByName":
                    this.options.sortByName = value;
                    this.refresh();
                    break;
            }
            this._super(key, value);
        },

        destroy: function () {
            this.element.empty();
        }

    });
} (jQuery));

interface JQuery {
    localstoragewidget(): JQuery;
    localstoragewidget(settings: Object): JQuery;
    localstoragewidget(optionLiteral: string, optionName: string): any;
    localstoragewidget(optionLiteral: string, optionName: string, optionValue: any): JQuery;
}
 
