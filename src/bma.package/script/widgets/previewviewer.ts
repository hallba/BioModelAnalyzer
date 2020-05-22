// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/// <reference path="..\..\Scripts\typings\jquery\jquery.d.ts"/>
/// <reference path="..\..\Scripts\typings\jqueryui\jqueryui.d.ts"/>
/// <reference path="../rendering/elementsregistry.ts"/>


(function ($) {
    $.widget("BMA.previewviewer", {
        options: {
            model: undefined
        },

        _svg: undefined,

        _create: function () {
            var that = this;
            that.element.svg({
                onLoad: (svg) => {
                    svg.configure({
                        width: that.element.width(),
                        height: that.element.height()
                    });

                    that._svg = svg;
                    that._renderPreview();
                }
            });

        },

        _renderPreview: function () {
            if (this.options.model !== undefined) {
                var that = this;
                var svg = that._svg;
                var grid = { x0: 0, y0: 0, xStep: window.GridSettings.xStep, yStep: window.GridSettings.yStep };

                that.model = this.options.model.Model;
                that.layout = this.options.model.Layout;

                var bbox = BMA.ModelHelper.GetModelSVGBoundingBox(that.model, that.layout, { xOrigin: 0, yOrigin: 0, xStep: grid.xStep, yStep: grid.yStep });

                //Adding some padding
                bbox.x -= bbox.width * 0.05;
                bbox.y -= bbox.height * 0.05;
                bbox.width *= 1.1;
                bbox.height *= 1.1;

                svg.configure({
                    viewBox: bbox.x + " " + bbox.y + " " + bbox.width + " " + bbox.height,
                    preserveAspectRatio: "xMidYMid meet"
                }, false);

                var preview = BMA.ModelHelper.RenderSVG(svg, that.model, that.layout, grid, { skipText: true });

                svg.clear();
                svg.add($(preview).children());
            }
        },

        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        },

        _setOption: function (key, value) {
            var that = this;
            switch (key) {
                case "model":
                    this.options.model = value;
                    if (that._svg !== undefined) {
                        that._renderPreview();
                    }
                    break;
            }
            this._super(key, value);
        }

    });
} (jQuery));

interface JQuery {
    previewviewer(): JQuery;
    previewviewer(settings: Object): JQuery;
    previewviewer(optionLiteral: string, optionName: string): any;
    previewviewer(optionLiteral: string, optionName: string, optionValue: any): JQuery;
}
