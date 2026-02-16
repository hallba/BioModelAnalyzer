// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
module BMA {
    export module Presenters {
        export class FurtherTestingPresenter {

            private driver: BMA.UIDrivers.IFurtherTesting;
            private popupViewer: BMA.UIDrivers.IPopup;
            private ajax: BMA.UIDrivers.IServiceDriver;
            private messagebox: BMA.UIDrivers.IMessageServiсe;
            private appModel: BMA.Model.AppModel;
            private data;
            private model;
            private result;
            private variables;

            constructor(
                appModel: BMA.Model.AppModel,
                driver: BMA.UIDrivers.IFurtherTesting,
                popupViewer: BMA.UIDrivers.IPopup,
                ajax: BMA.UIDrivers.IServiceDriver,
                messagebox: BMA.UIDrivers.IMessageServiсe,
                logService: BMA.ISessionLog
            ) {
                var that = this;
                this.appModel = appModel;
                this.driver = driver;
                this.popupViewer = popupViewer;
                this.ajax = ajax;
                this.messagebox = messagebox;


                window.Commands.On("InitFurtherTesting", function (param: { Model; Variables; Res }) {
                    if (param !== undefined) {
                        that.driver.ShowStartFurtherTestingToggler();
                        that.model = param.Model;
                        that.result = param.Res;
                        that.variables = param.Variables;
                    }
                    else {
                        that.data = undefined;
                    }
                })

                function OnProofStarting() {
                    that.driver.ActiveMode();
                    that.driver.HideStartFurtherTestingToggler();
                    that.driver.HideResults();
                    that.data = undefined;
                }

                window.Commands.On("ProofStarting", function () {
                    OnProofStarting();
                });

                var ftErrorMessage =
                    'Further testing inconclusive. <br/><br/> This could be caused by<br/> * complex target functions<br/> * errors in the model not caught by the UI<br/> * bugs in the underlying tools<br/><br/>Please study your model for errors and <a class="window-title" target="_blank" href="https://github.com/Microsoft/BioModelAnalyzer/issues">report</a>this issue to the developers with your model';

                window.Commands.On("FurtherTestingRequested", function () {
                    if (that.result.length !== 0 && that.model !== undefined && that.result !== undefined && that.variables !== undefined) {
                        that.driver.StandbyMode();
                        logService.LogFurtherTestingRun();
                        var result = that.ajax.Invoke({
                            Model: that.model,
                            Analysis: that.result,
                        })
                            .done(function (res2) {
                                that.driver.ActiveMode();
                                if (res2.CounterExamples !== null && res2.CounterExamples.length > 0) {
                                    that.driver.HideStartFurtherTestingToggler();
                                    var bif = null, osc = null, fix = null;
                                    for (var i = 0; i < res2.CounterExamples.length; i++) {
                                        switch (res2.CounterExamples[i].Status) {
                                            case "Bifurcation":
                                                bif = res2.CounterExamples[i];
                                                break;
                                            case "Cycle":
                                                osc = res2.CounterExamples[i];
                                                break;
                                            case "Fixpoint":
                                                fix = res2.CounterExamples[i];
                                                break;
                                        }
                                    }

                                    var data = [];
                                    var headers = [];
                                    var tabLabels = [];

                                    if (bif !== null) {
                                        var parseBifurcations = that.ParseBifurcations(bif.Variables);
                                        var bifurcationsView = that.CreateBifurcationsView(that.variables, parseBifurcations);
                                        data.push(bifurcationsView);
                                        headers.push(["Cell", "Name", "Calculated Bound", "Fix1", "Fix2"]);
                                        var label = $('<div></div>').addClass('further-testing-tab');
                                        var icon = $('<div></div>').addClass('bifurcations-icon').appendTo(label);
                                        var text = $('<div></div>').text('Bifurcations').appendTo(label);

                                        tabLabels.push(label);
                                    }
                                    if (osc !== null) {
                                        var parseOscillations = that.ParseOscillations(osc.Variables);
                                        var oscillationsView = that.CreateOscillationsView(that.variables, parseOscillations);
                                        data.push(oscillationsView);
                                        headers.push(["Cell", "Name", "Calculated Bound", "Oscillation"]);
                                        var label = $('<div></div>').addClass('further-testing-tab');
                                        var icon = $('<div></div>').addClass('oscillations-icon').appendTo(label);
                                        var text = $('<div></div>').text('Oscillations').appendTo(label);
                                        tabLabels.push(label);
                                    }

                                    if (fix !== null && bif === null && osc === null) {

                                        try {
                                            var parseFix = that.ParseFixPoint(fix.Variables);
                                            window.Commands.Execute("ProofByFurtherTesting", {
                                                issucceeded: true,
                                                message: 'Further testing has been determined the model to be stable with the following stable state',
                                                fixPoint: parseFix
                                            });
                                            OnProofStarting();
                                        }
                                        catch (ex) {
                                            that.messagebox.Show(ftErrorMessage + ":" + ex);
                                            that.driver.ShowStartFurtherTestingToggler();
                                        };
                                    }
                                    else {

                                        that.data = { tabLabels: tabLabels, tableHeaders: headers, data: data };
                                        that.driver.ShowResults(that.data);
                                    }
                                }
                                else {
                                    logService.LogFurtherTestingError();
                                    that.driver.ActiveMode();
                                    if (res2.Error !== null && res2.Error !== undefined) {
                                        that.messagebox.Show(ftErrorMessage + "and the accompanying error: <br/>" + "<div style='-webkit-user-select: text;user-select:text;-ms-user-select: text;-moz-user-select: text;' class='ud-text'>" + res2.Error + "</div>");
                                    } else {
                                        that.messagebox.Show(ftErrorMessage);
                                    }
                                }
                            })
                            .fail(function (XMLHttpRequest, textStatus, errorThrown) {
                                that.driver.ActiveMode();
                                that.messagebox.Show("FurtherTesting error: Invalid service response");
                            });

                    }
                    else that.messagebox.Show("No Variables");
                })

                window.Commands.On("Expand", (param) => {
                    switch (param) {
                        case "FurtherTesting":
                            that.driver.HideStartFurtherTestingToggler();
                            that.driver.HideResults();
                            var content = $('<div></div>').furthertesting();
                            content.furthertesting("SetData", that.data);
                            var full = content.children().eq(1).children().eq(1);
                            this.popupViewer.Show({ tab: param, content: full });
                            break;
                        default:
                            that.driver.ShowResults(that.data);
                            break;
                    }
                })

                window.Commands.On("Collapse", (param) => {
                    switch (param) {
                        case "FurtherTesting":
                            that.driver.ShowResults(that.data);
                            this.popupViewer.Hide();
                            break;
                    }
                })
            }

            private ParseOscillations(variables) {
                var table = [];

                for (var j = 0; j < variables.length; j++) {
                    var parse = this.ParseId(variables[j].Id);
                    var varId = parseInt(parse[0]);

                    if (table[varId] === undefined)
                        table[varId] = [];

                    // If parse[1] exists, it's a time-series format (e.g., "5^0", "5^1")
                    // If parse[1] is undefined, it's a simple ID (e.g., "5") with a single value
                    if (parse[1] !== undefined) {
                        var timeIndex = parseInt(parse[1]);
                        table[varId][timeIndex] = variables[j].Value;
                    } else {
                        // Simple ID format - just store the value directly
                        table[varId][0] = variables[j].Value;
                    }
                }

                console.log("ParseOscillations - intermediate table:", table);

                var result = [];
                for (var i = 0; i < table.length; i++) {
                    if (table[i] !== undefined) {
                        result[i] = { min: table[i][0], max: table[i][0], oscillations: "" };
                        for (var j = 0; j < table[i].length - 1; j++) {
                            if (table[i][j] < result[i].min) result[i].min = table[i][j];
                            if (table[i][j] > result[i].max) result[i].max = table[i][j];
                            result[i].oscillations += table[i][j] + ",";
                        }
                        result[i].oscillations += table[i][table[i].length - 1];
                    }
                }

                console.log("ParseOscillations - final result:", result);
                return result;
            }

            private ParseBifurcations(variables) {
                var table = [];

                for (var j = 0; j < variables.length; j++) {
                    var parse = this.ParseId(variables[j].Id);
                    var varId = parseInt(parse[0]);

                    if (table[varId] === undefined)
                        table[varId] = [];

                    // Store Fix1 and Fix2 values
                    table[varId][0] = parseInt(variables[j].Fix1);
                    table[varId][1] = parseInt(variables[j].Fix2);
                }

                console.log("ParseBifurcations - intermediate table:", table);

                var result = [];
                for (var i = 0; i < table.length; i++) {
                    if (table[i] !== undefined) {
                        result[i] = {
                            min: Math.min(table[i][0], table[i][1]),
                            max: Math.max(table[i][0], table[i][1]),
                            Fix1: table[i][0],
                            Fix2: table[i][1]
                        };
                    }
                }

                console.log("ParseBifurcations - final result:", result);
                return result;
            }

            public CreateOscillationsView(variables, results) {
                var that = this;
                var table = [];
                var rowIndex = 0;

                // Debug logging
                console.log("CreateOscillationsView - variables:", variables);
                console.log("CreateOscillationsView - results:", results);
                console.log("CreateOscillationsView - results is array:", Array.isArray(results));

                for (var i = 0; i < variables.length; i++) {
                    // Try multiple ways to find the result
                    var resid = results[variables[i].Id] || results[i];

                    // Additional debug for first iteration
                    if (i === 0) {
                        console.log("First variable ID:", variables[i].Id);
                        console.log("Lookup by ID:", results[variables[i].Id]);
                        console.log("Lookup by index:", results[i]);
                        console.log("Result keys:", Object.keys(results));
                    }

                    if (resid === undefined) {
                        console.warn("No results for variable", variables[i].Name, "ID:", variables[i].Id);
                        continue; // Skip if no results for this variable
                    }

                    table[rowIndex] = [];
                    table[rowIndex][0] = (function () {
                        var cont = that.appModel.Layout.GetContainerById(variables[i].ContainerId);
                        return cont !== undefined ? cont.Name : '';
                    })();
                    table[rowIndex][1] = variables[i].Name;
                    table[rowIndex][2] = resid.min + '-' + resid.max;
                    table[rowIndex][3] = resid.oscillations;
                    rowIndex++;
                }

                console.log("CreateOscillationsView - final table:", table);
                return table;
            }

            private CreateBifurcationsView(variables, results) {
                var that = this;
                var table = [];
                var rowIndex = 0;

                // Debug logging
                console.log("CreateBifurcationsView - variables:", variables);
                console.log("CreateBifurcationsView - results:", results);

                for (var i = 0; i < variables.length; i++) {
                    // Try multiple ways to find the result
                    var resid = results[variables[i].Id] || results[i];

                    if (resid === undefined) {
                        console.warn("No results for variable", variables[i].Name, "ID:", variables[i].Id);
                        continue; // Skip if no results for this variable
                    }

                    table[rowIndex] = [];
                    table[rowIndex][0] = (function () {
                        var cont = that.appModel.Layout.GetContainerById(variables[i].ContainerId);
                        return cont !== undefined ? cont.Name : '';
                    })();
                    table[rowIndex][1] = variables[i].Name;
                    if (resid.min !== resid.max)
                        table[rowIndex][2] = resid.min + '-' + resid.max;
                    else
                        table[rowIndex][2] = resid.min;
                    table[rowIndex][3] = resid.Fix1;
                    table[rowIndex][4] = resid.Fix2;
                    rowIndex++;
                }

                console.log("CreateBifurcationsView - final table:", table);
                return table;

            }

            private ParseFixPoint(variables) {
                var fixPoints = [];
                var that = this;
                variables.forEach((val, ind) => {
                    fixPoints.push({
                        "Id": that.ParseId(val.Id)[0],
                        "Value": val.Value
                    })
                })
                return fixPoints;
            }

            private ParseId(id) {
                var parse = String(id).split('^');
                return parse;
            }
        }
    }
}
