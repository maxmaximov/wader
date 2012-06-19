/**
 * Wader Abstract Model
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */
(function(ns) {
    "use strict";

    /*
    * @abstract wader.AModel
    */
    $.Class.extend("wader.AModel",
        /* @Static */
        {
            NULL: 0,
            CREATED: 1,
            EXIST: 2,
            UPDATED: 3,
            DELETED: 4,

            generateId: function () {
                if (!wader.AModel.count) {
                    wader.AModel.count = 1;
                }
                return wader.AModel.count++;
            },

            getCollection: function() {
                return this._collection;
            },

            getAttributes: function() {
                return this._attributes;
            }
        },
        /* @Prototype */
        {
            setup: function () {
                this._attribute = {};
                this._createdAt = undefined;
                this._updatedAt = undefined;
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
                this._silent = false;
            },

            construct: function() {

            },

            init: function(data) {
                var that = this;

                this._id = this.constructor.generateId();
                this._attribute = {};

                this.construct();

                this.setState(wader.AModel.NULL);

                if (this._collection) {
                    this._dp = this._collection._getDp();
                };

                if (data) {
                    this.fromArray(data);
                    if (!this.isValid()) {
                        throw new Error("invalid data in " + this.constructor.fullName);
                    }
                    this.setState(wader.AModel.EXIST);
                };
            },

            remove: function() {
                if (!this.isCreated() && !this.isDeleted()) {
                    this._dp.remove(this.getPrimaryKey());
                };
                this._collection.remove(this);
                this.setState(wader.AModel.DELETED);
            },

            save: function() {
                if (this.isValid()) {
                    var promise = new $.Deferred();
                    this._push(promise);
                    return promise;
                }
            },

            load: function() {
                throw new Error("IMPLEMENT IT, BITCH in " + this.constructor.fullName);
            },

            _addObserver: function(event, callback) {
                if (!event in this._observers) {
                    throw new Error("Unknown event: " + event);
                }

                this._observers[event].push(callback);
            },

            _removeObserver: function(event, callback) {
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

            _get: function(key) {
                if (!(key in this._attributes)) {
                    throw new Error("Не знаю ничего про свойство " + key + " атрибута модели " + this.constructor.fullName);
                }
                return this._attribute[key];
            },

            _set: function(key, value) {
                if (this._attribute[key] != value) {
                    this._attribute[key] = value;

                    if (!this.isSilent()) {
                        var that = this;
                        this._observers[5].forEach(function(callback) {
                            callback(that);
                        })
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

            _push: function(promise) {
                //отправить экземпляр на сервер
                var arr = this.toArray()
                var request = this.isCreated() ? this._dp.set("", arr) : this._dp.update(this.getPrimaryKey(), arr);
                request.done(this.proxy("_onPushDone", promise));
                request.fail(this.proxy("_onPushFail", promise));
            },

            _pull: function() {
                //получить последнюю сохраненную версию с сервера и перезаписать ею экземпляр
                var promise = new $.Deferred();
                $.when(this._dp.get(this.getPrimaryKey()))
                    .done(this.proxy("_onPullDone", promise))
                    .fail(this.proxy("_onPullFail", promise));
            },

            _onPullDone: function(data) {
                this._updatedAt = new DateTime();
                this.setState(wader.AModel.EXIST);
            },

            _onPullFail: function(data) {
                throw new Error("pull fail");
            },

            _onPushDone: function(promise, data) {
                /*if (this.isCreated()) {
                    this._collection.add(this);
                this._collection.refresh();
                };*/

                //this.setState(wader.AModel.EXIST);

                this._onSave(promise, data);

                this._collection.refresh();
                this._collection.refresh2(this);
            },

            _onPushFail: function(promise, data) {
                promise.reject();
                //throw new Error("push fail");
            },

            _validate: function() {
                var errors = {};

                for (var idx in this._attributes) {
                    var attr = this._attributes[idx],
                        key = idx,
                        value = this._attribute[idx],
                        type = this._attributes[idx].type;
                    if (attr.required && !value) {
                        errors[idx] = {
                            "message": "обязательный параметр",
                            "input": value
                        }
                        continue;
                    }
                    if (value) {
                        var rawString = Object.prototype.toString.call(value).slice(8, -1);

                        if (!type) {
                            debugger;
                            throw new Error("Incorrect Type");
                        }
                        if (type == "enum") {
                            var variants = this._attributes[idx]["variants"];
                            if (variants.indexOf(value) === -1) {
                                errors[idx] = {
                                    "message": "значение, не принадлежащее списку возможных значений",
                                    "input": value
                                };
                            };
                            continue;
                        };
                        if (typeof type === "object" || typeof type === "function") {
                            if (!value instanceof type) {
                                errors[idx] = {
                                    "message": "неверный класс",
                                    "input": type
                                };
                            }
                        } else {
                            if (rawString !== type) {
                                errors[idx] = {
                                    "message": "неверный тип",
                                    "input": type
                                };
                            }
                        };
                        if (attr.pattern) {
                            if (!attr.pattern.test(value)) {
                                errors[idx] = {
                                    "message": "неверное значение",
                                    "input": value
                                };
                            }
                        };
                    };
                }
                this._lastValidationErrors = errors;
            },

            getErrors: function(){
                return this._lastValidationErrors;
            },

            _parse: function(data) {
                throw new Error("В модели " + this.constructor.fullName + " не определен метод _parse");
            },

            fromArray: function(data){
                for (var field in data) {
                    var setterName = "set" + field.charAt(0).toUpperCase() + field.substr(1, field.length-1),
                        value = data[field];
                    if (field in this._attributes) {
                        this[setterName](value);
                    } else {
                        Logger.info(this, field);
                    }
                }
            },

            toArray: function(){
                var result = {
                    "model_id": this.getModelId(),
                    "_created_at": this.getCreatedAt(),
                    "disabled": this.isDisabled()
                };
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
                            result[key] = dep.getPrimaryKey();
                        } else if (dep instanceof DateTime) {
                            result[key] = dep.format("%c");
                        };
                    }
                }
                return result;
            },

            setState: function (state) {
                var that = this;
                this._state = state;
                this._observers[state].forEach(function(callback) {
                    callback(that);
                });
            },

            getState: function (state) {
                return this._state;
            },

            getModelId: function () {
                return this._id;
            },

            getCreatedAt: function(){
                return this._createdAt;
            },

            getUpdatedAt: function(){
                return this._updatedAt;
            },

            disable: function () {
                this._disabled = true;
                this._updatedAt = new DateTime();
                this._collection.refresh();
                this._collection.refresh2(this);
            },

            enable: function () {
                this._disabled = false;
                this._updatedAt = new DateTime();
                this._collection.refresh();
                this._collection.refresh2(this);
            },

            reset: function() {
                //сбросить на последнее сохраненное состояние
                if (this.isModified()) {
                    this._pull();
                };
            },

            isDisabled: function () {
                return this._disabled;
            },

            isSilent: function () {
                return this._silent;
            },

            isNew: function() {
                return this.getState() === wader.AModel.NULL;
            },

            isCreated: function() {
                return this.getState() === wader.AModel.CREATED;
            },

            isUpdated: function() {
                return this.getState() === wader.AModel.UPDATED;
            },

            isDeleted: function() {
                return this.getState() === wader.AModel.DELETED;
            },

            isExist: function() {
                return this.getState() === wader.AModel.EXIST;
            },

            onNew: function(callback) {
                return this._addObserver(wader.AModel.NULL, callback);
            },

            onCreate: function(callback) {
                return this._addObserver(wader.AModel.CREATED, callback);
            },

            onUpdate: function(callback) {
                return this._addObserver(wader.AModel.UPDATED, callback);
            },

            onDelete: function(callback) {
                return this._addObserver(wader.AModel.DELETED, callback);
            },

            onExist: function(callback) {
                return this._addObserver(wader.AModel.EXIST, callback);
            },

            onModify: function(callback) {
                return this._addObserver(5, callback);
            },

            getPrimaryKey: function() {
                throw new Error("В модели " + this.constructor.fullName + " не определен метод getPrimaryKey");
            },

            isValid: function() {
                this._validate();
                if (Object.keys(this.getErrors()).length === 0 && this.validate()) {
                    return true;
                } else {
                    Logger.warn(this, this.getErrors());
                    return false;
                }
            },

            validate: function() {
                Logger.warn("В модели " + this.constructor.fullName + " не определен метод validate");
                return true;
            },

            setSilentOn: function() {
                this._silent = true;
            },

            setSilentOff: function() {
                this._silent = false;
            },

            addToCollection: function() {
                if (!this.isCreated() || !this.isNew()) {
                    this._collection.add(this);
                };
                return this;
            },

            touch: function() {
                var that = this;
                this._observers[5].forEach(function(callback) {
                    callback(that);
                })
            },

            toString: function() {
                return this.getPrimaryKey();
            }
        });
    if (ns !== wader) {
        ns.AModel = wader.AModel;
    }
})(window.WADER_NS || window);
