/**
 * Wader Abstract Widget
 *
 * @author sc0rp10 <dev@weblab.pro>
 * @version 0.1
 */
(function(ns) {
	"use strict";

	/*
	* @abstract wader.AWidget
	*/
	$.Class.extend("wader.AWidget",

	/* @Static */
	{
	},

	/* @Prototype */
	{
		/*
		* @var container {String} jQuery-селектор элемента, в который 
		*/
		containerSelector: null,
		container: null,
		template: null,
		templatePath: null,
		templateParams: {},
		callbacks: {},
		templateEngine: null,
		_value: null,
		_params: {},
		init: function(params) {
			var that = this;
			this.construct();
			/*
			* временное решение подгрузки шаблона
			*/
			require([this.templatePath], function(template){
				that.templateParams = params.templateParams;
				that.callbacks.open = params.open || new Function();
				that.callbacks.done = params.done || new Function();
				that.callbacks.select = params.select || new Function();
				that.callbacks.close = params.close || new Function();
				that.container = $(params.containerSelector);
				if (params.showImmediately) {
					that.render();
				};
				that._params = params;
			})
		},
		/*
		* Кастомный конструктор
		*/
		construct: function(){},
		/*
		* Вызывается, когда виджет открыт, до рендера
		*/
		open: function () {
			return this.callbacks.open();
		},
		/*
		* Определяется готовность виджета
		*/
		_done: function() {
			throw new Error("not imlemented, yay!");
		},
		/*
		* Вызывается, когда виджет готов
		*/
		done: function () {
			this._done();
			return this.callbacks.done();
		},
		/*
		* Отрисовка виджета
		*/
		render: function () {
			this.container.html(this.templateEngine[this.template](this.templateParams));
			this._bindEvents();
			this.done();
		},
		/*
		* Вызывается по закрытию виджета
		*/
		close: function (key) {
			this.container.html("");
			this.callbacks.close();
		},
		/*
		* Навешиваются DOM-события
		*/
		_bindEvents: function() {
			throw new Error("not imlemented, yay!");
		},
		/*
		* Срабатывает по выбору значения
		*/
		select: function() {
			this.callbacks.select(this._value);
		}
	});

	if (ns !== wader) {
		ns.AWidget = wader.AWidget;
	}
})(window.WADER_NS || window);
