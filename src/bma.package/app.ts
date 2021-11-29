// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/// <reference path="Scripts\typings\jquery\jquery.d.ts"/>
/// <reference path="Scripts\typings\jqueryui\jqueryui.d.ts"/>
/// <reference path="script\model\biomodel.ts"/>
/// <reference path="script\model\model.ts"/>
/// <reference path="script\model\exportimport.ts"/>
/// <reference path="script\model\visualsettings.ts"/>
/// <reference path="script\commands.ts"/>
/// <reference path="script\rendering\elementsregistry.ts"/>
/// <reference path="script\rendering\RenderHelper.ts"/>
/// <reference path="script\rendering\renderingconstants.ts"/>
/// <reference path="script\functionsregistry.ts"/>
/// <reference path="script\keyframesregistry.ts"/>
/// <reference path="script\operatorsregistry.ts"/>
/// <reference path="script\localRepository.ts"/>
/// <reference path="script\uidrivers\commoninterfaces.ts"/>
/// <reference path="script\uidrivers\commondrivers.ts"/>
/// <reference path="script\uidrivers\commoninterfaces.ts"/>
/// <reference path="script\uidrivers\commondrivers.ts"/>
/// <reference path="script\presenters\undoredopresenter.ts"/>
/// <reference path="script\presenters\presenters.ts"/>
/// <reference path="script\presenters\furthertestingpresenter.ts"/>
/// <reference path="script\presenters\simulationpresenter.ts"/>
/// <reference path="script\presenters\onedrivestoragepresenter.ts"/>
/// <reference path="script\presenters\storagepresenter.ts"/>
/// <reference path="script\presenters\localstoragepresenter.ts"/>
/// <reference path="script\SVGHelper.ts"/>
/// <reference path="script\changeschecker.ts"/>
/// <reference path="script\widgets\drawingsurface.ts"/>
/// <reference path="script\widgets\simulationplot.ts"/>
/// <reference path="script\widgets\simulationviewer.ts"/>
/// <reference path="script\widgets\simulationexpanded.ts"/>
/// <reference path="script\widgets\accordeon.ts"/>
/// <reference path="script\widgets\visibilitysettings.ts"/>
/// <reference path="script\widgets\elementbutton.ts"/>
/// <reference path="script\widgets\bmaslider.ts"/>
/// <reference path="script\widgets\userdialog.ts"/>
/// <reference path="script\widgets\variablesOptionsEditor.ts"/>
/// <reference path="script\widgets\progressiontable.ts"/>
/// <reference path="script\widgets\proofresultviewer.ts"/>
/// <reference path="script\widgets\furthertestingviewer.ts"/>
/// <reference path="script\widgets\localstoragewidget.ts"/>
/// <reference path="script\widgets\modelstoragewidget.ts"/>
/// <reference path="script\widgets\onedrivestoragewidget.ts"/>
/// <reference path="script\widgets\ltl\keyframecompact.ts"/>
/// <reference path="script\widgets\ltl\keyframetable.ts"/>
/// <reference path="script\widgets\ltl\ltlstatesviewer.ts"/>
/// <reference path="script\widgets\ltl\ltlviewer.ts"/>
/// <reference path="script\widgets\ltl\ltlresultsviewer.ts"/>
/// <reference path="script\widgets\ltl\statetooltip.ts"/>
/// <reference path="script\widgets\resultswindowviewer.ts"/>
/// <reference path="script\widgets\coloredtableviewer.ts"/>
/// <reference path="script\widgets\containernameeditor.ts"/>
/// <reference path="script\widgets\tftexteditor.ts"/>
/// <reference path="script\jisonparser.ts"/>

declare var saveTextAs: any;
declare var Silverlight: any;
declare var drawingSurceContainer: any;
declare function canvg(a1: any, a2: any, a3: any);

enum ViewSwitchMode {
    Auto = "Auto",
    Model = "Model",
    Constelations = "Constelations",
    Bubbles = "Bubbles"
}

interface JQuery {
    contextmenu(): JQueryUI.Widget;
    contextmenu(settings: Object): JQueryUI.Widget;
    contextmenu(optionLiteral: string, optionName: string): any;
    contextmenu(optionLiteral: string, optionName: string, optionValue: any): JQuery;

    slick(): JQueryUI.Widget;
    slick(settings: Object): JQueryUI.Widget;
    slick(optionLiteral: string, optionName: string): any;
    slick(optionLiteral: string, optionName: string, optionValue: any): JQuery;
}

interface Window {
    PlotSettings: any;
    GridSettings: any;
    BMAServiceURL: string;
    DefaultProteinColors: { Default: string, Constant: string, MembraneReceptor: string };
    MotifLibrary: BMA.Model.MotifLibrary;
    IsModelReadableOnScreen: boolean; //Indicates whether zoom level allows user to read model labels
    CurrentViewSwitchMode: ViewSwitchMode; //Indicates whether model view is changed depending on zoom level or fixed. Could be either "Auto", "Model", "Constelations" or "Bubbles"
}

function onSilverlightError(sender, args) {
    var appSource = "";
    if (sender != null && sender != 0) {
        appSource = sender.getHost().Source;
    }

    var errorType = args.ErrorType;
    var iErrorCode = args.ErrorCode;

    if (errorType == "ImageError" || errorType == "MediaError") {
        return;
    }

    var errMsg = "Unhandled Error in Silverlight Application " + appSource + "\n";

    errMsg += "Code: " + iErrorCode + "    \n";
    errMsg += "Category: " + errorType + "       \n";
    errMsg += "Message: " + args.ErrorMessage + "     \n";

    if (errorType == "ParserError") {
        errMsg += "File: " + args.xamlFile + "     \n";
        errMsg += "Line: " + args.lineNumber + "     \n";
        errMsg += "Position: " + args.charPosition + "     \n";
    }
    else if (errorType == "RuntimeError") {
        if (args.lineNumber != 0) {
            errMsg += "Line: " + args.lineNumber + "     \n";
            errMsg += "Position: " + args.charPosition + "     \n";
        }
        errMsg += "MethodName: " + args.methodName + "     \n";
    }

    alert(errMsg);
}

function getSearchParameters(): any {
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray(prmstr) {
    var params = {};
    var prmarr = prmstr.split("&");
    for (var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

function popup_position() {
    var my_popup = $('.popup-window, .window.dialog');
    var analytic_tabs = $('.tab-right');
    analytic_tabs.each(function () {
        var tab_h = $(this).outerHeight();
        var win_h = $(window).outerHeight() * 0.8;
        if (win_h > tab_h)
            $(this).css({ 'max-height': win_h * 0.8 });

        else
            $(this).css({ 'max-height': '600px' });
    });

    my_popup.each(function () {
        var my_popup_w = $(this).outerWidth(),
            my_popup_h = $(this).outerHeight(),

            win_w = $(window).outerWidth(),
            win_h = $(window).outerHeight(),
            popup_half_w = (win_w - my_popup_w) / 2,
            popup_half_h = (win_h - my_popup_h) / 2;
        if (win_w > my_popup_w) {
            $(this).css({ 'left': popup_half_w });
        }
        if (win_w < my_popup_w) {
            $(this).css({ 'left': 5, });
        }
        if (win_h > my_popup_h) {
            $(this).css({ 'top': popup_half_h });
        }
        if (win_h < my_popup_h) {
            $(this).css({ 'top': 5 });
        }
    })
}

$(document).ready(function () {
    //InteractiveDataDisplay.ZIndexDOMMarkers = undefined;
    var snipper = $('<div></div>').addClass('spinner').appendTo($('.loading-text'));
    for (var i = 1; i < 4; i++) {
        $('<div></div>').addClass('bounce' + i).appendTo(snipper);
    }

    var deferredLoad = function (): JQueryPromise<{}> {
        var dfd = $.Deferred();

        loadVersion().done(function (version) {
            loadScript(version);
            window.setInterval(function () { versionCheck(version); }, 60 * 60 * 1000 /* 1 hour */);
            dfd.resolve();

        });

        return dfd.promise();
    };

    deferredLoad().done(function () {
        $('.page-loading').hide();
    }).fail(function (err) {
        alert("Page loading failed: " + err);
    });

    $(document).ready(function () {
        popup_position();
    });

    $(window).resize(function () {
        popup_position();
        //resize_header_tools();
    });
});

function versionCheck(version) {
    loadVersion().done(function (newVersion) {
        var v = <any>newVersion;
        if (v.major !== version.major || v.minor !== version.minor || v.build !== version.build) {
            var userDialog = $("#versionUpdatedAttention");
            if (!userDialog.length) {
                userDialog = $('<div id="versionUpdatedAttention"></div>').appendTo('body');
                userDialog.userdialog({
                    message: "BMA client was updated on server. Refresh your browser to get latest version",
                    actions: [
                        {
                            button: 'Ok',
                            callback: function () { userDialog.hide(); }
                        }
                    ]
                });
            } else {
                if (!userDialog.is(":visible")) {
                    userDialog.userdialog("Show");
                }
            }
        } else {
            console.log("server version was succesfully checked: client is up to date");
            if (userDialog !== undefined)
                userDialog.detach();
        }
    }).fail(function (err) {
        console.log("there was an error while trying to check server version: " + err);
    });
}

function loadVersion(): JQueryPromise<Object> {
    var d = $.Deferred();
    $.ajax({
        url: "/api/version", //"version.txt",
        dataType: "text",
        success: function (data) {
            var version = JSON.parse(data);
            d.resolve(version);
        },
        error: function (err) {
            d.reject(err);
        }
    });
    return d.promise();
}

function loadScript(version) {
    var version_key = 'bma-version';
    var versionText = version.major + '.' + version.minor + '.' + version.build;

    //$('.version-number').text(versionText);

    //Creating CommandRegistry
    window.Commands = new BMA.CommandRegistry();
    var ltlCommands = new BMA.CommandRegistry();

    //Defining processing service URL
    // To test locally, change to "" (empty string)
    window.BMAServiceURL = version.computeServiceUrl; //"http://bmamathnew.cloudapp.net";

    //Creating ElementsRegistry
    window.ElementRegistry = new BMA.Elements.ElementsRegistry();

    //Creating FunctionsRegistry
    window.FunctionsRegistry = new BMA.Functions.FunctionsRegistry();

    //Creating KeyframesRegistry
    window.KeyframesRegistry = new BMA.Keyframes.KeyframesRegistry();
    window.OperatorsRegistry = new BMA.LTLOperations.OperatorsRegistry();
    //Creating model and layout
    var appModel = new BMA.Model.AppModel();
    var motifLibrary = new BMA.Model.MotifLibrary(window.Commands);
    window.MotifLibrary = motifLibrary;

    window.PlotSettings = {
        MaxWidth: 3200,
        MinWidth: 800
    };

    window.GridSettings = {
        xOrigin: 0,
        yOrigin: 0,
        xStep: 250,
        yStep: 280
    };

    (<any>window).ViewSwitchSettings = {
        ModelConstelationsStart: 280,
        ModelConstelationsEnd: 200,
        ConstelationsBubblesStart: 190,
        ConstelationsBubblesEnd: 140
    };

    (<any>window).CurrentViewSwitchMode = ViewSwitchMode.Auto;

    window.DefaultProteinColors = {
        "Constant": undefined,
        "Default": undefined,
        "MembraneReceptor": undefined,
    };

    //Loading widgets
    var drawingSurface = $("#drawingSurface");
    drawingSurface.drawingsurface({ showLogo: true, version: 'v. ' + versionText });
    $("#zoomslider").bmazoomslider({ value: 50, min: 0, max: 100, suppressDirectChangeOnPlusMinusClick: true });
    $("#modelToolbarHeader").buttonset();
    $("#modelToolbarContent").buttonset();
    $("#visibilityOptionsContent").visibilitysettings();
    //$("#visibilityOptionsSlider").bmaaccordion();

    $("#visibilityOptionsContent").css("position", "absolute").hide();
    $("#visibilityOptionsButton").click(function (e) {
        if ($("#visibilityOptionsContent").is(":visible")) {
            $("#visibilityOptionsContent").hide();
        } else {
            var ofs = $("#visibilityOptionsSlider").offset();
            var top = ofs.top + $("#visibilityOptionsSlider").outerHeight();
            var right = Math.max(0, $(document).outerWidth() - (ofs.left + $("#visibilityOptionsContent").outerWidth()));

            $("#visibilityOptionsContent").css("top", top).css("right", right);
            $("#visibilityOptionsContent").show();
        }
    });


    $("#modelToolbarContent").hide();
    $(".expand-btn").click(function () {
        if ($("#modelToolbarContent").is(":visible")) {
            $("#modelToolbarContent").hide();
            $(".expand-btn").css("transform", "scaleX(1)");
        }
        else {
            $("#modelToolbarContent").show();
            $(".expand-btn").css("transform", "scaleX(-1)");
        }
    });

    $("#modelNameEditor").val(appModel.BioModel.Name);
    $("#modelNameEditor").click(function (e) {
        e.stopPropagation();
    });
    $("#modelNameEditor").bind("input change", function () {
        appModel.BioModel.Name = $(this).val();
    });
    window.Commands.On("ModelReset", function () {
        $("#modelNameEditor").val(appModel.BioModel.Name);

        //Sync current view switch state with zoom lock
        zoomLockState = window.CurrentViewSwitchMode;
    });

    var holdCords = {
        holdX: 0,
        holdY: 0
    }

    $(document).on('vmousedown', function (event) {

        holdCords.holdX = event.pageX;
        holdCords.holdY = event.pageY;
    });

    $(document).keydown(function (event) {
        if (event.ctrlKey && event.key == "c") {
            window.Commands.Execute("DrawingSurfaceCopy", undefined);
        } else if (event.ctrlKey && event.key == "x") {
            window.Commands.Execute("DrawingSurfaceCut", undefined);
        } else if (event.ctrlKey && event.key == "z") {
            window.Commands.Execute("Undo", undefined);
        } else if (event.ctrlKey && event.key == "y") {
            window.Commands.Execute("Redo", undefined);
        }
    });

    $("#drawingSurceContainer").contextmenu({
        delegate: ".bma-drawingsurface",
        autoFocus: true,
        preventContextMenuForPopup: true,
        preventSelect: true,
        //taphold: true,
        menu: [
            { title: "Cut", cmd: "Cut", uiIcon: "ui-icon-scissors" },
            { title: "Copy", cmd: "Copy", uiIcon: "ui-icon-copy" },
            { title: "Paste", cmd: "Paste", uiIcon: "ui-icon-document-b" },
            { title: "Edit", cmd: "Edit", uiIcon: "ui-icon-pencil" },
            { title: "Relationships", cmd: "Relationships", uiIcon: "ui-icon-transfer-e-w", children: [] },
            {
                title: "Size", cmd: "Size", children: [
                    { title: "1x1", cmd: "ResizeCellTo1x1" },
                    { title: "2x2", cmd: "ResizeCellTo2x2" },
                    { title: "3x3", cmd: "ResizeCellTo3x3" },
                ],
                uiIcon: "ui-icon-arrow-4-diag"
            },
            //{
            //    title: "Type", cmd: "Type", children: [
            //        { title: "Activator", cmd: "Activator" },
            //        { title: "Inhibitor", cmd: "Inhibitor" },
            //    ],
            //    uiIcon: "ui-icon-shuffle"
            //},
            { title: "Delete", cmd: "Delete", uiIcon: "ui-icon-trash" },
            {
                title: "Selection", cmd: "Selection", uiIcon: "ui-icon-clipboard", children: [
                    { title: "Clear", cmd: "ClearSelection" },
                    { title: "Create Motif", cmd: "CreateMotifFromSelection" },
                    //{
                    //    title: "Set Fill", cmd: "SetFillColor", children: [
                    //        { title: "Default", cmd: "SetColorDefault" },
                    //        { title: "Orange", cmd: "SetColorOrange" },
                    //        { title: "Purple", cmd: "SetColorPurple" },
                    //        { title: "Mint", cmd: "SetColorMint" },
                    //        { title: "Green", cmd: "SetColorGreen" },

                    //    ]
                    //}
                ]
            }
        ],
        beforeOpen: function (event, ui) {
            ui.menu.zIndex(InteractiveDataDisplay.ZIndexDOMMarkers + 11);
            var x = holdCords.holdX || event.pageX;
            var y = holdCords.holdX || event.pageY;
            var left = x - $(".bma-drawingsurface").offset().left;
            var top = y - $(".bma-drawingsurface").offset().top;

            window.Commands.Execute("DrawingSurfaceContextMenuOpening", {
                left: left,
                top: top
            });
        },
        select: function (event, ui) {
            var args: any = {};
            var commandName = "DrawingSurface";

            console.log(event.target);

            if (ui.cmd === "ResizeCellTo1x1") {
                args.size = 1;
                commandName += "ResizeCell";
            } else if (ui.cmd === "ResizeCellTo2x2") {
                args.size = 2;
                commandName += "ResizeCell";
            } else if (ui.cmd === "ResizeCellTo3x3") {
                args.size = 3;
                commandName += "ResizeCell";
            } else if (ui.cmd.startsWith("RelDelete")) {
                commandName += "RelDelete";
            } else if (ui.cmd.startsWith("Activator")) {
                args.reltype = "Activator";
                commandName += "ChangeType";
            } else if (ui.cmd.startsWith("Inhibitor")) {
                args.reltype = "Inhibitor";
                commandName += "ChangeType";
            }
            else {
                commandName += ui.cmd;
            }

            args.relationshipId = ui.item.data().relationshipId;
            args.id = ui.item.data().id;
            args.left = event.pageX - $(".bma-drawingsurface").offset().left;
            args.top = event.pageY - $(".bma-drawingsurface").offset().top;
            window.Commands.Execute(commandName, args);
        }, focus: function (event, ui) {
            var data = ui.item.data();
            if (data.relationshipId !== undefined) {
                window.Commands.Execute("DrawingSurfaceHighlightRelationship", { id: data.relationshipId });
            }
        }, close: function (event, ui) {
            window.Commands.Execute("DrawingSurfaceUnHighlightRelationships", undefined);
        }
    });


    var contextmenu = $('body').children('ul').filter('.ui-menu');
    contextmenu.addClass('command-list window canvas-contextual');
    contextmenu.children('li').children('ul').filter('.ui-menu').addClass('command-list');
    var aas = $('body').children('ul').children('li').children('a');
    aas.children('span').detach();
    var ulsizes: JQuery;
    aas.each(function () {
        switch ($(this).text()) {
            case "Cut": $(this)[0].innerHTML = '<img alt="" src="../images/icon-cut.svg"><span>Cut</span>';
                break;
            case "Copy": $(this)[0].innerHTML = '<img alt="" src="../images/icon-copy.svg"><span>Copy</span>';
                break;
            case "Paste": $(this)[0].innerHTML = '<img alt="" src="../images/icon-paste.svg"><span>Paste</span>';
                break;
            case "Edit": $(this)[0].innerHTML = '<img alt="" src="../images/icon-edit.svg"><span>Edit</span>';
                break;
            case "Size": $(this)[0].innerHTML = '<img alt="" src="../images/icon-size.svg"><span>Size  ></span>';
                ulsizes = $(this).next('ul');
                break;
            case "Delete": $(this)[0].innerHTML = '<img alt="" src="../images/icon-delete.svg"><span>Delete</span>';
                break;
        }
    })
    if (ulsizes !== undefined)
        ulsizes.addClass('context-menu-small');
    if (asizes !== undefined) {
        var asizes = ulsizes.children('li').children('a');
        asizes.each(function (ind) {
            $(this)[0].innerHTML = '<img alt="" src="../images/' + (ind + 1) + 'x' + (ind + 1) + '.svg">';
        });
    }


    $("#analytics").bmaaccordion({ position: "right", z_index: 4 });

    //Preparing elements panel
    var elementPanel = $("#modelelemtoolbar");
    //Creating color selector for defalt variable colors
    var colorSelector = $("#variableColorPickerContent").css("position", "absolute");
    colorSelector.hide();
    // If the document is clicked somewhere
    $(document).bind("mousedown", function (e) {
        // If the clicked element is not the menu
        if (!($(e.target).parents("#variableColorPickerContent").length > 0)) {
            // Hide it
            colorSelector.hide();
        }
    });

    colorSelector.on("mouseleave", function (e) { colorSelector.hide(); });

    var elements = window.ElementRegistry.Elements;

    var defaultColorContextElement = undefined;
    var subscribeToColorPickerContext = function (elem) {
        elem.on("mouseenter", function (e) {
            var pos = elem.offset();
            colorSelector.css("top", pos.top + label.outerHeight()).css("left", pos.left);
            defaultColorContextElement = elem;

            if (elementPanel.buttonset("option", "disabled") !== true) {
                colorSelector.children("ul").find(".color-box").removeClass("clicked");

                var type = elem.attr("data-type");
                var currentSelectedColor = window.DefaultProteinColors[type];

                colorSelector.children("ul").children("li").each(function (ind) {
                    var col = $(this).attr("data-color");
                    if (col === currentSelectedColor)
                        $(this).find(".color-box").addClass("clicked");
                });

                colorSelector.show();
            }
        });

        elem.on("mouseleave", function (e) {
            if (!colorSelector.is(":hover")) {
                colorSelector.hide();
            }
        });
    }

    colorSelector.children("ul").children("li").click(function (e) {
        colorSelector.children("ul").find(".color-box").removeClass("clicked");
        $(this).find(".color-box").addClass("clicked");
        var color = $(this).attr("data-color");
        if (defaultColorContextElement !== undefined) {
            //Changing default color of element
            var type = defaultColorContextElement.attr("data-type");
            window.DefaultProteinColors[type] = color;

            //Changing icon of element
            var elem = window.ElementRegistry.GetElementByType(type);
            var c = color === undefined ? undefined : BMA.SVGRendering.GetColorsForRendering(color, type).fill;
            var iconSvg = elem.GetIconSVG(c);
            if (iconSvg != undefined) {
                defaultColorContextElement.children().children().html(iconSvg);
                if (defaultColorContextElement.attr("aria-pressed") === "true") {
                    defaultColorContextElement.children().children().children().hide();
                }
            }
        }
    });

    var subscribeToToggle = function (elem) {
        const config = { attributes: true };

        // Callback function to execute when mutations are observed
        const callback = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                    var svg = elem.children().children().children();
                    if (elem.attr("aria-pressed") === "true") {
                        svg.hide();
                    } else {
                        svg.show();
                    }
                }
            }
        };
        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);
        // Start observing the target node for configured mutations
        observer.observe(elem[0], config);
    }

    for (var i = 0; i < elements.length; i++) {
        var elem = elements[i];
        var input = $("<input></input>")
            .attr("type", "radio")
            .attr("id", "btn-" + elem.Type)
            .attr("name", "drawing-button")
            .attr("data-type", elem.Type)
            .appendTo(elementPanel);

        var label = $("<label></label>").addClass("drawingsurface-droppable").attr("for", "btn-" + elem.Type).attr("data-type", elem.Type).appendTo(elementPanel);
        var img = $("<div></div>").css("display", "flex").css("justify-content", "center").css("align-items", "center").width(50).height(50).attr("title", elem.Description).appendTo(label);
        var iconSvg = elem.GetIconSVG(undefined);
        img.addClass(elem.IconClass);
        if (iconSvg != undefined) {
            img.html(iconSvg);
            subscribeToToggle(label);
        }
        if (elem.Type !== "Activator" && elem.Type !== "Inhibitor" && elem.Type !== "Container") {
            subscribeToColorPickerContext(label);
        }
    }

    var draggableElementPanelItems = elementPanel.children("input").not('[data-type="Activator"]').not('[data-type="Inhibitor"]').next();
    draggableElementPanelItems.draggable({

        helper: function (event, ui) {
            var classes = $(this).children().children().attr("class").split(" ");
            var svg = $(this).children().children().html();
            var helper = $('<div></div>').addClass(classes[0]).addClass("draggable-helper-element").appendTo('body');
            helper.html(svg);
            helper.children().show();
            return helper;
        },

        scroll: false,

        start: function (event, ui) {
            $(this).draggable("option", "cursorAt", {
                left: Math.floor(ui.helper.width() / 2),
                top: Math.floor(ui.helper.height() / 2)
            });
            $('#' + $(this).attr("for")).click();
        }
    });

    $("#viewswitchcontainer").viewswitchwidget();

    var syncTopPanelsWithModelVisibility = () => {
        if (!(<any>window).IsModelReadableOnScreen) {
            //switching to navigation mode
            $("#button-pointer").click();
            elementPanel.buttonset({ disabled: true });
            draggableElementPanelItems.draggable({ disabled: true });
        } else {
            elementPanel.buttonset({ disabled: false });
            draggableElementPanelItems.draggable({ disabled: false });
        }
    };

    window.Commands.On("ViewStateUpdated", (args) => {
        (<any>window).IsModelReadableOnScreen = args.isModelVisisble;

        if ((<any>window).CurrentViewSwitchMode === "Auto") {
            syncTopPanelsWithModelVisibility();
        }
    });

    window.Commands.On("ChangeViewMode", (args) => {
        (<any>window).CurrentViewSwitchMode = args;

        if (args === "Model") {
            elementPanel.buttonset({ disabled: false });
            draggableElementPanelItems.draggable({ disabled: false });
        } else if (args !== "Auto") {
            $("#button-pointer").click();
            elementPanel.buttonset({ disabled: true });
            draggableElementPanelItems.draggable({ disabled: true });
        } else
            syncTopPanelsWithModelVisibility();

        drawingSurface.drawingsurface("updateLayout");
    });

    $("#modelelemtoolbar input").click(function (event) {
        window.Commands.Execute("AddElementSelect", $(this).attr("data-type"));
    });

    elementPanel.buttonset();

    //undo/redo panel
    $("#button-pointer").click(function () {
        window.Commands.Execute("AddElementSelect", "navigation");
    });

    //adding listener to paste even to read data from clipboard
    $(document).bind("paste", (e) => {
        var data = (<any>e).clipboardData || (<any>window).clipboardData;
        if (data === undefined && e.originalEvent !== undefined) {
            data = (<any>e).originalEvent.clipboardData;
        }
        if (data !== undefined) {
            var contents = data.getData('text/plain');
            try {

                var position = {
                    screenX: e.pageX - $("#drawingSurceContainer").offset().left,
                    screenY: e.pageY - $("#drawingSurceContainer").offset().top
                };


                window.Commands.Execute("DrawingSurfacePasteFromClipboard", { contents: JSON.parse(contents) });
            }
            catch (exc) {
                console.log("error trying to read clipboard data: " + exc)
            }

        }
    });

    $("#navigationtoolbar").buttonset();

    $("#undoredotoolbar").buttonset();
    $("#button-undo").click(() => { window.Commands.Execute("Undo", undefined); });
    $("#button-redo").click(() => { window.Commands.Execute("Redo", undefined); });

    $(".navigationpanel-info").click(() => {
        var win = window.open("index.html?Section=About", '_blank');
        win.focus();
    });

    $(document).keydown(function (evt) {
        if (evt.ctrlKey === true) {
            if (evt.keyCode === 90) {
                /* Ctrl+Z is pressed */
                window.Commands.Execute("Undo", undefined);
            } else if (evt.keyCode === 89) {
                /* Ctrl+Y is pressed */
                window.Commands.Execute("Redo", undefined);
            }
        }
    });

    //disabling default context menu from browser
    $("#btn-onedrive-switcher").contextmenu(function () {
        return false;
    });

    $("#btn-onedrive-switcher").mousedown(function (args) {
        if (args.button === 2) {
            window.Commands.Execute("TurnRepository", { toggleFunc: () => { $("#signin :button").click(); } });
        } else {
            window.Commands.Execute("SwitchRepository", { toggleFunc: () => { $("#signin :button").click(); } });
        }
        //window.Commands.Execute("SwitchOneDrive", undefined);
    });


    $(".onedrive-refresh-btn").mousedown(function (args) {
        args.stopPropagation();
        window.Commands.Execute("RequestOneDriveModelListUpdate", undefined);
    });

    $("#btn-local-save").click(function (args) {
        $("#btn-save-anim").show();
        window.Commands.Execute("SaveModel", undefined);

        setTimeout(function () { $("#btn-save-anim").hide(); }, 2000);
    });
    $("#btn-new-model").click(function (args) {
        window.Commands.Execute("NewModel", undefined);
    });
    $("#btn-local-storage").click(function (args) {
        window.Commands.Execute("ModelStorageRequested", undefined);
    });


    //Creating model storage widgets
    var localStorageWidget = $('<div></div>')
        //.appendTo('#drawingSurceContainer')
        .localstoragewidget();
    var oneDriveStorageWidget = $("<div></div>")
        /*.appendTo('#drawingSurceContainer')*/.onedrivestoragewidget();
    var modelStorageWidget = $('#modelrepositorycontent')//$('<div></div>').addClass('window').appendTo('#drawingSurceContainer')
        .modelstoragewidget({
            localStorageWidget: localStorageWidget,
            oneDriveWidget: oneDriveStorageWidget
        });

    //Adding droppable 
    var modelDropContainer = $("#drawingSurceContainer");
    modelDropContainer.droppable({
        greedy: true,
        scope: "ml-card",
        drop: function (event, ui) {
            var e = <MouseEvent>event;
            var cursor = { x: e.pageX, y: e.pageY };
            var position = {
                screenX: e.pageX - modelDropContainer.offset().left,
                screenY: e.pageY - modelDropContainer.offset().top,
            };


            var ms = modelStorageWidget.modelstoragewidget("GetPreviewModel");
            if (ms !== undefined) {
                window.Commands.Execute("ModelDropped", {
                    position: position, modelSource: { model: ms.Model, layout: ms.Layout }
                });
            }
        }
    });

    $("#editor").bmaeditor();

    $("#Proof-Analysis").proofresultviewer();
    $("#Further-Testing").furthertesting();
    $("#tabs-2").simulationviewer();
    $('#tabs-3').ltlviewer();
    var popup = $('<div></div>')
        .addClass('popup-window window')
        .appendTo('body')
        .hide()
        .resultswindowviewer({ icon: "min" });
    popup.draggable({ handle: ".analysis-title", scroll: false });

    var expandedSimulation = $('<div></div>').simulationexpanded();

    //Setting color picker for selected variables
    $("#colorPickerButton").hoverpopup();
    var cpcnt = $("#colorPickerContent");
    cpcnt.children("ul").children("li").click(function (e) {
        cpcnt.children("ul").find(".color-box").removeClass("clicked");
        $(this).find(".color-box").addClass("clicked");
        var command = $(this).attr("data-command");
        window.Commands.Execute(command, undefined);
    });

    /*
    //Loading motif library
    $("#motifLibrary").motiflibrary({ container: $("#drawingSurceContainer")[0], changePreloadedVisibility: () => { motifLibrary.HidePreloadedMotifs(); }, deleteMotif: (i) => { motifLibrary.DeleteMotifByIndex(i); } });
    window.Commands.On("PreloadedMotifsReady", (args) => {
        $("#motifLibrary").motiflibrary("option", "motifs", motifLibrary.Motifs);
    });
    window.Commands.On("RefreshMotifs", (args) => {
        $("#motifLibrary").motiflibrary("option", "motifs", motifLibrary.Motifs);
    });
    window.Commands.On("ProcessPreloadedMotifsHide", (args) => {
        $("#visibilityOptionsContent").visibilitysettings({ "settingsState": { name: "Hide Default Motifs", toggle: true } });
    });

    var checkInside = (cursor, target) => {
        var pos = target.offset();
        var w = target.outerWidth(true);
        var h = target.outerHeight(true);
        return cursor.x >= pos.left && cursor.x <= pos.left + w && cursor.y >= pos.top && cursor.y <= pos.top + h
    };

    window.Commands.On("CreateMotifFromJSON", (args) => {
        motifLibrary.AddMotif(args.source);
    });

    window.Commands.On("Commands.TogglePreloadedMotifs", function (param) {
        if (motifLibrary.IsPreloadedVisible)
            motifLibrary.HidePreloadedMotifs();
        else
            motifLibrary.ShowPreloadedMotifs();
    });

    //Adding droppable 
    var motifDropConteiner = $("#drawingSurceContainer");
    motifDropConteiner.droppable({
        greedy: true,
        scope: "ml-card",
        drop: function (event, ui) {
            var e = <MouseEvent>event;
            var cursor = { x: e.pageX, y: e.pageY };
            if (!checkInside(cursor, $(".ml-container")) && !checkInside(cursor, $(".ml-open"))) {

                var position = {
                    screenX: e.pageX - motifDropConteiner.offset().left,
                    screenY: e.pageY - motifDropConteiner.offset().top,
                    motifID: parseInt(ui.draggable.attr("data-motifid"))
                };

                window.Commands.Execute("MotifDropped", position);
            }
        }
    });

    //Start loading preloaded motifs
    motifLibrary.StartLoadMotifs();
    */

    //Visual Settings Presenter
    var visualSettings = new BMA.Model.AppVisualSettings();
    (<any>window).VisualSettings = visualSettings;

    //window.Commands.On("Commands.ToggleOldColorScheme", (args) => {
    //    (<any>window).VisualSettings.IsOldColorSchemeEnabled = !(<any>window).VisualSettings.IsOldColorSchemeEnabled;
    //    if ((<any>window).VisualSettings.IsOldColorSchemeEnabled) {
    //        $(".cell-icon").removeClass("cell-icon").addClass("cell-icon-old");
    //        $(".constant-icon").removeClass("constant-icon").addClass("constant-icon-old");
    //        $(".variable-icon").removeClass("variable-icon").addClass("variable-icon-old");
    //        $(".receptor-icon").removeClass("receptor-icon").addClass("receptor-icon-old");
    //    } else {
    //        $(".cell-icon-old").removeClass("cell-icon-old").addClass("cell-icon");
    //        $(".constant-icon-old").removeClass("constant-icon-old").addClass("constant-icon");
    //        $(".variable-icon-old").removeClass("variable-icon-old").addClass("variable-icon");
    //        $(".receptor-icon-old").removeClass("receptor-icon-old").addClass("receptor-icon");
    //    }
    //    window.Commands.Execute("DrawingSurfaceRefreshOutput", {});
    //});

    window.Commands.On("OneDriveLoggedIn", () => {
        $("#btn-onedrive-switcher").addClass("logged-in").removeClass("turned-off");
        $(".onedrive-refresh-btn").addClass("logged-in").removeClass("turned-off");

        $("#btn-export-models-zip").addClass("inactive");
    });

    window.Commands.On("OneDriveLoggedOut", () => {
        $("#btn-onedrive-switcher").removeClass("logged-in").removeClass("turned-off");
        $(".onedrive-refresh-btn").removeClass("logged-in").removeClass("turned-off");

        $("#btn-export-models-zip").removeClass("inactive");
    });

    window.Commands.On("OneDriveTurnedOff", () => {
        $("#btn-onedrive-switcher").removeClass("logged-in").addClass("turned-off");
        $(".onedrive-refresh-btn").removeClass("logged-in").addClass("turned-off");

        $("#btn-export-models-zip").removeClass("inactive");
    });

    window.Commands.On("Commands.ToggleLabels", function (param) {
        visualSettings.TextLabelVisibility = param;
        window.ElementRegistry.LabelVisibility = param;
        window.Commands.Execute("DrawingSurfaceRefreshOutput", {});
    });

    window.Commands.On("Commands.LabelsSize", function (param) {
        visualSettings.TextLabelSize = param;
        window.ElementRegistry.LabelSize = param;
        window.Commands.Execute("DrawingSurfaceRefreshOutput", {});
    });

    //window.Commands.On("Commands.ToggleIcons", function (param) {
    //    visualSettings.IconsVisibility = param;
    //});

    //window.Commands.On("Commands.IconsSize", function (param) {
    //    visualSettings.IconsSize = param;
    //});


    window.Commands.On("Commands.LineWidth", function (param) {
        visualSettings.LineWidth = param;
        window.ElementRegistry.LineWidth = param;
        window.Commands.Execute("DrawingSurfaceRefreshOutput", {});
    });

    window.Commands.On("Commands.ToggleGrid", function (param) {
        visualSettings.GridVisibility = param;
        svgPlotDriver.SetGridVisibility(param);
    });

    window.Commands.On("Commands.ToggleCurvedRelationships", function (param) {
        visualSettings.ForceCurvedRelationships = param;
        window.Commands.Execute("DrawingSurfaceRefreshOutput", {});
    });

    window.Commands.On("ZoomSliderBind", (value) => {
        $("#zoomslider").bmazoomslider("setValueSilently", value);
    });

    //window.Commands.On('ZoomConfigure',(value: { min; max }) => {
    //    $("#zoomslider").bmazoomslider({ min: value.min, max: value.max });
    //});

    window.Commands.On('SetPlotSettings', (value) => {

        /*
        if (value.MaxWidth !== undefined) {
            window.PlotSettings.MaxWidth = value.MaxWidth;
            $("#zoomslider").bmazoomslider({ max: (value.MaxWidth - window.PlotSettings.MinWidth) / 24 });
        }
        if (value.MinWidth !== undefined) {
            window.PlotSettings.MinWidth = value.MinWidth;
        }
        */
    });

    window.Commands.On("AppModelChanged", () => {
        if (changesCheckerTool.IsChanged) {
            popupDriver.Hide();
            accordionHider.Hide();
            window.Commands.Execute("Expand", '');
        }

        var grid = {
            x0: window.GridSettings.xOrigin,
            y0: window.GridSettings.yOrigin,
            xStep: window.GridSettings.xStep,
            yStep: window.GridSettings.yStep
        };
        var gridCells = BMA.ModelHelper.GetModelGridCells(appModel.BioModel, appModel.Layout, grid);
        if (gridCells.length == 0) {
            $("#viewswitchcontainer").viewswitchwidget("SetViewMode", "Model");
            $("#zoomslider").bmazoomslider({ searchTags: [] });
        }
    });

    window.Commands.On("DrawingSurfaceVariableEditorOpened", () => {
        popupDriver.Collapse();
        accordionHider.Hide();
    });


    //Loading Drivers
    var svgPlotDriver = new BMA.UIDrivers.SVGPlotDriver(drawingSurface);
    var undoDriver = new BMA.UIDrivers.TurnableButtonDriver($("#button-undo"));
    var redoDriver = new BMA.UIDrivers.TurnableButtonDriver($("#button-redo"));
    var variableEditorDriver = new BMA.UIDrivers.VariableEditorDriver($("#editor"));
    var containerEditorDriver = new BMA.UIDrivers.ContainerEditorDriver($("#containerEditor"));
    var proofViewer = new BMA.UIDrivers.ProofViewer($("#analytics"), $("#Proof-Analysis"));
    var furtherTestingDriver = new BMA.UIDrivers.FurtherTestingDriver($("#Further-Testing"), undefined);
    var simulationViewer = new BMA.UIDrivers.SimulationViewerDriver($("#tabs-2"));
    var fullSimulationViewer = new BMA.UIDrivers.SimulationExpandedDriver(expandedSimulation);
    var popupDriver = new BMA.UIDrivers.PopupDriver(popup);
    var fileLoaderDriver = new BMA.UIDrivers.ModelFileLoader($("#fileLoader"));
    var contextMenuDriver = new BMA.UIDrivers.ContextMenuDriver($("#drawingSurceContainer"));
    var accordionHider = new BMA.UIDrivers.AccordionHider($("#analytics"));
    var localStorageDriver = new BMA.UIDrivers.LocalStorageDriver(localStorageWidget);
    var oneDriveStorageDriver = new BMA.UIDrivers.OneDriveStorageDriver(oneDriveStorageWidget);
    var modelStorageDriver = new BMA.UIDrivers.ModelStorageDriver(modelStorageWidget, localStorageDriver, oneDriveStorageDriver);
    //var ajaxServiceDriver = new BMA.UIDrivers.AjaxServiceDriver();
    var messagebox = new BMA.UIDrivers.MessageBoxDriver();
    //var keyframecompactDriver = new BMA.UIDrivers.KeyframesList($('#tabs-3').find('.keyframe-compact'));
    var ltlDriver = new BMA.UIDrivers.LTLViewer($("#analytics"), $('#tabs-3'));
    var localRepositoryTool = new BMA.LocalRepositoryTool(messagebox);

    //Export and Import buttons
    $("#btn-export-model").click(function (args) {
        variableEditorDriver.Hide();
        window.Commands.Execute("ExportModel", undefined);
    });

    $("#btn-import-model").click(function (args) {
        variableEditorDriver.Hide();
        window.Commands.Execute("ImportModel", undefined);
    });

    $("#btn-export-models-zip").click(function (args) {
        variableEditorDriver.Hide();
        window.Commands.Execute("ExportModelsZip", undefined);
    });

    //var localSettings = new BMA.OneDrive.OneDriveSettings("79832916-6a39-4c73-b13e-ee28c25d46a7", "http://localhost:81/html/callback.html", "signin");
    //var bmaNewSettings = new BMA.OneDrive.OneDriveSettings("000000004C12BD9C", "http://bmanew.cloudapp.net/html/callback.html", "signin");
    //var productionSettings = new BMA.OneDrive.OneDriveSettings("c18205a1-8587-4a03-9274-85845cbbcbb0", "http://biomodelanalyzer.research.microsoft.com/html/callback.html", "signin");

    var oneDriveSettings = new BMA.OneDrive.OneDriveSettings(version.onedriveappid, version.onedriveredirecturl, "signin");

    var connector = new BMA.OneDrive.OneDriveConnector(oneDriveSettings);

    var oneDriveRepositoryTool = new BMA.LocalRepositoryTool(messagebox);//new BMA.OneDrive.OneDriveRepository;
    var changesCheckerTool = new BMA.ChangesChecker();
    changesCheckerTool.Snapshot(appModel);

    //LTL Drivers
    var tpeditordriver = new BMA.UIDrivers.TemporalPropertiesEditorDriver(ltlCommands, popup);
    var stateseditordriver = new BMA.UIDrivers.StatesEditorDriver(ltlCommands, popup);
    var ltlresultsdriver = new BMA.UIDrivers.LTLResultsViewer(ltlCommands, popup);

    //Creating Session log
    var logService = new BMA.SessionLog();

    //Loaing ServiсeDrivers 
    var exportService = new BMA.UIDrivers.ExportService();
    var furtherTestingServiсe = new BMA.UIDrivers.BMAProcessingService(window.BMAServiceURL + "/api/FurtherTesting");
    var proofAnalyzeService = new BMA.UIDrivers.BMAProcessingService(window.BMAServiceURL + "/api/Analyze");
    var simulationService = new BMA.UIDrivers.BMAProcessingService(window.BMAServiceURL + "/api/Simulate");
    var ltlSimulationService = new BMA.UIDrivers.LTLAnalyzeService(window.BMAServiceURL + "/api/AnalyzeLTLSimulation", 1);
    var ltlPolarityService = new BMA.UIDrivers.LTLAnalyzeService(window.BMAServiceURL + "/api/AnalyzeLTLPolarity", 1);
    var lratestservice = new BMA.UIDrivers.BMALRAProcessingService(window.BMAServiceURL + "/api/lra/", logService.UserID);

    var waitScreen = new BMA.UIDrivers.LoadingWaitScreen($('.page-loading'));
    var dragndropextender = new BMA.UIDrivers.DrawingSurfaceDragnDropExtender(drawingSurface, [popup]);

    //Loading presenters
    var undoRedoPresenter = new BMA.Presenters.UndoRedoPresenter(appModel, undoDriver, redoDriver);
    var drawingSurfacePresenter = new BMA.Presenters.DesignSurfacePresenter(appModel, undoRedoPresenter, svgPlotDriver, svgPlotDriver, svgPlotDriver, variableEditorDriver, containerEditorDriver, contextMenuDriver, exportService, dragndropextender, messagebox);
    var proofPresenter = new BMA.Presenters.ProofPresenter(appModel, proofViewer, popupDriver, proofAnalyzeService, messagebox, logService);
    var furtherTestingPresenter = new BMA.Presenters.FurtherTestingPresenter(appModel, furtherTestingDriver, popupDriver, furtherTestingServiсe, messagebox, logService);
    var simulationPresenter = new BMA.Presenters.SimulationPresenter(appModel, accordionHider, fullSimulationViewer, simulationViewer, popupDriver, simulationService, logService, exportService, messagebox);
    var storagePresenter = new BMA.Presenters.ModelStoragePresenter(appModel, fileLoaderDriver, changesCheckerTool, logService, exportService, waitScreen, messagebox);
    //var localStoragePresenter = new BMA.Presenters.LocalStoragePresenter(appModel, localStorageDriver, localRepositoryTool, messagebox, changesCheckerTool, logService, waitScreen);
    //var oneDriveStoragePresenter = new BMA.Presenters.OneDriveStoragePresenter(appModel, oneDriveStorageDriver, oneDriveRepositoryTool, messagebox, changesCheckerTool, logService, waitScreen);
    var mStoragePresenter = new BMA.Presenters.StoragePresenter(appModel, modelStorageDriver, variableEditorDriver, localStorageDriver, oneDriveStorageDriver, connector, localRepositoryTool, messagebox, changesCheckerTool, logService, waitScreen);
    //LTL Presenters
    var ltlPresenter = new BMA.Presenters.LTLPresenter(ltlCommands, appModel, stateseditordriver, tpeditordriver, ltlDriver, ltlresultsdriver, ltlSimulationService, ltlPolarityService, lratestservice, popupDriver, exportService, fileLoaderDriver, logService);

    window.Commands.On("CloseRepository", () => {
        if ($("#modelToolbarContent").is(":visible")) {
            $("#modelToolbarContent").hide();
            $(".expand-btn").css("transform", "scaleX(1)");
        }
    });

    //Loading model from URL
    var reserved_key = "InitialModel";

    var params = getSearchParameters();
    if (params.Model !== undefined) {

        var s = params.Model.split('.');
        if (s.length > 1 && s[s.length - 1] == "json") {
            $.ajax(params.Model, {
                dataType: "text",
                success: function (fileContent) {
                    appModel.Deserialize(fileContent);
                    //appModel._Reset(fileContent);
                }
            })
        }
        else {
            $.get(params.Model, function (fileContent) {
                try {
                    var model = BMA.ParseXmlModel(fileContent, window.GridSettings);
                    appModel.Reset(model.Model, model.Layout);
                }
                catch (exc) {
                    console.log(exc);
                    appModel.Deserialize(fileContent);
                }
            });
        }
    }
    else {
        window.Commands.Execute("LocalStorageInitModel", reserved_key);
    }

    var lastversion = window.localStorage.getItem(version_key);
    if (lastversion !== JSON.stringify(version)) {
        var userDialog = $('<div></div>').appendTo('body').userdialog({
            message: "BMA client was updated to version " + versionText + '<br/><a href="ReleaseNotes.html" target="_blank">Whats new in BMA</a>',
            actions: [
                {
                    button: 'Ok',
                    callback: function () { userDialog.detach(); }
                }
            ]
        });
    }

    var zoomLockState = undefined;
    window.Commands.On("DrawingSurfaceRefreshOutput", (args) => {
        $("#zoomslider").bmazoomslider({ searchTags: BMA.ModelHelper.GetModelNamesWithinContainers(appModel.BioModel, appModel.Layout) }); 

        var grid = {
            x0: window.GridSettings.xOrigin,
            y0: window.GridSettings.yOrigin,
            xStep: window.GridSettings.xStep,
            yStep: window.GridSettings.yStep
        };
        var gridCells = BMA.ModelHelper.GetModelGridCells(appModel.BioModel, appModel.Layout, grid);
        if (gridCells.length < 10) {
            if (window.CurrentViewSwitchMode === "Auto" && (!zoomLockState || zoomLockState === "Auto")) {
                if (gridCells.length > 0) {
                    var userDialog = $('<div></div>').appendTo('body').userdialog({
                        message: "<b>Intelligent zoom disabled</b><br/><br/>The current model is smaller than 10 cells in size and automatic view switching has been deactivated. To change view manually, go to the ‘Settings’ menu.",
                        actions: [
                            {
                                button: 'Ok',
                                callback: function () {
                                    userDialog.detach();
                                    $("#viewswitchcontainer").viewswitchwidget("SetViewMode", "Model");
                                    zoomLockState = "Model";
                                }
                            }
                        ]
                    });
                }
            }
        } else {
            if (window.CurrentViewSwitchMode === "Model" && (!zoomLockState || zoomLockState === "Model")) {
                var userDialog = $('<div></div>').appendTo('body').userdialog({
                    message: "<b>Intelligent zoom enabled</b><br/><br/>The current model exceeds 10 cells in size and automatic view switching has been activated. Zoom in/out to change views, or change view manually in ‘Settings’",
                    actions: [
                        {
                            button: 'Ok',
                            callback: function () {
                                userDialog.detach();
                                $("#viewswitchcontainer").viewswitchwidget("SetViewMode", "Auto");
                                zoomLockState = "Auto";
                            }
                        }
                    ]
                });
            }
        }
    });

    window.onbeforeunload = function () {
        window.localStorage.setItem(version_key, JSON.stringify(version));

        try {
            var serialized = appModel.Serialize();
            window.localStorage.setItem(reserved_key, serialized);
        }
        catch (exc) {
            console.log("error trying to save current model to local storage: " + exc);
        }

        var log = logService.CloseSession();
        var data = JSON.stringify({
            SessionID: log.SessionID,
            UserID: log.UserID,
            LogInTime: log.LogIn,
            LogOutTime: log.LogOut,
            FurtherTestingCount: log.FurtherTesting,
            ImportModelCount: log.ImportModel,
            RunSimulationCount: log.Simulation,
            NewModelCount: log.NewModel,
            RunProofCount: log.Proof,
            SaveModelCount: log.SaveModel,
            ProofErrorCount: log.ProofErrorCount,
            SimulationErrorCount: log.SimulationErrorCount,
            FurtherTestingErrorCount: log.FurtherTestingErrorCount,
            AnalyzeLTLCount: log.LTLRequestCount,
            AnalyzeLTLErrorCount: log.LTLErrors,
            ClientVersion: "BMA HTML5 " + version.major + '.' + version.minor + '.' + version.build
        });

        navigator.sendBeacon(window.BMAServiceURL + '/api/ActivityLog', data);
    };

    $("label[for='button-pointer']").click();

}
