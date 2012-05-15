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
			_created_at: null,
			_updated_at: null,
			_disabled: false,
			_collection: null,
			_dependencies: null,

			setup: function (collection, dependencies) {
				this._id = this.constructor.generateId();
				this._attribute = {};

				this._collection = collection;
				this._dependencies = dependencies;

				this._disabled = false;

				this.setState(wader.AModel.NULL);

				this._dp;
				if (this._collection) {
					this._dp = this._collection._getDp();
					this._collection.add(this);
				}
			},
			init: function(data){
				if (data) {
					this._parse(data);
					if (!this.isValid()) {
						throw new Error("non valid data");
					};
				};
				this._dp = this._collection.getDp();
				this._created_at = new DateTime();
				this._updated_at = new DateTime();
			},
			remove: function(){
				//удаление сразу с сервера
				this._notifyObservers();
			},
			save: function(){
				if (this.isValid()) {
					this._push();
				}
			},
			load: function(){
				throw new Error("IMPLEMENT IT, BITCH");
				this._pull();
			},
			_get: function(key){
				if (!(key in this._attribute)) {
					throw new Error("Не знаю ничего про свойство " + key + " атрибута модели " + this.constructor.fullName);
				}
				return this._attribute[key];
			},
			_set: function(key, value){
				if (!(name in this._attribute)) {
					throw new Error("Не знаю ничего про свойство " + key + " атрибута модели " + this.constructor.fullName);
				}

				if (this._attribute[key] != value) {
					this._attribute[key] = value;
					this.setState(wader.AModel.UPDATED);
					this._updated_at = new DateTime(); // Подумать
				};
				return this;
			},
			_push: function(){
				//отправить экземпляр на сервер
				var promise = new $.Deferred();
				$.when(this._dp.set(this.getPrimaryKey(), this.toJson()).done(this.proxy("_onPushDone", promise)).fail(this.proxy("_onPushFail", promise));
			},
			_pull: function(){
				//получить последнюю сохраненную версию с сервера и перезаписать ею экземпляр
				var promise = new $.Deferred();
				$.when(this._dp.get(this.getPrimaryKey()).done(this.proxy("_onPullDone", promise)).fail(this.proxy("_onPullFail", promise));
			},


			_onPullDone: function(data){
				this._updated_at = new DateTime();
				this.setState(wader.AModel.EXIST);
				/*...*/
			},
			_onPullFail: function(data) {

			},
			_onPushDone: function(data){},
			_onPushFail: function(data){},

			_validate: function(){},
			_parse: function(data){},

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
				this._updated_at = new DateTime();
			},

			enable: function () {
				this._disabled = false;
				this._collection.refresh();
				this._updated_at = new DateTime();
			},
			reset: function(){
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

			getState: function () {
				return this._state;
			},

			getPrimaryKey: function() {
				throw new Error("not implemented, fuckin' yeti");
			},

			isValid: function() {
				return Object.keys(this._validate()).length;
			},
		});
	if (ns !== wader) {
		ns.AModel = wader.AModel;
	}
})(window.WADER_NS || window);