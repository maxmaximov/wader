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

				this._dependenciesClasses.forEach(function(dependency) {
					that._dependencies.push[dependency.getInstance()];
				});

				this.setState(wader.AModel.NULL);
				if (data) {
					this._parse(data);
					if (!this.isValid()) {
						throw new Error("invalid data in " + this.constructor.fullName);
					}
					this.setState(wader.AModel.EXIST);
				};
				
				this.construct();
			},
			remove: function() {
				this._collection.remove(this);
				this.setState(wader.AModel.DELETED);
				this._dp.remove(this.getPrimaryKey());
			},
			save: function() {
				if (this.isValid()) {
					this._push();
				}
			},
			load: function() {
				throw new Error("IMPLEMENT IT, BITCH in " + this.constructor.fullName);
			},
			_get: function(key) {
				if (!(key in this._attributes)) {
					throw new Error("Не знаю ничего про свойство " + key + " атрибута модели " + this.constructor.fullName);
				}
				return this._attribute[key];
			},
			_set: function(key, value) {
				this._validateType(value, this._attributes[key].type);

				if (this._attribute[key] != value) {
					this._attribute[key] = value;
					if (this.isNew() || this.isCreated()) {
						this.setState(wader.AModel.CREATED);
					} else {
						this.setState(wader.AModel.UPDATED);
					}
				};
				return this;
			},
			_push: function() {
				//отправить экземпляр на сервер
				var promise = new $.Deferred();
				var request = this.isCreated() ? this._dp.set("", this.toJson()) : this._dp.update(this.getPrimaryKey(), this.toJson());
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
				if (this.isCreated()) {
					this._collection.add(this);
					this._collection.refresh();
				};
				this.setState(wader.AModel.EXIST);
				this._onSave(promise, data);
			},
			_onPushFail: function(data) {
				throw new Error("push fail");
			},

			_validateType: function(value, type) {

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
				Logger.info(this, errors);
				return errors;
			},
			_parse: function(data) {
				throw new Error("В модели " + this.constructor.fullName + " не определен метод _parse");
			},

			fromArray: function(data){
				for (var field in data) {
					var setterName = "set" + field.charAt(0).toUpperCase() + attr.substr(1, field.length-1);
					if (this[setterName]) {
						this[setterName](data[field]);
					};
				}
				return result;
			},

			toArray: function(){
				var result = {
					"model_id": this.getModelId()
				};
				for (var attr in this._attributes) {
					var getterName = "get" + attr.charAt(0).toUpperCase() + attr.substr(1, attr.length-1);
					result[attr] = this[getterName]();
				}
				return result;
			},

			setState: function (state) {
				this._state = state;
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
				this._collection.refresh();
				this._updatedAt = new DateTime();
			},

			enable: function () {
				this._disabled = false;
				this._collection.refresh();
				this._updatedAt = new DateTime();
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

			isNew: function() {
				return this.getState() === wader.AModel.NULL;
			},

			isCreated: function() {
				return this.getState() === wader.AModel.CREATED;
			},

			isModified: function() {
				return this.getState() === wader.AModel.UPDATED;
			},

			isDeleted: function() {
				return this.getState() === wader.AModel.DELETED;
			},

			isExist: function() {
				return this.getState() === wader.AModel.EXIST;
			},

			getPrimaryKey: function() {
				throw new Error("В модели " + this.constructor.fullName + " не определен метод getPrimaryKey");
			},

			isValid: function() {
				return Object.keys(this._validate()).length === 0;
			},
		});
	if (ns !== wader) {
		ns.AModel = wader.AModel;
	}
})(window.WADER_NS || window);