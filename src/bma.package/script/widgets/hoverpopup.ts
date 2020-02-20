// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/// <reference path="..\..\Scripts\typings\jquery\jquery.d.ts"/>
/// <reference path="..\..\Scripts\typings\jqueryui\jqueryui.d.ts"/>

(function ($) {
    var hoverpopup = $.widget("BMA.hoverpopup", {
        options: {
        },

        _create: function () {
            var that = this;
            var options = this.options;

            this._toggle = this.element.children().filter(":even");
            this._content = this._toggle.next();

            this._content.hide();
            this._content.css("position", "absolute");

            this.element.mouseenter(function (e) {
                that._content.show();
            }).mouseleave(function (e) {
                that._content.hide();
            });
        }
    });
} (jQuery));

interface JQuery {
   hoverpopup(): JQuery;
   hoverpopup(settings: Object): JQuery;
   hoverpopup(optionLiteral: string, optionName: string): any;
   hoverpopup(optionLiteral: string, optionName: string, optionValue: any): JQuery;
}
