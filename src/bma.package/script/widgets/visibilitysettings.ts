// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/// <reference path="..\..\Scripts\typings\jquery\jquery.d.ts"/>
/// <reference path="..\..\Scripts\typings\jqueryui\jqueryui.d.ts"/>

(function ($) {
    $.widget("BMA.visibilitysettings", {

        _getList: function () {
            return this.list || this.element.find("ol,ul").eq(0);;
        },

        _create: function () {

            var that = this;
            this.list = this._getList();
            this.items = this.list.find("li");
            this.listOptions = [];


            this.items.each(function (ind) {

                var item = this;
                that.listOptions[ind] = {};
                var option = $(item).children(':first-child');
                that.listOptions[ind].name = option.text();
                var buttons = option.next();
                var children = buttons.children();
                children.each(function () {
                    var child = this;
                    var text = $(child).text();
                    var behavior = $(child).attr("data-behavior");

                    if (behavior !== undefined) {

                        var command, value = undefined;
                        try {
                            command = $(child).attr("data-command");
                        }
                        catch (ex) {
                            console.log("Error binding to command: " + ex);
                        }

                        switch (behavior) {
                            case "action":
                                $(this).bind('click', function () {
                                    window.Commands.Execute(command, {});
                                })
                                break;
                            case "toggle":
                                if (that.listOptions[ind].toggle === undefined) {
                                    value = command !== undefined ? ($(child).attr("data-default") === "true") : undefined;
                                    var button = $('<button></button>')
                                        .appendTo($(child));
                                    if (value) {
                                        button.parent().addClass("default-button onoff green");
                                        button.text("ON");
                                    }
                                    else {
                                        button.parent().addClass("default-button onoff grey");
                                        button.text("OFF");
                                    }

                                    that.listOptions[ind].toggle = value;
                                    that.listOptions[ind].toggleButton = button;
                                    if (command !== undefined) {
                                        button.parent().bind("click", function (e) {
                                            that.listOptions[ind].toggle = !that.listOptions[ind].toggle;
                                            window.Commands.Execute(command, that.listOptions[ind].toggle);
                                            that.changeButtonONOFFStyle(ind);
                                        });
                                    }
                                }
                                else
                                    console.log("Names of options should be different");
                                break;
                            case "multitoggle":
                                //var options = [];
                                //$(child).children().each(function (ei, elt) { options.push((<any>elt).text()); });
                                //$(child).empty();
                                $(child).css("display", "flex");
                                $(child).children().each(function (ei, elt) {
                                    var cmdarg = $(elt).attr("data-option");
                                    $(elt).click(function (args) {
                                        $(child).children().removeClass("green").addClass("grey");
                                        $(elt).removeClass("grey").addClass("green");
                                        window.Commands.Execute(command, cmdarg);
                                    });
                                });

                                break;

                            case "increment":
                                if (that.listOptions[ind].increment === undefined) {
                                    value = command !== undefined ? parseInt($(child).attr("data-default")) || 10 : undefined;
                                    $(this).addClass('pill-button-box');
                                    var plus = $('<button>+</button>').addClass("pill-button")
                                        .appendTo($(child))
                                        .addClass("hoverable");
                                    var minus = $('<button>-</button>').addClass("pill-button")
                                        .appendTo($(child))
                                        .addClass("hoverable");
                                    that.listOptions[ind].increment = value;
                                    plus.bind("click", function () {
                                        that.listOptions[ind].increment++;
                                        window.Commands.Execute(command, that.listOptions[ind].increment);
                                    })
                                    minus.bind("click", function () {
                                        if (that.listOptions[ind].increment > 1) {
                                            that.listOptions[ind].increment--;
                                            window.Commands.Execute(command, Math.max(1, that.listOptions[ind].increment));
                                        }
                                    })
                                }
                                break;
                        }
                    }
                })
            });
        },

        changeButtonONOFFStyle: function (ind) {
            var button = this.listOptions[ind].toggleButton;
            if (!this.listOptions[ind].toggle) {
                button.text("OFF");
                button.parent().removeClass("green").addClass("grey");
            }
            else {
                button.text("ON");
                button.parent().removeClass("grey").addClass("green");
            }
        },


        _setOption: function (key, value) {
            switch (key) {
                case "settingsState":
                    for (var i = 0; i < this.listOptions.length; i++) {
                        if (this.listOptions[i].name === value.name) {
                            this.listOptions[i].toggle = value.toggle;
                            this.changeButtonONOFFStyle(i);
                            this.listOptions[i].increment = value.increment;
                            return;
                        }
                        else console.log("No such option");
                    }
                    break;
            }
            $.Widget.prototype._setOption.apply(this, arguments);
            this._super("_setOption", key, value);
        },

        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        }

    });
}(jQuery));

(function ($) {
    $.widget("BMA.viewswitchwidget", {

        _abut: undefined,
        _bbut: undefined,
        _cbut: undefined,
        _mbut: undefined,

        _create: function () {
            var root = this.element;

            var width = 120;
            var topOffset = 18;

            var aSize = 14;
            var mSize = 24;
            var cSize = 24;
            var bSize = 24;

            var mXOffset = width * 0.33 - mSize * 0.5;
            var bXOffset = width - bSize * 0.5;
            var cXOffset = (mXOffset + bXOffset) * 0.5;

            var mYOffset = topOffset - mSize * 0.5;
            var cYOffset = topOffset - cSize * 0.5;
            var bYOffset = topOffset - bSize * 0.5;

            root.width(width).height(30).css("position", "relative");
            var horLine = $("<div></div>").width(width).height(12).css("background-repeat", "no-repeat").css("background-position", "center").css("background-size", "contain").css("background-image", "url(images/settings/viewswitch/VM_Background.svg)").css("position", "absolute").css("left", 0).css("top", 24).appendTo(root);
            var Abut = $("<div></div>").css("background-repeat", "no-repeat").css("background-position", "center").css("background-size", "contain").width(aSize).height(aSize).css("background-image", "url(images/settings/viewswitch/VM_Auto_Active.svg)").css("position", "absolute").css("cursor", "pointer").css("left", -aSize * 0.5).css("top", 0.5 * (mSize - aSize)).appendTo(root);
            var Mbut = $("<div></div>").css("background-repeat", "no-repeat").css("background-position", "center").css("background-size", "contain").width(mSize).height(mSize).css("background-image", "url(images/settings/viewswitch/VM_Model_Inactive.svg)").css("position", "absolute").css("cursor", "pointer").css("left", mXOffset).css("top", 0).appendTo(root);
            var Cbut = $("<div></div>").css("background-repeat", "no-repeat").css("background-position", "center").css("background-size", "contain").width(cSize).height(cSize).css("background-image", "url(images/settings/viewswitch/VM_Constelations_Inactive.svg)").css("position", "absolute").css("cursor", "pointer").css("left", cXOffset).css("top", 0).appendTo(root);
            var Bbut = $("<div></div>").css("background-repeat", "no-repeat").css("background-position", "center").css("background-size", "contain").width(bSize).height(bSize).css("background-image", "url(images/settings/viewswitch/VM_Bubbles_Inactive.svg)").css("position", "absolute").css("cursor", "pointer").css("left", bXOffset).css("top", 0).appendTo(root);

            Abut.click(function () {
                Abut.css("background-image", "url(images/settings/viewswitch/VM_Auto_Active.svg)");
                Mbut.css("background-image", "url(images/settings/viewswitch/VM_Model_Inactive.svg)");
                Cbut.css("background-image", "url(images/settings/viewswitch/VM_Constelations_Inactive.svg)");
                Bbut.css("background-image", "url(images/settings/viewswitch/VM_Bubbles_Inactive.svg)");

                window.Commands.Execute("ChangeViewMode", "Auto");
            });

            Mbut.click(function () {
                Abut.css("background-image", "url(images/settings/viewswitch/VM_Auto_Inactive.svg)");
                Mbut.css("background-image", "url(images/settings/viewswitch/VM_Model_Active.svg)");
                Cbut.css("background-image", "url(images/settings/viewswitch/VM_Constelations_Inactive.svg)");
                Bbut.css("background-image", "url(images/settings/viewswitch/VM_Bubbles_Inactive.svg)");

                window.Commands.Execute("ChangeViewMode", "Model");
            });

            Cbut.click(function () {
                Abut.css("background-image", "url(images/settings/viewswitch/VM_Auto_Inactive.svg)");
                Mbut.css("background-image", "url(images/settings/viewswitch/VM_Model_Inactive.svg)");
                Cbut.css("background-image", "url(images/settings/viewswitch/VM_Constelations_Active.svg)");
                Bbut.css("background-image", "url(images/settings/viewswitch/VM_Bubbles_Inactive.svg)");

                window.Commands.Execute("ChangeViewMode", "Constelations");
            });

            Bbut.click(function () {
                Abut.css("background-image", "url(images/settings/viewswitch/VM_Auto_Inactive.svg)");
                Mbut.css("background-image", "url(images/settings/viewswitch/VM_Model_Inactive.svg)");
                Cbut.css("background-image", "url(images/settings/viewswitch/VM_Constelations_Inactive.svg)");
                Bbut.css("background-image", "url(images/settings/viewswitch/VM_Bubbles_Active.svg)");

                window.Commands.Execute("ChangeViewMode", "Bubbles");
            });

            this._abut = Abut;
            this._bbut = Bbut;
            this._cbut = Cbut;
            this._mbut = Mbut;
        },

        SetViewMode: function (mode) {
            switch (mode) {
                case "Auto": this._abut.click(); break;
                case "Model": this._mbut.click(); break;
                case "Constelations": this._cbut.click(); break;
                case "Bubbles": this._bbut.click(); break;
                default:
                    console.log("Unknown view switch mode");
            }
        },

        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        }
    });
}(jQuery));

interface JQuery {
    visibilitysettings(): JQuery;
    visibilitysettings(settings: Object): JQuery;
    visibilitysettings(optionLiteral: string, optionName: string): any;
    visibilitysettings(optionLiteral: string, optionName: string, optionValue: any): JQuery;

    viewswitchwidget(): JQuery;
    viewswitchwidget(settings: Object): JQuery;
    viewswitchwidget(optionLiteral: string, optionName: string): any;
    viewswitchwidget(optionLiteral: string, optionName: string, optionValue: any): JQuery;
}
