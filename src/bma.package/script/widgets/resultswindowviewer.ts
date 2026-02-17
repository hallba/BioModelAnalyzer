// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/// <reference path="..\..\Scripts\typings\jquery\jquery.d.ts"/>
/// <reference path="..\..\Scripts\typings\jqueryui\jqueryui.d.ts"/>

(function ($) {
    $.widget("BMA.resultswindowviewer", {
        options: {
            isResizable: false,
            content: $(),
            header: "",
            icon: "",
            effects: { effect: 'size', easing: 'easeInExpo', duration: 200, complete: function () { } },
            tabid: "",
            onresize: undefined,
            paddingOn: true,
            iconOn: true,
        },

        reseticon: function () {
            var that = this;
            var options = this.options;
            this.buttondiv.empty();
            if (that.options.iconOn) {
                var url = "";
                if (this.options.icon === "max")
                    url = "../../images/maximize.png";
                else
                    if (this.options.icon === "min")
                        url = "../../images/minimize.png";
                    else url = this.options.icon;

                this.button = $('<img src=' + url + '>').addClass('expand-window-icon');
                this.button.appendTo(this.buttondiv);
                this.button.bind("click", function () {
                    if (options.icon === "max")
                        window.Commands.Execute("Expand", that.options.tabid);
                    if (options.icon === "min")
                        window.Commands.Execute("Collapse", that.options.tabid);
                });
            }
        },

        refresh: function () {
            var that = this;
            var options = this.options;

            // Check if we're trying to set the exact same content (same jQuery object)
            // This prevents unnecessary detach/reappend which triggers widget reinitialization
            if (options.content && this.content && options.content.get && this.content.get) {
                var isSameContent = options.content.get(0) === this.content.get(0);
                if (isSameContent) {
                    console.log('[ResultsWindow] refresh - same content, skipping detach/append');
                    return; // Don't detach/reappend the same content
                }
            }

            console.log('[ResultsWindow] refresh - detaching old content, appending new');
            // Detach old content if it exists
            if (this.content && this.content.detach) {
                this.content.detach();
            }

            // Append new content
            if (options.content !== undefined) {
                this.content = options.content.appendTo(that.element);
            }

        },

        _create: function () {
            var that = this;
            var options = this.options;
            if (!options.paddingOn) this.element.addClass("no-frames");

            if (options.isResizable) {
                this.element.resizable({
                    minWidth: 800,
                    minHeight: 600,
                    resize: function (event, ui) {
                        if (that.options.onresize !== undefined) {
                            that.options.onresize();
                        }
                    }
                });
                this.element.width(800);
                this.element.height(600);
                this.element.trigger("resize");
            } else {
                if (this.element.hasClass("ui-resizable")) {
                    this.element.resizable("destroy");
                    this.element.css("width", '');
                    this.element.css("height", '');
                }
            }

            this.header = $('<div></div>')
                .addClass('analysis-title')
                .appendTo(this.element);
            if (!options.paddingOn) this.header.addClass("no-frames-title");

            $('<span></span>')
                .text(options.header)
                .appendTo(this.header);
            this.buttondiv = $('<div></div>').addClass("expand-collapse-bttn").appendTo(that.header);
            //this.icon = $('<div></div>').appendTo(this.header);

            // Directly append content if provided, don't call refresh() which would detach/reappend
            if (options.content !== undefined) {
                this.content = options.content.appendTo(this.element);
            } else {
                this.content = $('<div></div>').appendTo(this.element);
            }
            this.reseticon();
        },

        toggle: function () {
            this.element.toggle(this.options.effects);
        },

        getbutton: function () {
            return this.button;
        },

        _destroy: function () {
            this.element.empty();
        },

        _setOption: function (key, value) {
            var that = this;
            var oldValue = this.options[key];
            this._super(key, value);

            switch (key) {
                case "header":
                    this.header.children("span").text(value);
                    break;
                case "content":
                    // Just update the content reference without calling refresh
                    // refresh() will be called during _create, but not on subsequent option updates
                    console.log('[ResultsWindow] content option changed, updating reference only');
                    if (value && value.get) {
                        console.log('[ResultsWindow] Comparing content - old:', this.content ? this.content.get(0) : 'none',
                            'new:', value.get(0), 'same?:', this.content && this.content.get(0) === value.get(0));
                        // If new content is provided, detach old and append new
                        if (this.content && this.content.detach && this.content.get(0) !== value.get(0)) {
                            console.log('[ResultsWindow] detaching old content, appending new');
                            this.content.detach();
                            this.content = value.appendTo(this.element);
                        } else if (!this.content) {
                            console.log('[ResultsWindow] no existing content, appending new');
                            this.content = value.appendTo(this.element);
                        } else {
                            console.log('[ResultsWindow] same content, no action needed');
                        }
                    }
                    break;
                case "icon":
                    this.reseticon();
                    break;
                case "isResizable":
                    if (oldValue !== value) {
                        if (value) {
                            this.element.resizable({
                                minWidth: 800,
                                minHeight: 600,
                                resize: function (event, ui) {
                                    if (that.options.onresize !== undefined) {
                                        that.options.onresize();
                                    }
                                }
                            });
                            this.element.width(800);
                            this.element.height(600);
                            this.element.trigger("resize");
                        } else {
                            this.element.resizable("destroy");
                            this.element.css("width", '');
                            this.element.css("height", '');
                        }
                    }
                    break;
                case "paddingOn":
                    if (oldValue !== value) {
                        value ? this.element.removeClass("no-frames") : this.element.addClass("no-frames");
                        value ? this.header.removeClass("no-frames-title") : this.header.addClass("no-frames-title");
                    }
                    break;
            }
        }
    });
}(jQuery));

interface JQuery {
    resultswindowviewer(): JQuery;
    resultswindowviewer(settings: Object): JQuery;
    resultswindowviewer(fun: string): any;
    resultswindowviewer(optionLiteral: string, optionName: string): any;
    resultswindowviewer(optionLiteral: string, optionName: string, optionValue: any): JQuery;
} 
