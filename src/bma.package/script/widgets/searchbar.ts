// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/// <reference path="..\..\Scripts\typings\jquery\jquery.d.ts"/>
/// <reference path="..\..\Scripts\typings\jqueryui\jqueryui.d.ts"/>

(function ($) {
    $.widget("BMA.searchbar", {

        options: {
            ontextfilterupdated: undefined,
            onUpSort: undefined,
            onDownSort: undefined,
            onModelFilterChanged: undefined,
            onMotifFilterChanged: undefined,
            onUserFilterChanged: undefined,
        },

        _isModelFilterEnabled: false,
        _isMotifFilterEnabled: false,
        _isUserFilterEnabled: false,

        _create: function () {
            var that = this;

            this.element.addClass("repository-search");

            var upDownDiv = $("<div></div>").css("display", "flex").width(50).appendTo(this.element);
            var upDiv = $("<div></div>").addClass("icon upArrow").appendTo(upDownDiv);
            var downDiv = $("<div></div>").addClass("icon downArrow").appendTo(upDownDiv);

            upDiv.click(function () {
                if (that.options.onUpSort !== undefined) {
                    that.options.onUpSort();
                }
            });

            downDiv.click(function () {
                if (that.options.onDownSort !== undefined) {
                    that.options.onDownSort();
                }
            });

            var motifSortDiv = $("<div></div>").addClass("icon motifSort").appendTo(this.element);
            var modelSortDiv = $("<div></div>").addClass("icon modelSort").appendTo(this.element);
            var userSortDiv = $("<div></div>").addClass("icon userSort").appendTo(this.element);

            this.userSortDiv = userSortDiv;

            userSortDiv.click(function () {
                if (that._isUserFilterEnabled) {
                    that._isUserFilterEnabled = false;
                    userSortDiv.removeClass("selected");
                } else {
                    that._isUserFilterEnabled = true;
                    userSortDiv.addClass("selected");
                }
                if (that.options.onUserFilterChanged !== undefined) {
                    that.options.onUserFilterChanged(that._isUserFilterEnabled);
                }
            });

            motifSortDiv.click(function () {
                if (that._isMotifFilterEnabled) {
                    that._isMotifFilterEnabled = false;
                    motifSortDiv.removeClass("selected");
                } else {
                    that._isMotifFilterEnabled = true;
                    motifSortDiv.addClass("selected");

                    that._isModelFilterEnabled = false;
                    modelSortDiv.removeClass("selected");
                }
                if (that.options.onMotifFilterChanged !== undefined) {
                    that.options.onMotifFilterChanged(that._isMotifFilterEnabled);
                }
            });

            modelSortDiv.click(function () {
                if (that._isModelFilterEnabled) {
                    that._isModelFilterEnabled = false;
                    modelSortDiv.removeClass("selected");
                } else {
                    that._isModelFilterEnabled = true;
                    modelSortDiv.addClass("selected");

                    that._isMotifFilterEnabled = false;
                    motifSortDiv.removeClass("selected");
                }
                if (that.options.onModelFilterChanged !== undefined) {
                    that.options.onModelFilterChanged(that._isModelFilterEnabled);
                }
            });

            var searchTextBox = $("<input type='text'></input>").appendTo(this.element);
            $("<div>Search</div>").addClass("searchLabel").appendTo(this.element);

            searchTextBox.bind("input", function (e) {
                if (that.options.ontextfilterupdated !== undefined) {
                    that.options.ontextfilterupdated(searchTextBox.val());
                }
            });
        },

        _setOption: function (key, value) {
            var that = this;
            switch (key) {
                case "userSort":
                    that._isUserFilterEnabled = true;
                    if (that._isUserFilterEnabled) {
                        that.userSortDiv.addClass("selected");
                    } else {
                        that.userSortDiv.removeClass("selected");
                    }
                    if (that.options.onUserFilterChanged !== undefined) {
                        that.options.onUserFilterChanged(that._isUserFilterEnabled);
                    }
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

