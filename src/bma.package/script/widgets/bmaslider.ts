// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/// <reference path="..\..\Scripts\typings\jquery\jquery.d.ts"/>
/// <reference path="..\..\Scripts\typings\jqueryui\jqueryui.d.ts"/>

(function ($) {
    $.widget("BMA.bmazoomslider", {
        options: {
            step: 10,
            value: 0,
            min: 0,
            max: 100,
            searchTags: [],
            suppressDirectChangeOnPlusMinusClick: false
        },

        _searchInput: null,

        _create: function () {
            var that = this;
            this.element.addClass("zoomslider-container");

            var command = this.element.attr("data-command");

            this.zoomslider = $('<div></div>').css("display", "none")
                .appendTo(that.element);

            var zoomplus = $('<div></div>')
                .addClass("zoompanel-button zoom-plus")
                .css("background-image", "url('images/navigationpanel/BMA_Icon_Zoom_In.svg')")
                .appendTo(that.element);

            var fitToView = $('<div></div>')
                .addClass("zoompanel-button")
                .css("background-image", "url('images/navigationpanel/BMA_Icon_Fit_To_View.svg')")
                .appendTo(that.element);

            var zoomminus = $('<div></div>')
                .addClass("zoompanel-button zoom-minus")
                .css("background-image", "url('images/navigationpanel/BMA_Icon_Zoom_Out.svg')")
                .appendTo(that.element);

            var search = $('<div id="bmavariablesearch"></div>')
                .addClass("zoompanel-button")
                .css("background-image", "url('images/navigationpanel/BMA_Search_Icon.svg')")
                .appendTo(that.element);

            var searchPanel = $('<div></div>')
                .addClass("variable-search-panel")
                .addClass("window")
                .appendTo(that.element);

            searchPanel.hide();
            that.searchPanel = searchPanel;

            var input = $('<input/>').addClass("variable-search-input").attr({ type: 'text' }).appendTo(searchPanel);
            that.searchInput = input;

            if (that.options.searchTags.length > 0) {
                input.catcomplete({
                    source: that.options.searchTags
                });
            }

            input.catcomplete({
                appendTo: searchPanel,
                select: function (event, ui) {
                    window.Commands.Execute("SearchForContent", { type: "variable", id: ui.item.id });
                }
            });

            //var btn = $('<div></div>').addClass("zoompanel-search-button").css("background-image", "url('images/navigationpanel/BMA_Search_Icon.svg')").appendTo(searchPanel);
            //btn.click(function () {
            //    window.Commands.Execute("SearchForContent", { type: "variable", name: input.val() });
            //});

            search.click(function () {
                if (searchPanel.is(":visible")) {
                    searchPanel.hide();
                    input.catcomplete("customhide");

                    window.Commands.Execute("ClearSearchHighlight", { type: "variable" });
                } else {
                    window.Commands.Execute("CloseRepository", undefined);
                    searchPanel.show();
                }
            });


            this.zoomslider.slider({
                min: that.options.min,
                max: that.options.max,
                //step: that.options.step,
                value: that.options.value,
                change: function (event, ui) {
                    var val = that.zoomslider.slider("option", "value");
                    if (command !== undefined && command !== "" && !that.isSilent) {
                        window.Commands.Execute(command, { value: val });
                    }
                }
            });

            this.zoomslider.removeClass().addClass("zoomslider-bar");
            this.zoomslider.find('span').removeClass().addClass('zoomslider-pointer');

            fitToView.bind("click", function () {
                window.Commands.Execute("ModelFitToView", undefined);
            });

            zoomplus.bind("click", function () {
                var command = that.element.attr("data-command");
                var val = Math.max(that.options.min, that.zoomslider.slider("option", "value") - that.options.step);

                if (command !== undefined && command !== "" && !that.isSilent) {
                    if (!that.options.suppressDirectChangeOnPlusMinusClick) {
                        that.setValueSilently(val);
                    }
                    window.Commands.Execute(command, { value: val });
                } else {
                    that.zoomslider.slider("option", "value", val);
                }
            });

            zoomminus.bind("click", function () {
                var command = that.element.attr("data-command");
                var val = Math.min(that.options.max, that.zoomslider.slider("option", "value") + that.options.step);

                if (command !== undefined && command !== "" && !that.isSilent) {
                    if (!that.options.suppressDirectChangeOnPlusMinusClick) {
                        that.setValueSilently(val);
                    }
                    window.Commands.Execute(command, { value: val });
                } else {
                    that.zoomslider.slider("option", "value", val);
                }
            });
        },

        _destroy: function () {
            var contents;

            // clean up main element
            this.element.removeClass("zoomslider-container");
            this.element.empty();
        },

        _setOption: function (key, value) {
            var that = this;
            switch (key) {
                case "value":
                    if (this.options.value !== value) {
                        var val = Math.min(this.options.max, Math.max(this.options.min, value));
                        this.options.value = val;
                        this.zoomslider.slider("option", "value", val);
                    }
                    break;
                case "min":
                    this.options.min = value;
                    this.zoomslider.slider("option", "min", value);
                    break;
                case "max":
                    this.options.max = value;
                    this.zoomslider.slider("option", "max", value);
                    break;
                case "searchTags":
                    if (value.length > -1) {
                        this.searchInput.catcomplete({
                            source: value
                        });
                        this.searchInput.catcomplete("search", this.searchInput.val());
                    }
                    break;
                default:
                    this._super(key, value);
            }
        },

        isSilent: false,
        setValueSilently: function (value) {
            if (this.options.value !== value) {
                this.options.value = value;
                this.isSilent = true;
                this.zoomslider.slider("option", "value", Math.max(this.options.min, Math.min(this.options.max, value)));
                this.isSilent = false;
            }
        },

    });
}(jQuery));

(function ($) {
    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _create: function () {
            this._super();
            this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");

        },
        _renderMenu: function (ul, items) {
            var that = this,
                currentCategory = "";
            $.each(items, function (index, item) {
                var li;
                if (item.category != currentCategory) {
                    ul.append("<li class='search-autocomplete ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                li = that._renderItemData(ul, item);
                if (item.category) {
                    li.attr("aria-label", item.category + " : " + item.label);
                }
            });
        },
        _renderItem: function (ul, item) {
            ul.addClass("bmavariablesearch");

            return $("<li class='search-autocomplete search-result'>" + item.label + "</li>")
                .appendTo(ul);
        },
        close: function (e) {
            return false;
        },
        customhide: function () {
            this._close();
        }
    });
}(jQuery));

interface JQuery {
    bmazoomslider(): JQuery;
    bmazoomslider(settings: any): JQuery;
    bmazoomslider(optionLiteral: string, optionName: string): any;
    bmazoomslider(optionLiteral: string, optionName: string, optionValue: any): JQuery;
}
