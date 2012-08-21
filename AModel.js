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
                this._virtual = false;
            },

            construct: function() {

            },

            init: function(data) {
                var that = this;

                this._id = this.constructor.generateId();
                this._attribute = {};

                this.construct();


                if (this._collection) {
                    this._dp = this._collection._getDp();
                };

                this.setDefaults();

                this.setState(wader.AModel.NULL);

                if (data) {
                    this.fromArray(data);
                    if (!this.isValid()) {
                        throw new Error("invalid data in \"" + this.constructor.fullName + "\"" + JSON.stringify(data).replace("@", "[at]"));
                    }
                    this.setState(wader.AModel.EXIST);
                };
            },

            remove: function() {
                var promise = new $.Deferred();

                if (!this.isCreated() && !this.isDeleted()) {
                    if (this._parent) {
                        this.onRemoveDone(promise);
                    } else {
                        $.when(this._dp.remove(this.getPrimaryKey()))
                            .done(this.proxy("onRemoveDone", promise))
                            .fail(this.proxy("onRemoveFail", promise));
                    }
                } else {
                    this.onRemoveDone(promise);
                }
                return promise;
            },

            setDefaults: function() {
                for (var field in this._attributes) {
                    if (this._attributes[field]["default"]) {
                        var setterName = "set" + field.charAt(0).toUpperCase() + field.substr(1, field.length-1);
                        this[setterName](this._attributes[field]["default"]);
                    };
                };
            },

            onRemoveDone: function(promise) {
                this._collection.remove(this);
                this.setState(wader.AModel.DELETED);
                promise.resolve()
            },

            onRemoveFail: function(promise) {
                promise.fail();
            },

            save: function() {
                var promise = new $.Deferred();
                if (!(this.isExist() || this.isDeleted())) {
                    var arr = this.toArray()
                    var request = this.isCreated() ? this._dp.set("", arr) : this._dp.update(this.getPrimaryKey(), arr);
                    request.done(this.proxy("_onSaveDone", promise));
                    request.fail(this.proxy("_onSaveFail", promise));
                } else {
                    this._onSaveDone(promise);
                }
                return promise;
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
                        this._observers[event][i] = null;
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

            removeProp: function(key) {
                if (!(key in this._attributes)) {
                    throw new Error("Не знаю ничего про свойство " + key + " атрибута модели " + this.constructor.fullName);
                };
                this._attribute[key] = undefined;
                if (this.isNew()) {
                    this.setState(wader.AModel.CREATED);
                } else {
                    this.setState(wader.AModel.UPDATED);
                }
                if (!this.isSilent()) {
                    this._observers[5].forEach(function(callback) {
                        if (callback) {
                            callback(this);
                        };
                    }, this);
                };
            },

            filterPropFromList: function(key, value) {
                if (!(key in this._attributes)) {
                    throw new Error("Не знаю ничего про свойство " + key + " атрибута модели " + this.constructor.fullName);
                };
                this._attribute[key] = this._attribute[key].filter(function(item){
                    if (item[this._relationKey] !== value) {
                        return item;
                    };
                }, this);

                if (!this.isSilent()) {
                    this._observers[5].forEach(function(callback) {
                        if (callback) {
                            callback(this);
                        };
                    }, this);
                }

                if (this.isCreated()) {
                } else if (this.isNew()) {
                    this.setState(wader.AModel.CREATED);
                } else {
                    this.setState(wader.AModel.UPDATED);
                }

                return this;
            },

            _set: function(key, value) {
                /*if (typeof value == "string") {
                    // TODO make correct clean values
                    value = value.trim() ? value.trim() : void("Putin");
                };*/

                if (this._attribute[key] != value) {
                    if (this._attributes[key]["type"] === "list") {
                        if (typeof this._attribute[key] === "undefined") {
                            this._attribute[key] = [];
                        }

                        var exist = false;

                        this._attribute[key].forEach(function(item) {
                            if (item[this._relationKey] == value[this._relationKey]) {
                                exist = true;
                                return;
                            }
                        }, this);

                        if (!exist) {
                            this._attribute[key].push(value);
                        };

                    } else {
                        this._attribute[key] = value;
                    }


                    if (!this.isSilent()) {
                        this._observers[5].forEach(function(callback) {
                            if (callback) {
                                //callback(this);
                                callback(key, value);
                            };
                        }, this);
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

            _pull: function() {
                var promise = new $.Deferred();
                $.when(this._dp.get(this.getPrimaryKey()))
                    .done(this.proxy("_onPullDone", promise))
                    .fail(this.proxy("_onPullFail", promise));

                return promise;
            },

            _onPullDone: function(promise, data) {
                this.setSilentOn();
                this.fromArray(data);
                this.setSilentOff();
                this.touch();
                this._updatedAt = new DateTime();
                this.setState(wader.AModel.EXIST);
                this._collection.refresh2();
                promise.resolve();
            },

            _onPullFail: function(data) {
                throw new Error("pull fail");
            },

            _onSaveDone: function(promise, data) {
                this._onSave(promise, data);
                this._collection.refresh2(this);
            },

            _onSaveFail: function(promise, data) {
                promise.reject();
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
                        if (type == "list") {
                            // array of objects
                            var objectClass = this._attributes[idx]["objectClass"];
                            value.forEach(function(item) {
                                item = item[this._relationKey];
                                if (!(item instanceof objectClass) || !item.isValid()) {
                                    errors[idx] = {
                                        "message": "некорректный элемент списка",
                                        "input": value
                                    };
                                }
                            }, this);
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

                    if (value && value !== null) {
                        if (field in this._attributes) {
                            if (field == "attendees") {
                                // HAHA! OH WOW!
                                value.forEach(function(item) {
                                    var email = item.email,
                                        access = item.access,
                                        owner = item.owner,
                                        val = {
                                            "email": email,
                                            "access": access,
                                            "owner": owner,
                                        };

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

            toArray: function(recursively){
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
                            if (recursively) {
                                result[key] = dep.map(function(item){
                                    return item[rkey].toArray(recursively);
                                });
                            } else {
                                var hui = this.constructor.fullName;
                                result[key] = dep.map(function(item){

                                    var out = $.extend({}, item)

                                    var obj = item[rkey].getPrimaryKey();
                                    out[rkey] = obj;

                                    return out;
                                }, this);
                            }
                        }
                    }
                }
                return result;
            },

            setState: function (state) {
                this._state = state;
                this._observers[state].forEach(function(callback) {
                    if (callback) {
                        callback(this);
                    };
                }, this);
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
                if (this.isUpdated()) {
                    return this._pull();
                };
            },

            isDisabled: function () {
                return this._disabled;
            },

            isSilent: function () {
                return this._silent;
            },

            isVirtual: function () {
                return this._virtual;
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
                //Logger.warn("В модели " + this.constructor.fullName + " не определен метод validate");
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
                this._observers[5].forEach(function(callback) {
                    if (callback) {
                        //callback(this);
                        callback();
                    };
                }, this);
            },

            toString: function() {
                return this.getPrimaryKey();
            }
        });
    if (ns !== wader) {
        ns.AModel = wader.AModel;
    }
})(window.WADER_NS || window);
