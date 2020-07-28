// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
module BMA {
    declare var JSZip: any;
    declare var saveAs: any;

    export module Presenters {
        export class LocalStoragePresenter {
            private appModel: BMA.Model.AppModel;
            private driver: BMA.UIDrivers.ILocalStorageDriver;
            private tool: BMA.UIDrivers.IModelRepository;
            private messagebox: BMA.UIDrivers.IMessageServiсe;
            private checker: BMA.UIDrivers.ICheckChanges;
            private waitScreen: BMA.UIDrivers.IWaitScreen;
            private setOnCopy: Function;
            private setOnActive: Function;
            private setOnIsActive: Function;
            private setRequestLoad: Function;

            constructor(
                appModel: BMA.Model.AppModel,
                editor: BMA.UIDrivers.ILocalStorageDriver,
                tool: BMA.UIDrivers.IModelRepository,
                messagebox: BMA.UIDrivers.IMessageServiсe,
                checker: BMA.UIDrivers.ICheckChanges,
                logService: BMA.ISessionLog,
                waitScreen: BMA.UIDrivers.IWaitScreen
                ) {
                var that = this;
                this.appModel = appModel;
                this.driver = editor;
                this.tool = tool; 
                this.messagebox = messagebox;
                this.checker = checker;
                this.waitScreen = waitScreen;

                that.GetModelMotifList().done(function (keys) {
                    that.driver.SetItems(keys);
                    that.driver.Message("");
                    //that.driver.Hide();
                }).fail(function (errorThrown) {
                    var res = JSON.parse(JSON.stringify(errorThrown));
                    that.driver.Message(res.statusText);
                });

                window.Commands.On("LocalStorageChanged", function () {
                    that.GetModelMotifList().done(function (keys) {
                        if (keys === undefined || keys.length == 0)
                            that.driver.Message("The model repository is empty");
                        else that.driver.Message('');
                        that.driver.SetItems(keys);

                        if (that.setOnIsActive !== undefined && that.setOnIsActive())
                            that.driver.SetActiveModel(that.appModel.BioModel.Name);
                    }).fail(function (errorThrown) {
                        var res = JSON.parse(JSON.stringify(errorThrown));
                        that.driver.Message(res.statusText);
                    });
                });

                //window.Commands.On("LocalStorageRemoveModel", function (key) {
                //    that.tool.RemoveModel(key);
                //});

                that.driver.SetOnRemoveModel(function (key) {
                    if (key.type === BMA.UIDrivers.StorageContentType.Model)
                        that.tool.RemoveModel(key.item);
                    else
                        that.tool.RemoveMotif(key.item);
                });

                window.Commands.On("LocalStorageRequested", function () {
                    that.GetModelMotifList().done(function (keys) {
                        that.driver.SetItems(keys);
                        that.driver.Message("");
                        //that.driver.Show();
                    }).fail(function (errorThrown) {
                        var res = JSON.parse(JSON.stringify(errorThrown));
                        that.driver.Message(res.statusText);
                    });
                });

                window.Commands.On("LocalStorageSaveModel", function () {
                    try {
                        logService.LogSaveModel();
                        var key = appModel.BioModel.Name;
                        that.tool.SaveModel(key, JSON.parse(appModel.Serialize()));
                        window.Commands.Execute("LocalStorageChanged", {});
                        that.checker.Snapshot(that.appModel);
                    }
                    catch (ex) {
                        that.driver.Message("Couldn't save model: " + ex);
                    }
                });

                window.Commands.On("LocalStorageSaveMotif", function (args: { name: string, motif: JSON }) {
                    try {
                        //logService.LogSaveModel();
                        var key = args.name;
                        that.tool.SaveMotif(key, args.motif);
                        window.Commands.Execute("LocalStorageChanged", {});
                        //that.checker.Snapshot(that.appModel);
                        //TODO: add to log 
                    }
                    catch (ex) {
                        that.driver.Message("Couldn't save model: " + ex);
                    }
                });



                window.Commands.On("ExportLocalModelsZip", function () {
                    tool.GetModels().done(function (res) {

                        var isValid = (function () {
                            var rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
                            var rg2 = /^\./; // cannot start with dot (.)
                            var rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
                            return function isValid(fname) {
                                return rg1.test(fname) && !rg2.test(fname) && !rg3.test(fname);
                            }
                        })();

                        var zip = new JSZip();
                        for (var i = 0; i < res.length; i++) {
                            var json = res[i];
                            var name = json['Model'].Name;
                            var fileName = name + ".json";

                            if (!isValid(fileName)) {
                                console.log("found invalid model name: " + name);
                                fileName = "unnamed " + i + ".json";
                            }

                            zip.file(fileName, JSON.stringify(json));
                        }

                        // Generate the zip file asynchronously
                        zip.generateAsync({ type: "blob" })
                            .then(function (content) {
                                // Force down of the Zip file
                                saveAs(content, "localModels.zip");
                            });


                    }).fail(function (err) {
                        messagebox.Show("Failed to load list of local models: " + err);
                    });
                });

                that.driver.SetOnCopyToOneDriveCallback(function (key) {
                    var deffered = $.Deferred();
                    if (that.tool.IsInRepo(key)) {
                        that.tool.LoadModel(key).done(function (result) {
                            that.driver.Message("");
                            if (that.setOnCopy !== undefined) {
                                var sp = key.split('.');
                                if (sp[0] === "user") {
                                    var q = sp[1];
                                    for (var i = 2; i < sp.length; i++) {
                                        q = q.concat('.');
                                        q = q.concat(sp[i]);
                                    }
                                    that.setOnCopy(q, result);
                                    deffered.resolve();
                                }
                            }
                            deffered.reject();
                        }).fail(function (error) {
                            var res = JSON.parse(JSON.stringify(error));
                            //that.messagebox.Show(res.statusText);
                            that.driver.Message(res.statusText);
                            deffered.reject();
                        });
                    }
                    else {
                        //that.messagebox.Show("The model was removed from outside");
                        that.driver.Message("The model was removed from outside");
                        window.Commands.Execute("LocalStorageChanged", {});
                        deffered.reject();
                    }
                    return deffered.promise();
                });

                that.driver.SetOnRequestLoadModel(function (key) {
                    //window.Commands.On("LocalStorageLoadModel", function (key) {
                    if (that.setRequestLoad !== undefined)
                        that.setRequestLoad(key);
                });

                window.Commands.On("LocalStorageInitModel", function (key) {
                    if (that.tool.IsInRepo(key)) {
                        that.tool.LoadModel(key).done(function (result) {
                            that.driver.Message("");
                            try {
                                appModel.Deserialize(JSON.stringify(result));
                                that.checker.Snapshot(that.appModel);
                            } catch (ex) {
                                that.driver.Message("Unable to desserialize model from storage: " + ex);
                                appModel.CreateNew();
                            }
                        }).fail(function (result) {
                            var res = JSON.parse(JSON.stringify(result));
                            that.driver.Message(res);
                            //that.messagebox.Show(JSON.stringify(result));
                        });
                    }
                });

                window.Commands.Execute("LocalStorageChanged", {});
            }

            public SetOnCopyCallback(callback: Function) {
                this.setOnCopy = callback;
            }

            public SetOnRequestLoad(callback: Function) {
                this.setRequestLoad = callback;
            }

            public SetOnActiveCallback(callback: Function) {
                this.setOnActive = callback;
            }

            public SetOnIsActive(callback: Function) {
                this.setOnIsActive = callback;
            }

            public LoadModel(key) {
                var that = this;
                that.waitScreen.Show();
                if (that.tool.IsInRepo(key)) {
                    that.tool.LoadModel(key).done(function (result) {
                        that.driver.Message("");
                        that.appModel.Deserialize(JSON.stringify(result));
                        that.checker.Snapshot(that.appModel);
                        that.driver.SetActiveModel(key);
                        if (that.setOnActive !== undefined)
                            that.setOnActive();
                        that.waitScreen.Hide();
                    }).fail(function (result) {
                        var res = JSON.parse(JSON.stringify(result));
                        //that.messagebox.Show(res.statusText);
                        that.driver.Message(res.statusText);
                        that.waitScreen.Hide();
                    });
                }
                else {
                    //that.messagebox.Show("The model was removed from outside");
                    that.driver.Message("The model was removed from outside");
                    window.Commands.Execute("LocalStorageChanged", {});
                    that.waitScreen.Hide();
                }
            }

            private GetModelMotifList(): JQueryPromise<{ name: string, type: BMA.UIDrivers.StorageContentType }[]> {
                var that = this;

                var deffered = $.Deferred();

                var items = [];

                $.when(that.tool.GetModelList(), that.tool.GetMotifList()).then(function (modelKeys, motifKeys) {
                    for (var i = 0; i < modelKeys.length; i++) {
                        items.push({
                            name: modelKeys[i],
                            type: BMA.UIDrivers.StorageContentType.Model
                        });
                    }

                    for (var i = 0; i < motifKeys.length; i++) {
                        items.push({
                            name: motifKeys[i],
                            type: BMA.UIDrivers.StorageContentType.Motif
                        });
                    }

                    deffered.resolve(items);
                }).fail(function (errorThrown) {
                    var res = JSON.parse(JSON.stringify(errorThrown));
                    console.log("error loading models and motifs: " + res.statusText);
                    deffered.reject();
                });
                
                var p = <JQueryPromise<{ name: string, type: BMA.UIDrivers.StorageContentType }[]>>deffered.promise();
                return p;
            }
        }
    }
}
