// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
module BMA {
    export class LocalRepositoryTool implements BMA.UIDrivers.IModelRepository {

        private readonly modelPrefix = "user.";
        private readonly motifPrefix = "userm.";
        
        private messagebox: BMA.UIDrivers.IMessageServiсe;

        constructor(messagebox: BMA.UIDrivers.IMessageServiсe) {
            this.messagebox = messagebox;
        }

        public IsInRepo(id: string) {
            return window.localStorage.getItem(this.modelPrefix + id) !== null || window.localStorage.getItem(this.motifPrefix + id) !== null;
        }

        public Save(key: string, appModel: string) {
            try {
                window.localStorage.setItem(key, appModel);
                window.Commands.Execute("LocalStorageChanged", {});
            }
            catch (e) {
                if (e === 'QUOTA_EXCEEDED_ERR') {
                    this.messagebox.Show("Error: Local repository is full");
                }
            }
        }

        public ParseItem(item): boolean {
            try {
                var ml = JSON.parse(item);
                BMA.Model.ImportModelAndLayout(ml);
                return true;
            }
            catch(e) {
                return false;
            }
        }

        public SaveModel(id: string, model: JSON) {
            var that = this;
            if (window.localStorage.getItem(that.modelPrefix + id) !== null) {
                //TODO: If we need more obvious confirm from user to overwrite existing file, we should ask him about that in other place
                console.log("Overwritting existing model with name: " + id);
            }
            this.Save(that.modelPrefix + id, JSON.stringify(model));
        }

        public SaveMotif(id: string, model: JSON) {
            var that = this;

            var actualName = id;
            var ind = 0;
            while (window.localStorage.getItem(that.motifPrefix + actualName) !== null) {
                ind++;
                actualName = id + "(" + ind + ")";
            }

            this.Save(that.motifPrefix + actualName, JSON.stringify(model));
        }

        public RemoveModel(id: string) {
            var that = this;
            if (window.localStorage.getItem(that.modelPrefix + id) !== null) {
                window.localStorage.removeItem(that.modelPrefix + id);
                window.Commands.Execute("LocalStorageChanged", {});
            }
        }

        public RemoveMotif(id: string) {
            var that = this;
            if (window.localStorage.getItem(that.motifPrefix + id) !== null) {
                window.localStorage.removeItem(that.motifPrefix + id);
                window.Commands.Execute("LocalStorageChanged", {});
            }
        }

        public LoadModel(id: string): JQueryPromise<JSON> {
            var that = this;
            var deffered = $.Deferred();
            var model = window.localStorage.getItem(that.modelPrefix + id);
            if (model !== null) {
                try {
                    var serialized = BMA.ModelHelper.ProcessModelJSON(model);
                    deffered.resolve(JSON.parse(serialized));
                }
                catch (ex) { that.messagebox.Show(ex); deffered.reject(ex); }
            }
            else deffered.resolve(null);

            return <JQueryPromise<JSON>>deffered.promise();
        }

        public LoadMotif(id: string): JQueryPromise<JSON> {
            var that = this;
            var deffered = $.Deferred();
            var model = window.localStorage.getItem(that.motifPrefix + id);
            if (model !== null) {
                try {
                    var serialized = BMA.ModelHelper.ProcessModelJSON(model);
                    deffered.resolve(JSON.parse(serialized));
                }
                catch (ex) { that.messagebox.Show(ex); deffered.reject(ex); }
            }
            else deffered.resolve(null);

            return <JQueryPromise<JSON>>deffered.promise();
        }

        public GetModelList(): JQueryPromise<string[]> {
            var deffered = $.Deferred();
            var keys:string[] = [];
            for (var i = 0; i < window.localStorage.length; i++) {
                var key = window.localStorage.key(i);
                var usrkey = this.IsModelKey(key);
                if (usrkey !== undefined) {
                    var item = window.localStorage.getItem(key);
                    if (this.ParseItem(item)) {
                        keys.push(usrkey);
                    }
                }
            }
            deffered.resolve(keys);

            var p = <JQueryPromise<string[]>>deffered.promise();
            return p;
        }

        public GetMotifList(): JQueryPromise<string[]> {
            var deffered = $.Deferred();
            var keys: string[] = [];
            for (var i = 0; i < window.localStorage.length; i++) {
                var key = window.localStorage.key(i);
                var usrkey = this.IsMotifKey(key);
                if (usrkey !== undefined) {
                    var item = window.localStorage.getItem(key);
                    if (this.ParseItem(item)) {
                        keys.push(usrkey);
                    }
                }
            }
            deffered.resolve(keys);

            var p = <JQueryPromise<string[]>>deffered.promise();
            return p;
        }

        public GetModels(): JQueryPromise<JSON[]> {
            var deffered = $.Deferred();
            var that = this;

            var models = [];
            for (var i = 0; i < window.localStorage.length; i++) {
                var key = window.localStorage.key(i);
                var usrkey = this.IsModelKey(key);
                if (usrkey !== undefined) {
                    var item = window.localStorage.getItem(key);
                    models.push(JSON.parse(item));
                }
            }
            deffered.resolve(models);

            var p = <JQueryPromise<JSON[]>>deffered.promise();
            return p;
        }

        public GetMotifs(): JQueryPromise<JSON[]> {
            var deffered = $.Deferred();
            var that = this;

            var models = [];
            for (var i = 0; i < window.localStorage.length; i++) {
                var key = window.localStorage.key(i);
                var usrkey = this.IsMotifKey(key);
                if (usrkey !== undefined) {
                    var item = window.localStorage.getItem(key);
                    models.push(JSON.parse(item));
                }
            }
            deffered.resolve(models);

            var p = <JQueryPromise<JSON[]>>deffered.promise();
            return p;
        }

        private IsModelKey(key: string): string {
            var sp = key.split('.');
            if (sp[0] + '.' === this.modelPrefix) {
                var q = sp[1];
                for (var i = 2; i < sp.length; i++) {
                    q = q.concat('.');
                    q = q.concat(sp[i]);
                }
                return q;
            }
            else return undefined;
        }

        private IsMotifKey(key: string): string {
            var sp = key.split('.');
            if (sp[0] + '.' === this.motifPrefix) {
                var q = sp[1];
                for (var i = 2; i < sp.length; i++) {
                    q = q.concat('.');
                    q = q.concat(sp[i]);
                }
                return q;
            }
            else return undefined;
        }
    }
}
