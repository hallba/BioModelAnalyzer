// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/// <reference path="..\..\Scripts\typings\jquery\jquery.d.ts"/>
/// <reference path="..\..\Scripts\typings\jqueryui\jqueryui.d.ts"/>

(function ($) {
    $.widget("BMA.searchbar", {

        options: {
            ontextfilterupdated: undefined
        },

        _create: function () {
            var that = this;

            this.element.addClass("repository-search");

            var upDiv = $("<div></div>").addClass("icon upArrow").appendTo(this.element);
            var downDiv = $("<div></div>").addClass("icon downArrow").appendTo(this.element);
            var motifSortDiv = $("<div></div>").addClass("icon motifSort").appendTo(this.element);
            var modelSortDiv = $("<div></div>").addClass("icon modelSort").appendTo(this.element);
            var userSortDiv = $("<div></div>").addClass("icon userSort").appendTo(this.element);

            var searchTextBox = $("<input type='text'></input>").appendTo(this.element);
            $("<div>Search</div>").addClass("searchLabel").appendTo(this.element);

            searchTextBox.bind("input", function (e) {
                if (that.options.ontextfilterupdated !== undefined) {
                    that.options.ontextfilterupdated(searchTextBox.val());
                }
            });
        },

        _setOption: function (key, value) {
            switch (key) {
                case "ontextfilterupdated":
                    this.options.onloadmodel = value;
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
    searchbar(): JQuery;
    searchbar(settings: Object): JQuery;
    searchbar(optionLiteral: string, optionName: string): any;
    searchbar(optionLiteral: string, optionName: string, optionValue: any): JQuery;
}

