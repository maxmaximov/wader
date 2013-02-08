(function (ns) {
    "use strict";

    /**
     * @name wader.AModel
     * @class Wader Abstract Model
     * @abstract
     * @author Max Maximov <max.maximov@gmail.com>
     * @version 0.3
     */
    $.Class.extend("wader.AModel",

        /** @lends wader.AModel */
        {
            NULL: 0,
            CREATED: 1,
            EXIST: 2,
            UPDATED: 3,
            DELETED: 4,

            /**
             * @return {Number}
             */
            generateId: function () {
                if (!wader.AModel.count) {
                    wader.AModel.count = 1;
                }
                return wader.AModel.count++;
            },

            /**
             * @return {wader.ACollection}
             */
            getCollection: function () {
                return this._collection;
            },

            /**
             * @return {Hash}
             */
            getAttributes: function () {
                return this._attributes;
            }
        },

        /** @lends wader.AModel# */
        {
            /**
             * @return {undefined}
             */
            setup: function () {
                this._attribute = {};
                this._disabled = false;
                this._collectionClass = undefined;
                this._collection = undefined;
                this._dependencies = [];
                this._dependenciesClasses = [];
                this._createdAt = new DateTime();
                this._updatedAt = new DateTime();
                this._lastValidationErrors = {};
                this._observers = {
                    0: [],
                    1: [],
                    2: [],
                    3: [],
                    4: [],
                    5: []
                };

                this._silent = [];
                this._modifiedColumns = {};
                this._virtual = false;
            },

            construct: function () {

            },

            /**
             * @param {Hash} data
             * @return {undefined}
             */
            init: function (data) {
                var that = this;

                this._id = this.constructor.generateId();
                this._attribute = {};

                this.construct();
                this._attributes["updated"] = {
                    "type": Number
                }

                if (this._collection) {
                    this._dp = this._collection.getDp();
                };

                this.setDefaults();

                this.setState(wader.AModel.NULL);

                if (data) {
                    this.fromArray(data);
/*                    if (!this.isValid()) {
                        throw new Error("invalid data in \"" + this.constructor.fullName + "\"" + JSON.stringify(data).replace(/\@/g, "[at]"));
                    }*/
                    this.setState(wader.AModel.EXIST);
                };
            },

            /**
             * @param {Boolean} silent
             * @return {$.Deferred}
             */
            remove: function (silent) {
                var promise = new $.Deferred();

                if (!silent && !this.isCreated() && !this.isDeleted()) {
                    $.when(
                        this._dp.remove(this.getPrimaryKey())
                    ).done(
                        this.onRemoveDone.bind(this, promise)
                    ).fail(
                        this.onRemoveFail.bind(this, promise)
                    );
                } else {
                    this.onRemoveDone(promise);
                }

                return promise;
            },

            /**
             * @return {undefined}
             */
            setDefaults: function () {
                for (var field in this._attributes) {
                    if (this._attributes[field].hasOwnProperty("default")) {
                        var setterName = "set" + field.charAt(0).toUpperCase() + field.substr(1, field.length-1);
                        this[setterName](this._attributes[field]["default"]);
                    };
                };
            },

            /**
             * @param {$.Deferred} promise
             * @return {undefined}
             */
            onRemoveDone: function (promise) {
                this.setState(wader.AModel.DELETED);
                this._collection.remove(this);
                promise.resolve();
            },

            /**
             * @param {$.Deferred} promise
             * @return {undefined}
             */
            onRemoveFail: function (promise) {
                promise.fail();
            },

            /**
             * @return {$.Deferred}
             */
            save: function () {
                var promise = new $.Deferred();

                if (!(this.isExist() || this.isDeleted())) {
                    var arr = this.toArray()
                    var request = this.isCreated() ? this._dp.set("", arr) : this._dp.update(this.getPrimaryKey(), arr);
                    request.done(this._onSaveDone.bind(this, promise));
                    request.fail(this._onSaveFail.bind(this, promise));
                } else {
                    this._onSaveDone(promise);
                }
                return promise;
            },

            /**
             * @abstract
             */
            load: function () {
                throw new Error("IMPLEMENT IT, BITCH in " + this.constructor.fullName);
            },

            /**
             * @param {*} event
             * @param {Function} callback
             * @return {undefined}
             * @throws {Error}
             */
            _addObserver: function (event, callback) {
                if (!event in this._observers) {
                    throw new Error("Unknown event: " + event);
                }

                this._observers[event].push(callback);
            },

            /**
             * @param {*} event
             * @param {Function} callback
             * @return {undefined}
             * @throws {Error}
             */
            _removeObserver: function (event, callback) {
                if (!event in this._observers) {
                    throw new Error("Unknown event: " + event);
                };

                for (var i = 0, l = this._observers[event].length; i < l; i++) {
                    if (this._observers[event][i] === callback) {
                        this._observers[event].splice(i, 1);
                        break;
                    }
                }
            },

            /**
             * @param {*} event
             * @return {undefined}
             * @throws {Error}
             */
            _notifyObservers: function (event) {
                var args = Array.prototype.slice.call(arguments, 1);

                if (!event in this._observers) {
                    throw new Error("Unknown event: " + event);
                }

                this._observers[event].forEach(function (observer) {
                    observer.apply(this, args);
                }, this);

            },

            /**
             * @param {String} key
             * @return {*}
             * @throws {Error}
             */
            _get: function (key) {
                if (!(key in this._attributes)) {
                    throw new Error("Не знаю ничего про свойство " + key + " атрибута модели " + this.constructor.fullName);
                }
                return this._attribute[key];
            },

            /**
             * @param {String} key
             * @return {undefined}
             * @throws {Error}
             */
            removeProp: function (key) {
                if (!(key in this._attributes)) {
                    throw new Error("Не знаю ничего про свойство " + key + " атрибута модели " + this.constructor.fullName);
                }

                this._attribute[key] = undefined;

                if (!this.isSilent()) {
                    this._notifyObservers(5, key);
                }

                if (this.isCreated()) {
                } else if (this.isNew()) {
                    this.setState(wader.AModel.CREATED);
                } else {
                    this.setState(wader.AModel.UPDATED);
                }
            },

            /**
             * @param {String} key
             * @param {*} value
             * @return {wader.AModel}
             * @throws {Error}
             */
            filterPropFromList: function (key, value) {
                if (!(key in this._attributes)) {
                    throw new Error("Не знаю ничего про свойство " + key + " атрибута модели " + this.constructor.fullName);
                }

                var rk = this._relationKey;
                var tmp = this._attribute[key].filter(function (item){
                    return item["email"] !== value;
                });

                this._attribute[key] = tmp;

                if (!this.isSilent()) {
                    this._notifyObservers(5, key, value);
                }

                if (this.isCreated()) {
                } else if (this.isNew()) {
                    this.setState(wader.AModel.CREATED);
                } else {
                    this.setState(wader.AModel.UPDATED);
                }

                return this;
            },

            /**
             * @param {String} key
             * @param {*} value
             * @return {wader.AModel}
             */
            _set: function (key, value) {
                if (!this._attribute.hasOwnProperty(key) || this._attribute[key] != value) {
                    this._modifiedColumns[key] = true;

                    if (this._attributes[key]["type"] === "list") {
                        if (typeof this._attribute[key] === "undefined") {
                            this._attribute[key] = [];
                        }

                        var exist = false;

                        this._attribute[key].forEach(function (item) {
                            if (item[this._relationKey] === value[this._relationKey]) {
                                exist = true;
                                return;
                            }
                        }, this);

                        if (!exist) {
                            this._attribute[key].push(value);
                        }
                    } else {
                        this._attribute[key] = value;
                    }

                    if (!this.isSilent()) {
                        this._notifyObservers(5, key, value);
                    }

                    if (this.isCreated()) {
                    } else if (this.isNew()) {
                        this.setState(wader.AModel.CREATED);
                    } else {
                        this.setState(wader.AModel.UPDATED);
                    }
                }

                return this;
            },

            /**
             * @return {$.Deferred}
             */
            _pull: function () {
                var promise = new $.Deferred();

                $.when(this._dp.get(this.getPrimaryKey()))
                    .done(
                        this._onPullDone.bind(this, promise)
                    )
                    .fail(
                        this._onPullFail.bind(this, promise)
                    );

                return promise;
            },

            /**
             * @param {$.Deferred} promise
             * @param {Hash} data
             * @return {undefined}
             * @throws {Error}
             */
            _onPullDone: function (promise, data) {
                this.setSilentOn();

                this._attribute = {};
                this.setDefaults();
                this.fromArray(data.data);
                if (!this.isValid()) {
                    throw new Error("invalid data in \"" + this.constructor.fullName + "\"" + JSON.stringify(data).replace(/\@/g, "[at]"));
                }
                this.setState(wader.AModel.EXIST);

                //this._updatedAt = new DateTime();
                this.setSilentOff();
                this.touch();
                this._collection.refresh2(this);
                promise.resolve();
            },

            /**
             * @throws {Error}
             */
            _onPullFail: function (data) {
                throw new Error("pull fail");
            },

            /**
             * @param {Hash} data
             * @return {undefined}
             */
            _onSaveDone: function (promise, data) {
                this._onSave(promise, data);
                if (!this._collection.has(this)) {
                    this._collection.add(this);
                } else {
                    this._collection.refresh2(this);
                }
            },

            /**
             * @param {$.Deferred} promise
             * @param {Hash} data
             * @return {undefined}
             */
            _onSaveFail: function (promise, data) {
                promise.reject();
            },

            /**
             * @return {Hash}
             */
            getModifiedColumns: function () {
                return this._modifiedColumns;
            },

            /**
             * @return {undefined}
             * @throws {Error}
             */
            _validate: function () {
                var errors = {};

                for (var idx in this._attributes) {
                    var attr = this._attributes[idx],
                        key = idx,
                        value = this._attribute[idx],
                        type = this._attributes[idx].type;

                    if (attr.required && (typeof value === "undefined" || value === null)) {
                        errors[idx] = {
                            "message": "обязательный параметр",
                            "input": value
                        }
                        continue;
                    }

                    if (value) {
                        var rawString = Object.prototype.toString.call(value).slice(8, -1);

                        if (!type) {
                            throw new Error("Incorrect Type");
                        }

                        if (type == "enum") {
                            var variants = this._attributes[idx]["variants"];
                            if (variants.indexOf(value) === -1) {
                                errors[idx] = {
                                    "message": "значение, не принадлежащее списку возможных значений",
                                    "input": value
                                }
                            }
                            continue;
                        }

                        if (type == "list") {
                            // array of objects
                            var objectClass = this._attributes[idx]["objectClass"];
                            value.forEach(function (item) {
                                item = item[this._relationKey];
                                if (!(item instanceof objectClass) || !item.isValid()) {
                                    errors[idx] = {
                                        "message": "некорректный элемент списка",
                                        "input": value
                                    };
                                }
                            }, this);
                            continue;
                        }

                        if (typeof type === "object" || typeof type === "function") {
                            if (!value instanceof type) {
                                errors[idx] = {
                                    "message": "неверный класс",
                                    "input": type
                                }
                            }
                        } else {
                            if (rawString !== type) {
                                errors[idx] = {
                                    "message": "неверный тип",
                                    "input": type
                                }
                            }
                        }

                        if (attr.pattern) {
                            if (!attr.pattern.test(value)) {
                                errors[idx] = {
                                    "message": "неверное значение",
                                    "input": value
                                }
                            }
                        }
                    }
                }

                this._lastValidationErrors = errors;
            },

            /**
             * @return {Hash}
             */
            getErrors: function (){
                return this._lastValidationErrors;
            },

            /**
             * @throws {Error}
             */
            _parse: function (data) {
                throw new Error("В модели " + this.constructor.fullName + " не определен метод _parse");
            },

            /**
             * @param {Hash} data
             * @return {undefined}
             */
            fromArray: function (data){
                for (var field in data) {
                    var setterName = "set" + field.charAt(0).toUpperCase() + field.substr(1, field.length-1),
                        value = data[field];

                    if (value && value !== null) {
                        if (field in this._attributes) {
                            if (field == "attendees") {
                                // HAHA! OH WOW!
                                value.forEach(function (item) {
                                    var val = {};

                                    (["email", "name", "status", "access", "role", "confirm"]).forEach(function (prop) {
                                        if (prop in item) {
                                            val[prop] = item[prop];
                                        };
                                    })

                                    this[setterName](val);

                                }, this);
                            } else {
                                this[setterName](value);
                            }
                        } else {
                            Logger.info(this, field);
                        }
                    }
                }
            },

            /**
             * @param {Boolean} recursively
             * @return {Hash}
             */
            toArray: function (recursively){
                var result = {
                        "model_id": this.getModelId(),
                        "_created_at": this.getCreatedAt(),
                        "disabled": this.isDisabled()
                    },
                    rkey = this._relationKey;

                for (var attr in this._attributes) {
                    var getterName = "get" + attr.charAt(0).toUpperCase() + attr.substr(1, attr.length-1);
                    result[attr] = this[getterName]();
                }
                //повторная сериализация вложенных объектов
                for (var key in result) {
                    if (typeof result[key] == "object") {
                        var dep = this._attribute[key];

                        if (dep instanceof wader.AModel) {
                            //сериализуем сущность в ссылку на ПК
                            if (recursively) {
                                result[key] = dep.toArray(true);
                            } else {
                                // или рекурсивно во вложенный массив
                                result[key] = dep.getPrimaryKey();
                            }
                        } else if (dep instanceof DateTime) {
                            result[key] = dep.toISOString();
                        } else if ($.isArray(dep)) {
                            if (dep.length && dep[0][rkey] instanceof wader.AModel) {
                                if (recursively) {
                                    result[key] = dep.map(function (item){
                                        return item[rkey].toArray(recursively);
                                    });
                                } else {
                                    result[key] = dep.map(function (item){
                                        var out = $.extend({}, item);
                                        var obj = item[rkey].getPrimaryKey();

                                        out[rkey] = obj;

                                        return out;
                                    }, this);
                                }
                            } else {
                                result[key] = dep;
                            }

                        }
                    }
                }
                return result;
            },

            /**
             * @param {Number} state
             * @return {undefined}
             */
            setState: function (state) {
                if (this._state !== state && state !== wader.AModel.UPDATED) {
                    this._modifiedColumns = {};
                }

                this._state = state;
                this._notifyObservers(state);
            },

            /**
             * @return {Number}
             */
            getState: function () {
                return this._state;
            },

            /**
             * @return {Number}
             */
            getModelId: function () {
                return this._id;
            },

            /**
             * @return {date.DateTime}
             */
            getCreatedAt: function (){
                return this._createdAt;
            },

            /**
             * @return {Number}
             */
            getUpdated: function (){
                return this._get("updated");
            },

            /**
             * @param {Number}
             * @return {wader.AModel}
             */
            setUpdated: function (updated) {
                return this._set("updated", updated);
            },

            /**
             * @return {undefined}
             */
            disable: function () {
                this._disabled = true;
                this._updatedAt = new DateTime();
                this._collection.refresh();
                this._collection.refresh2(this);
            },

            /**
             * @return {undefined}
             */
            enable: function () {
                this._disabled = false;
                this._updatedAt = new DateTime();
                this._collection.refresh();
                this._collection.refresh2(this);
            },

            /**
             * @return {$.Deferred}
             */
            reset: function () {
                if (this.isUpdated()) {
                    return this._pull();
                }
            },

            /**
             * @return {Boolean}
             */
            isDisabled: function () {
                return this._disabled;
            },

            /**
             * @return {Boolean}
             */
            isSilent: function () {
                return this._silent.length > 0;
            },

            /**
             * @return {Boolean}
             */
            isVirtual: function () {
                return this._virtual;
            },

            /**
             * @return {Boolean}
             */
            isNew: function () {
                return this.getState() === wader.AModel.NULL;
            },

            /**
             * @return {Boolean}
             */
            isCreated: function () {
                return this.getState() === wader.AModel.CREATED;
            },

            /**
             * @return {Boolean}
             */
            isUpdated: function () {
                return this.getState() === wader.AModel.UPDATED;
            },

            /**
             * @return {Boolean}
             */
            isDeleted: function () {
                return this.getState() === wader.AModel.DELETED;
            },

            /**
             * @return {Boolean}
             */
            isExist: function () {
                return this.getState() === wader.AModel.EXIST;
            },

            /**
             * @param {Function} callback
             * @return {undefined}
             */
            onNew: function (callback) {
                return this._addObserver(wader.AModel.NULL, callback);
            },

            /**
             * @param {Function} callback
             * @return {undefined}
             */
            onCreate: function (callback) {
                return this._addObserver(wader.AModel.CREATED, callback);
            },

            /**
             * @param {Function} callback
             * @return {undefined}
             */
            onUpdate: function (callback) {
                return this._addObserver(wader.AModel.UPDATED, callback);
            },

            /**
             * @param {Function} callback
             * @return {undefined}
             */
            onDelete: function (callback) {
                return this._addObserver(wader.AModel.DELETED, callback);
            },

            /**
             * @param {Function} callback
             * @return {undefined}
             */
            onExist: function (callback) {
                return this._addObserver(wader.AModel.EXIST, callback);
            },

            /**
             * @param {Function} callback
             * @return {undefined}
             */
            onModify: function (callback) {
                return this._addObserver(5, callback);
            },

            /**
             * @throws {Error}
             */
            getPrimaryKey: function () {
                throw new Error("В модели " + this.constructor.fullName + " не определен метод getPrimaryKey");
            },

            /**
             * @return {Boolean}
             */
            isValid: function () {
                this._validate();

                if (this.validate() && Object.keys(this.getErrors()).length === 0) {
                    return true;
                } else {
                    Logger.warn(this, this.getErrors());
                    return false;
                }
            },

            /**
             * @return {Boolean}
             */
            validate: function () {
                //Logger.warn("В модели " + this.constructor.fullName + " не определен метод validate");
                return true;
            },

            /**
             * @return {undefined}
             */
            setSilentOn: function () {
                this._silent.push(true);
            },

            /**
             * @return {undefined}
             */
            setSilentOff: function () {
                this._silent.pop(true);
            },

            /**
             * @return {wader.AModel}
             */
            addToCollection: function () {
                this._collection.add(this);
                return this;
            },

            /**
             * @return {undefined}
             */
            refreshCollection: function () {
                this._collection.refresh(this);
                this._collection.refresh2(this);
            },

            /**
             * @return {undefined}
             */
            touch: function () {
                this._notifyObservers(5);
            },

            /**
             * @return {String}
             */
            toString: function () {
                return this.getPrimaryKey();
            }
        });
    if (ns !== wader) {
        ns.AModel = wader.AModel;
    }
})(window.WADER_NS || window);
