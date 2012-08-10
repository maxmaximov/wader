var _key = null;

var cd = function(key) {
	if (!key) {
		return _key = null;
	};
	_key = key;
};
var cat = function(id) {
	if (_key === null) {
		return "select namespace";
	};
	return App.getInstance().models[_key].getByModelId(id);
};
var ls = function() {
	if (_key === null) {
		var models = App.getInstance().models,
			result = [];
		for (var model in models) {
			result.push(model);
		}
		return result;
	};
	return App.getInstance().models[_key].toArray().objects.map(function(item) {
		return item.model_id;
	});
};
var rm = function(id) {
	if (_key === null) {
		return "select namespace";
	};
	return App.getInstance().models[_key].getByModelId(id).remove();
};
var pwd = function() {
	if (_key === null) {
		return "/";
	};
	return _key;
};
var touch = function(summary) {
	if (_key === null) {
		return "select namespace";
	};
	var e = new App.getInstance().models[_key.replace("s", "")];
	e.setSummary(summary);
	return e;
};