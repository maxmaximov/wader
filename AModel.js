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
					wader.AModel.count = 0;
				}
				return wader.AModel.count++;
			}
		},
		/* @Prototype */
		{
			setup: function () {
				this._createdAt = undefined;
				this._updatedAt = undefined;
				this._disabled = undefined;
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

				if (this._collection) {
					this._collection = new this._collectionClass();
				};

				this.construct();

				this._dependenciesClasses.forEach(function(dependency) {
					that._dependencies.push[dependency.getInstance()];
				});

				this.setState(wader.AModel.NULL);

				if (this._collection) {
					this._dp = this._collection._getDp();
				};
				if (data) {
					this._parse(data);
					if (!this.isValid()) {
						throw new Error("invalid data");
					};
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
				if (!(key in this._attribute)) {
					throw new Error("Не знаю ничего про свойство " + key + " атрибута модели " + this.constructor.fullName);
				}
				return this._attribute[key];
			},
			_set: function(key, value) {
				if (!(name in this._attribute)) {
					throw new Error("Не знаю ничего про свойство " + key + " атрибута модели " + this.constructor.fullName);
				}

				if (this._attribute[key] != value) {
					this._attribute[key] = value;
					this.setState(wader.AModel.UPDATED);
				};
				return this;
			},
			_push: function() {
				//отправить экземпляр на сервер
				var promise = new $.Deferred();
				$.when(this._dp.set(this.getPrimaryKey(), this.toJson()))
					.done(this.proxy("_onPushDone", promise))
					.fail(this.proxy("_onPushFail", promise));
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
			_onPushDone: function(data) {
				if (this.isCreated()) {
					this._collection.add(this);
				};
				this.setState(wader.AModel.EXIST);
			},
			_onPushFail: function(data) {
				throw new Error("push fail");
			},

			_validate: function() {
				throw new Error("В модели " + this.constructor.fullName + " не определен метод _validate");
			},
			_parse: function(data) {
				throw new Error("В модели " + this.constructor.fullName + " не определен метод _parse");
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
				return Object.keys(this._validate()).length;
			},
		});
	if (ns !== wader) {
		ns.AModel = wader.AModel;
	}
})(window.WADER_NS || window);